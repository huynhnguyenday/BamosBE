import express from "express";
import { connectDB } from "./config/db.js";
import productRoutes from "./routes/product.route.js";
import accountRoutes from "./routes/account.route.js";
import loginRoutes from "./routes/loginForm.route.js";
import categoryRoutes from "./routes/category.route.js";
import blogRoutes from "./routes/blog.route.js";
import mainPage from "./routes/mainPage.route.js";
import couponRoutes from "./routes/coupon.route.js";
import orderRoutes from "./routes/order.route.js";
import reviewRoutes from "./routes/review.route.js";
import newsletterRoutes from "./routes/newsletter.route.js";
import vnpayRoutes from "./routes/vnpay.route.js";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";
import cookieParser from "cookie-parser";
import session from "express-session";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cookieParser());
const corsOptions = {
  origin: "http://localhost:5173", // Origin cụ thể của React frontend
  credentials: true, // Cho phép gửi cookie, token
};
app.use(cors(corsOptions));
app.use(express.json()); //allow accept json req.body
// Tạo biến tương đương __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cấu hình đường dẫn tĩnh cho folder assets
app.use("/assets", express.static(path.join(__dirname, "../backend/assets")));
app.use("/api/blogs", blogRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/mainPages", mainPage);
app.use("/api/auth", loginRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/newsletters", newsletterRoutes);
app.use("/api/vnpay", vnpayRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  connectDB();
  console.log(`Server started on port ${port}...`);
});

app.use(
  session({
    secret: process.env.SESSION_SECRET || "default-session-secret",
    resave: false,
    saveUninitialized: false, // Chỉ lưu session khi cần
    cookie: {
      secure: process.env.NODE_ENV === "production", // Bật secure nếu dùng HTTPS
      httpOnly: true, // Cookie chỉ được truy cập qua HTTP
      sameSite: "strict", // Ngăn chặn CSRF
      maxAge: 1000 * 60 * 60, // Cookie tồn tại trong 1 giờ
    },
  })
);
