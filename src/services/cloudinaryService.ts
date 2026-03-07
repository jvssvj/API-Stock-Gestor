import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
})

export interface CloudinaryUploadResult {
    url: string
    publicId: string
}

export const cloudinaryService = {
    upload: async (fileBuffer: Buffer, folderPath: string): Promise<CloudinaryUploadResult> => {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: folderPath,
                    transformation: [{ width: 800, height: 500, crop: "limit" }]
                },
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