import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import mongoose from "mongoose";
import Blog from "../models/blog.model.js";

const HOME_CACHE_TTL_MS = 60 * 1000;
const endpointCache = new Map();

const buildAssetUrl = (fileName) =>
  `https://bamosbe-production.up.railway.app/assets/${fileName}`;

const getCachedPayload = (key) => {
  const cached = endpointCache.get(key);
  if (!cached) return null;

  if (cached.expiresAt < Date.now()) {
    endpointCache.delete(key);
    return null;
  }

  return cached.payload;
};

const setCachedPayload = (key, payload, ttlMs = HOME_CACHE_TTL_MS) => {
  endpointCache.set(key, {
    payload,
    expiresAt: Date.now() + ttlMs,
  });
};

const applyPublicApiCacheHeaders = (res) => {
  res.set(
    "Cache-Control",
    "public, max-age=60, s-maxage=300, stale-while-revalidate=300"
  );
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Id không hợp lệ",
      });
    }

    const product = await Product.findById(id).populate("category", "name");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Sản phẩm không tồn tại",
      });
    }

    const productWithFullImagePath = {
      ...product.toObject(),
      image: `https://bamosbe-production.up.railway.app/assets/${product.image}`,
    };

    res.status(200).json({
      success: true,
      data: productWithFullImagePath,
    });
  } catch (error) {
    console.error("Error fetching product by ID:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

export const getHotProducts = async (req, res) => {
  try {
    const cacheKey = "hotProducts";
    const cachedData = getCachedPayload(cacheKey);
    if (cachedData) {
      applyPublicApiCacheHeaders(res);
      return res.status(200).json({ success: true, data: cachedData });
    }

    const filter = {
      displayHot: 1,
      displayType: 1,
    };

    const products = await Product.find(filter)
      .sort({ updatedAt: -1 })
      .limit(8)
      .select("name image price sell_price category displayType displayHot updatedAt")
      .populate("category", "name")
      .lean();

    const productsWithFullImagePath = products.map((product) => ({
      ...product,
      image: buildAssetUrl(product.image),
    }));

    setCachedPayload(cacheKey, productsWithFullImagePath);
    applyPublicApiCacheHeaders(res);
    res.status(200).json({
      success: true,
      data: productsWithFullImagePath,
    });
  } catch (error) {
    console.error("Error in fetching filtered products:", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getActiveProducts = async (req, res) => {
  try {
    const filter = {
      displayType: 1,
    };

    const products = await Product.find(filter).populate(
      "category",
      "name isActive"
    );

    const productsWithFullImagePath = products.map((product) => ({
      ...product.toObject(),
      image: `https://bamosbe-production.up.railway.app/assets/${product.image}`,
    }));

    res.status(200).json({
      success: true,
      data: productsWithFullImagePath,
    });
  } catch (error) {
    console.error("Error in fetching filtered products:", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getActiveCategory = async (req, res) => {
  try {
    const cacheKey = "activeCategories";
    const cachedData = getCachedPayload(cacheKey);
    if (cachedData) {
      applyPublicApiCacheHeaders(res);
      return res.status(200).json({ success: true, data: cachedData });
    }

    const categories = await Category.find({ isActive: 1 })
      .sort({ updatedAt: -1 })
      .select("name isActive")
      .lean();

    setCachedPayload(cacheKey, categories);
    applyPublicApiCacheHeaders(res);
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    console.log("Error in fetching categories", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getHomeBootstrapData = async (req, res) => {
  try {
    const cacheKey = "homeBootstrapData";
    const cachedData = getCachedPayload(cacheKey);
    if (cachedData) {
      applyPublicApiCacheHeaders(res);
      return res.status(200).json({ success: true, data: cachedData });
    }

    const [hotProducts, bannerBlogs, hotBlogs] = await Promise.all([
      Product.find({ displayHot: 1, displayType: 1 })
        .sort({ updatedAt: -1 })
        .limit(8)
        .select("name image price sell_price category displayType displayHot updatedAt")
        .populate("category", "name")
        .lean(),
      Blog.find({ displayBanner: 1 })
        .sort({ updatedAt: -1 })
        .limit(5)
        .select("title image")
        .lean(),
      Blog.find({ displayHot: 1 })
        .sort({ updatedAt: -1 })
        .limit(6)
        .select("title image content displayHot displayBanner createdAt updatedAt")
        .lean(),
    ]);

    const payload = {
      hotProducts: hotProducts.map((product) => ({
        ...product,
        image: buildAssetUrl(product.image),
      })),
      bannerBlogs: bannerBlogs.map((blog) => ({
        _id: blog._id,
        title: blog.title,
        image: buildAssetUrl(blog.image),
      })),
      hotBlogs: hotBlogs.map((blog) => ({
        ...blog,
        image: buildAssetUrl(blog.image),
      })),
    };

    setCachedPayload(cacheKey, payload);
    applyPublicApiCacheHeaders(res);
    res.status(200).json({ success: true, data: payload });
  } catch (error) {
    console.error("Error in fetching home bootstrap data:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
