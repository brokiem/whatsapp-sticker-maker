import Jimp from "jimp";
import {fileTypeFromBuffer} from "file-type";

/**
 * @param {Buffer} buffer
 * @returns {Promise<Buffer>}
 */
export async function coverImage(buffer) {
    const image = await Jimp.read(buffer);
    image.cover(512, 512);
    return await image.getBufferAsync(Jimp.MIME_JPEG);
}

/**
 * @param {Buffer} buffer
 * @returns {Promise<Buffer>}
 */
export async function fillImage(buffer) {
    const image = await Jimp.read(buffer);
    image.resize(512, 512);
    return await image.getBufferAsync(Jimp.MIME_JPEG);
}

/**
 * Convert image to JPEG
 *
 * @param {Buffer} buffer
 * @returns {Promise<Buffer>}
 */
export async function convertToJpeg(buffer) {
    const image = await Jimp.read(buffer);
    return await image.getBufferAsync(Jimp.MIME_JPEG);
}

/**
 * Check if buffer is an image
 *
 * @param {Buffer} buffer
 * @returns {Promise<boolean>}
 */
export async function isImage(buffer) {
    const fileType = await fileTypeFromBuffer(buffer);
    const mime = fileType.mime;
    const supportedFormats = ['image/gif', 'image/jpeg', 'image/png'];
    return supportedFormats.includes(mime);
}
