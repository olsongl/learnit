import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";
import Transaction from "@/models/Transaction";
import { calculatePriceBreakdown } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  await connectDB();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const metadata = session.metadata || {};

        if (metadata.type === "teacher_subscription") {
          // Teacher platform subscription
          await User.findByIdAndUpdate(metadata.userId, {
            "teacherProfile.subscriptionStatus": "active",
            "teacherProfile.subscriptionId": session.subscription,
          });
        } else if (metadata.courseId) {
          // Course purchase
          const course = await Course.findById(metadata.courseId);
          if (!course) break;

          const existing = await Enrollment.findOne({
            userId: metadata.userId,
            courseId: metadata.courseId,
          });
          if (existing) break;

          const enrollment = await Enrollment.create({
            userId: metadata.userId,
            courseId: metadata.courseId,
            pricePaid: course.price,
            pricingModelAtPurchase: course.pricingModel,
            stripePaymentIntentId: session.payment_intent || session.subscription,
            stripeSubscriptionId: session.subscription || undefined,
            status: "active",
            enrolledAt: new Date(),
          });

          await Course.findByIdAndUpdate(metadata.courseId, {
            $inc: { enrollmentCount: 1 },
          });

          const breakdown = calculatePriceBreakdown(course.price);
          await Transaction.create({
            enrollmentId: enrollment._id,
            teacherId: metadata.teacherId,
            studentId: metadata.userId,
            courseId: metadata.courseId,
            amount: course.price,
            stripeFee: breakdown.stripeFee,
            platformFee: breakdown.platformFee,
            teacherPayout: breakdown.teacherPayout,
            stripePaymentIntentId: session.payment_intent || session.id,
            status: "completed",
          });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription as string;
        if (subscriptionId) {
          await User.findOneAndUpdate(
            { "teacherProfile.subscriptionId": subscriptionId },
            { "teacherProfile.subscriptionStatus": "active" }
          );
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription as string;
        if (subscriptionId) {
          await User.findOneAndUpdate(
            { "teacherProfile.subscriptionId": subscriptionId },
            { "teacherProfile.subscriptionStatus": "past_due" }
          );
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await User.findOneAndUpdate(
          { "teacherProfile.subscriptionId": subscription.id },
          {
            "teacherProfile.subscriptionStatus": "cancelled",
            "teacherProfile.subscriptionId": "",
          }
        );

        // Also expire any monthly course enrollments tied to this subscription
        await Enrollment.updateMany(
          { stripeSubscriptionId: subscription.id },
          { status: "expired" }
        );
        break;
      }

      case "account.updated": {
        // Stripe Connect account update - log for monitoring
        const account = event.data.object;
        console.log(
          `Connect account ${account.id} updated: charges=${account.charges_enabled} payouts=${account.payouts_enabled}`
        );
        break;
      }
    }
  } catch (error) {
    console.error(`Webhook handler error for ${event.type}:`, error);
  }

  return NextResponse.json({ received: true });
}
