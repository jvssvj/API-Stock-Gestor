import multer from "multer";
import { HttpError } from "../errors/HttpError";

const storage = multer.memoryStorage()

export const uploadMiddleware = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"]
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new HttpError(400, "Apenas imagens (JPG, PNG, WEBP) são permitidas!"))
        }
    }
})