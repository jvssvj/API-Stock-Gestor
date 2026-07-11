import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiOptions } from 'cloudinary';
import { HttpError } from '../errors/HttpError';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
})

export interface CloudinaryUploadResult {
    url: string
    publicId: string
}

type CloudinaryUploadOptions = Pick<UploadApiOptions, "transformation">

const isJpeg = (buffer: Buffer) =>
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff

const isPng = (buffer: Buffer) =>
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a

const isWebp = (buffer: Buffer) =>
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"

const assertAllowedImageBuffer = (buffer: Buffer) => {
    if (!isJpeg(buffer) && !isPng(buffer) && !isWebp(buffer)) {
        throw new HttpError(400, "Arquivo inválido. Envie uma imagem JPG, PNG ou WEBP.")
    }
}

export const cloudinaryService = {
    upload: async (
        fileBuffer: Buffer,
        folderPath: string,
        options: CloudinaryUploadOptions = {}
    ): Promise<CloudinaryUploadResult> => {
        assertAllowedImageBuffer(fileBuffer)

        return new Promise((resolve, reject) => {
            const uploadOptions: UploadApiOptions = {
                folder: folderPath,
                ...options,
            }

            cloudinary.uploader.upload_stream(
                uploadOptions,
                (error, result) => {
                    if (error || !result) return reject(error)
                    resolve({
                        url: result.secure_url,
                        publicId: result.public_id
                    })
                }
            ).end(fileBuffer)
        })
    },

    delete: async (publicId: string) => {
        if (!publicId) return
        await cloudinary.uploader.destroy(publicId)
    }
}
