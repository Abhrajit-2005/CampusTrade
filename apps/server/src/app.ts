import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import healthRouter from "./routes/health.routes";
import { errorMiddleware } from "./middlewares/error.middleware";
import authRouter from "./routes/auth.routes";
import collegeAdminRouter from "./routes/college-admin.routes.js";
import platformAdminRoutes from "./routes/platform-admin.routes.js";
import userRouter from "./routes/user.routes.js";
import itemRouter from "./routes/item.routes.js";
import categoryRouter from "./routes/category.routes.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}
app.use("/api/v1/health", healthRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/college-admin", collegeAdminRouter);
app.use("/api/v1/platform-admin", platformAdminRoutes);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/items", itemRouter);
app.use("/api/v1/categories", categoryRouter);


app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});
app.use(errorMiddleware);


export default app;