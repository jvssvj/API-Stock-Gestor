import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

export const cloudinaryService = {
    upload: async (fileBuffer: Buffer, folderPath: string) => {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: folderPath,
                    transformation: [{ width: 800, height: 500, crop: "limit" }]
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve({
                        url: result?.secure_url,
                        publicId: result?.public_id
                    });
                }
            ).end(fileBuffer);
        });
    },

    delete: async (publicId: string) => {
        if (!publicId) return;
        await cloudinary.uploader.destroy(publicId);
    }
};