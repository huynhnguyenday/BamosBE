import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
      unique: true,
    },
    isActive: { type: Number, default: 1 },
  },
  {
    timestamps: true,
  }
);

categorySchema.index({ isActive: 1, updatedAt: -1 });

const Category = mongoose.model("Category", categorySchema);

export default Category;
