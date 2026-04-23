import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    sell_price: { type: Number, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    displayType: { type: Number, default: 1 },
    displayHot: { type: Number, default: 1 },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ displayHot: 1, displayType: 1, updatedAt: -1 });
productSchema.index({ displayType: 1, updatedAt: -1 });

const Product = mongoose.model("Product", productSchema);

export default Product;
