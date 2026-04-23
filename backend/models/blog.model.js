import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true, // Bắt buộc phải có ảnh
    },
    title: {
      type: String,
      required: true, // Bắt buộc phải có tiêu đề
      trim: true, // Loại bỏ khoảng trắng thừa
    },
    content: {
      type: String,
      required: true, // Bắt buộc phải có nội dung
    },
    displayHot: { type: Number, default: 1 },
    displayBanner: { type: Number, default: 1 },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

blogSchema.index({ displayHot: 1, updatedAt: -1 });
blogSchema.index({ displayBanner: 1, updatedAt: -1 });

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
