import fs from "fs";
import path from "path";
import multer from "multer";
import { env } from "../config/env";
import { ApiError } from "../utils/apiError";

const uploadPath = path.join(process.cwd(), env.upload.dir, "products");
fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadPath),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

function fileFilter(_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.mimetype)) {
    return cb(ApiError.badRequest("Formato de imagem inválido. Use JPG, PNG ou WEBP.") as unknown as Error);
  }
  cb(null, true);
}

export const uploadProductPhoto = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.upload.maxFileSizeMb * 1024 * 1024 },
}).single("photo");
