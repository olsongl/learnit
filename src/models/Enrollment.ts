import { Schema, model, models } from "mongoose";

const progressSchema = new Schema(
  {
    completedLessons: [{ type: Schema.Types.ObjectId, ref: "Lesson" }],
    lastAccessedLesson: { type: Schema.Types.ObjectId, ref: "Lesson" },
    percentComplete: { type: Number, default: 0 },
  },
  { _id: false }
);

const enrollmentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    pricePaid: { type: Number, default: 0 },
    pricingModelAtPurchase: { type: String },
    stripePaymentIntentId: { type: String },
    stripeSubscriptionId: { type: String },
    status: {
      type: String,
      enum: ["active", "cancelled", "expired", "refunded"],
      default: "active",
    },
    progress: { type: progressSchema, default: () => ({}) },
    enrolledAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });
enrollmentSchema.index({ userId: 1, status: 1 });

const Enrollment =
  models.Enrollment || model("Enrollment", enrollmentSchema);

export default Enrollment;
