import { Schema, model, models } from "mongoose";

const credentialSchema = new Schema(
  {
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["certificate", "diploma", "license", "resume", "other"],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    issuingOrganization: { type: String, required: true, trim: true },
    issueDate: { type: Date, required: true },
    expiryDate: { type: Date },
    fileUrl: { type: String, required: true },
    verifiedByAdmin: { type: Boolean, default: false },
    adminNotes: { type: String, default: "" },
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

credentialSchema.index({ teacherId: 1, verifiedByAdmin: 1 });

const Credential =
  models.Credential || model("Credential", credentialSchema);

export default Credential;
