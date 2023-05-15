import Jimp from "jimp";

export async function coverImage(buffer) {
    const image = await Jimp.read(buffer);
    image.cover(512, 512);
    const buf = await image.getBufferAsync(Jimp.MIME_JPEG);
    return buf.toString('base64');
}

export async function fillImage(buffer) {
    const image = await Jimp.read(buffer);
    image.resize(512, 512);
    const buf = await image.getBufferAsync(Jimp.MIME_JPEG);
    return buf.toString('base64');
}

export async function convertToJpeg(buffer) {
    const image = await Jimp.read(buffer);
    return await image.getBufferAsync(Jimp.MIME_JPEG);
}
