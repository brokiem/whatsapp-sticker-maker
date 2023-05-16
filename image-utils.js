import Jimp from "jimp";
import {fileTypeFromBuffer} from "file-type";

/**
 * @param {Buffer} buffer
 * @param mimeType
 * @returns {Promise<Buffer>}
 */
export async function coverImage(buffer, mimeType = Jimp.MIME_JPEG) {
    const image = await Jimp.read(buffer);
    image.cover(512, 512);
    return await image.getBufferAsync(mimeType);
}

/**
 * @param {Buffer} buffer
 * @param mimeType
 * @returns {Promise<Buffer>}
 */
export async function fillImage(buffer, mimeType = Jimp.MIME_JPEG) {
    const image = await Jimp.read(buffer);
    image.resize(512, 512);
    return await image.getBufferAsync(mimeType);
}

/**
 * Convert image to different format
 *
 * @param {Buffer} buffer
 * @param mimeType
 * @returns {Promise<Buffer>}
 */
export async function convertImage(buffer, mimeType) {
    const image = await Jimp.read(buffer);
    return await image.getBufferAsync(mimeType);
}

/**
 * Check if buffer is an image
 *
 * @param {Buffer} buffer
 * @returns {Promise<boolean>}
 */
export async function isImage(buffer) {
    const fileType = await fileTypeFromBuffer(buffer);
    if (!fileType) return false;

    const mime = fileType.mime;
    const supportedFormats = ['image/gif', 'image/jpeg', 'image/png'];
    return supportedFormats.includes(mime);
}
