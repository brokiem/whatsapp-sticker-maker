import Jimp from "jimp";

export async function coverImage(buffer) {
    const image = await Jimp.read(buffer);
    image.cover(512, 512);
    return await image.getBufferAsync(Jimp.MIME_JPEG);
}

export async function fillImage(buffer) {
    const image = await Jimp.read(buffer);
    image.resize(512, 512);
    return await image.getBufferAsync(Jimp.MIME_JPEG);
}

export async function convertToJpeg(buffer) {
    const image = await Jimp.read(buffer);
    return await image.getBufferAsync(Jimp.MIME_JPEG);
}
