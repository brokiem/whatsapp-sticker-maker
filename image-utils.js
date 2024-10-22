import {Jimp,JimpMime} from "jimp";
import {fileTypeFromBuffer} from "file-type";

/**
 * @param {Buffer} buffer
 * @param mimeType
 * @returns {Promise<Buffer>}
 */
export async function coverImage(buffer, mimeType = JimpMime.jpeg) {
    const image = await Jimp.read(buffer);
    image.cover({ w: 512, h: 512 });
    return await image.getBuffer(mimeType);
}

/**
 * @param {Buffer} buffer
 * @param mimeType
 * @returns {Promise<Buffer>}
 */
export async function fillImage(buffer, mimeType = JimpMime.jpeg) {
    const image = await Jimp.read(buffer);
    image.resize({ w: 512, h: 512 });
    return await image.getBuffer(mimeType);
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
    return await image.getBuffer(mimeType);
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
