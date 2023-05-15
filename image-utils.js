import Jimp from "jimp";

/**
 * @param {Buffer} buffer
 * @returns {Promise<Buffer>}
 */
export async function coverImage(buffer) {
    const image = await Jimp.read(buffer).catch(() => null);
    image.cover(512, 512);
    return await image.getBufferAsync(Jimp.MIME_JPEG).catch(() => null);
}

/**
 * @param {Buffer} buffer
 * @returns {Promise<Buffer>}
 */
export async function fillImage(buffer) {
    const image = await Jimp.read(buffer).catch(() => null);
    image.resize(512, 512);
    return await image.getBufferAsync(Jimp.MIME_JPEG).catch(() => null);
}

/**
 * Convert image to JPEG
 *
 * @param {Buffer} buffer
 * @returns {Promise<Buffer>}
 */
export async function convertToJpeg(buffer) {
    const image = await Jimp.read(buffer).catch(() => null);
    return await image.getBufferAsync(Jimp.MIME_JPEG).catch(() => null);
}
