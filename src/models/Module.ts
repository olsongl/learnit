import { Schema, model, models } from "mongoose";

const moduleSchema = new Schema(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

moduleSchema.index({ courseId: 1, order: 1 });

const Module = models.Module || model("Module", moduleSchema);

export default Module;
