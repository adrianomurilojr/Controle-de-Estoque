import path from "path";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

if (env.nodeEnv === "development") {
  app.use(morgan("dev"));
}

// Serve as imagens de produtos enviadas via upload
app.use("/uploads", express.static(path.join(process.cwd(), env.upload.dir)));

app.use("/api", routes);

app.use((_req, res) => {
  res.status(404).json({ message: "Rota não encontrada." });
});

app.use(errorHandler);

export default app;
