import { Schema, model, models } from "mongoose";

const tierSchema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    features: [{ type: String }],
  },
  { _id: false }
);

const priceBreakdownSchema = new Schema(
  {
    listPrice: { type: Number, default: 0 },
    stripeFee: { type: Number, default: 0 },
    platformFee: { type: Number, default: 0 },
    teacherPayout: { type: Number, default: 0 },
  },
  { _id: false }
);

const courseSchema = new Schema(
  {
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    shortDescription: { type: String, default: "" },
    thumbnail: { type: String, default: "" },
    promoVideo: { type: String },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    subCategory: { type: Schema.Types.ObjectId, ref: "Category" },
    tags: [{ type: String }],
    pricingModel: {
      type: String,
      enum: ["free", "one_time", "monthly", "tiered"],
      default: "free",
    },
    price: { type: Number, default: 0 },
    tiers: [tierSchema],
    bundleId: { type: Schema.Types.ObjectId, ref: "Bundle" },
    priceBreakdown: { type: priceBreakdownSchema, default: () => ({}) },
    totalDuration: { type: Number, default: 0 },
    totalLessons: { type: Number, default: 0 },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "all_levels"],
      default: "all_levels",
    },
    language: { type: String, default: "English" },
    status: {
      type: String,
      enum: ["draft", "pending_review", "published", "archived"],
      default: "draft",
    },
    publishedAt: { type: Date },
    featured: { type: Boolean, default: false },
    enrollmentCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

courseSchema.index({ slug: 1 });
courseSchema.index({ status: 1, featured: -1 });
courseSchema.index({ category: 1, status: 1 });
courseSchema.index({ title: "text", description: "text", tags: "text" });

const Course = models.Course || model("Course", courseSchema);

export default Course;
