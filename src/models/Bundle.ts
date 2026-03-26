import { Schema, model, models } from "mongoose";

const bundleSchema = new Schema(
  {
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    originalTotalPrice: { type: Number, default: 0 },
    bundlePrice: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const Bundle = models.Bundle || model("Bundle", bundleSchema);

export default Bundle;
