import { Schema, model, models } from "mongoose";

const transactionSchema = new Schema(
  {
    enrollmentId: {
      type: Schema.Types.ObjectId,
      ref: "Enrollment",
      required: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    amount: { type: Number, required: true },
    stripeFee: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    teacherPayout: { type: Number, required: true },
    stripePaymentIntentId: { type: String, required: true },
    stripeTransferId: { type: String },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ teacherId: 1, createdAt: -1 });
transactionSchema.index({ status: 1 });

const Transaction =
  models.Transaction || model("Transaction", transactionSchema);

export default Transaction;
