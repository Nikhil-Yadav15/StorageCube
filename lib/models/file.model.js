import { Schema, model, models } from "mongoose";

const fileSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["document", "image", "video", "audio", "other"],
      required: true,
    },
    extension: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    users: {
      type: [String],
    },
    bucketFileId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const File = models?.File || model("File", fileSchema);

export default File;
