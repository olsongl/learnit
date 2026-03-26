import { Schema, model, models } from "mongoose";

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: "" },
    icon: { type: String, default: "" },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

categorySchema.index({ parentId: 1, order: 1 });
categorySchema.index({ slug: 1 });

const Category = models.Category || model("Category", categorySchema);

export default Category;
