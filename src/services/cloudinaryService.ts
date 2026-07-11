import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiOptions } from 'cloudinary';

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

export const cloudinaryService = {
    upload: async (
        fileBuffer: Buffer,
        folderPath: string,
        options: CloudinaryUploadOptions = {}
    ): Promise<CloudinaryUploadResult> => {
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
