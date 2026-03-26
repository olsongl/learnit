import { Schema, model, models } from "mongoose";

const reviewSchema = new Schema(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    isVerifiedPurchase: { type: Boolean, default: true },
    helpfulCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ courseId: 1, userId: 1 }, { unique: true });
reviewSchema.index({ courseId: 1, rating: -1 });

const Review = models.Review || model("Review", reviewSchema);

export default Review;
