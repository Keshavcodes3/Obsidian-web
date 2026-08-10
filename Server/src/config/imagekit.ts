import { envConfig } from "./env";
import ImageKit from "imagekit"

export const imageKit = new ImageKit({
    publicKey: envConfig.IMAGEKIT_PUBLIC_KEY,
    privateKey: envConfig.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: envConfig.IMAGEKIT_ENDPOINT,
});