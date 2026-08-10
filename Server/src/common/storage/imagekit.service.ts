import { imageKit } from "@/config/imagekit";


class ImageKitStorageService {

    upload = async (
        file: Express.Multer.File,
        folder: string
    ) => {

        const result = await imageKit.upload({
            file: file.buffer,
            fileName: file.originalname,
            folder,
            useUniqueFileName: true,
        });

        return {
            fileId: result.fileId,
            url: result.url,
            filePath: result.filePath,
            name: result.name,
            size: result.size,
            mimeType: file.mimetype,
        };
    };

    delete = async (fileId: string) => {
        await imageKit.deleteFile(fileId);
    };
}

export default new ImageKitStorageService();