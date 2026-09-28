import { Router, Request, Response } from "express";
import { authenticate } from "../../middlewares/auth";
import { uploadProductPhoto } from "../../middlewares/upload";
import { ApiError } from "../../utils/apiError";

const router = Router();

router.use(authenticate);

router.post("/product-photo", (req: Request, res: Response, next) => {
  uploadProductPhoto(req, res, (err: unknown) => {
    if (err) return next(err instanceof Error ? err : ApiError.badRequest("Falha no upload da imagem."));
    if (!req.file) return next(ApiError.badRequest("Nenhum arquivo enviado."));

    const url = `/uploads/products/${req.file.filename}`;
    res.status(201).json({ url });
  });
});

export default router;
