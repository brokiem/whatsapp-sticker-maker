import wweb, {Client} from "whatsapp-web.js";
const {LocalAuth, MessageMedia, MessageTypes} = wweb;
import {getUptime, streamToBuffer} from "./utils.js";
import {convertImage, coverImage, fillImage, isImage} from "./image-utils.js";
import {fileTypeFromBuffer} from "file-type";
import {readdirSync, rmdirSync} from "fs";

const DEFAULT_STICKER_NAME = 'Sticker Pack';

console.log("Starting up...");

const client = new Client({
    ffmpegPath: process.env.FFMPEG_PATH || '/usr/bin/ffmpeg',
    authStrategy: new LocalAuth({
        dataPath: process.env.AUTH_DATA_PATH || './data/.wwebjs_auth/'
    }),
    puppeteer: {
        executablePath: process.env.GOOGLE_CHROME_PATH || '/usr/bin/google-chrome-stable',
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    }
});

client.on('qr', (qr) => {
    console.log('First time login, scan QR Code:', qr);
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async (msg) => {
    const command = msg.body.toLowerCase().split(' ')[0];
    const args = msg.body.split(' ').slice(1);

    switch (command) {
        case '!help':
            await client.sendMessage(msg.from, 'Available commands:\n - !sticker <stickerName>\n - !sticker full <stickerName>\n - !sticker fill <stickerName>\n - !sticker <@mention> <stickerName>\n - !sticker <url> <full|fill> <stickerName>\n - !stats');
            break;
        case '!sticker':
            let stickerName = DEFAULT_STICKER_NAME;

            const mentions = await msg.getMentions();
            if (mentions.length > 0) {
                const contact = mentions[0];
                const url = await contact.getProfilePicUrl();
                if (!url) {
                    await client.sendMessage(msg.from, 'This contact has no profile picture.');
                    return;
                }

                const readableStream = await fetch(url).then(r => r.body).catch(() => null);
                if (!readableStream) {
                    await client.sendMessage(msg.from, 'Failed to fetch profile picture.');
                    return;
                }

                const buf = await streamToBuffer(readableStream);
                if (!(await isImage(buf))) {
                    await client.sendMessage(msg.from, 'Only images are supported.');
                    return;
                }

                const media = new MessageMedia('image/jpeg', buf.toString('base64'));
                await sendSticker(msg, media, args[1] ?? DEFAULT_STICKER_NAME);
                return;
            }

            if (msg.hasMedia) {
                if (msg.type === MessageTypes.IMAGE || msg.type === MessageTypes.VIDEO) {
                    const media = await msg.downloadMedia();
                    if (!media) {
                        await msg.reply('Failed to download media, try again later.')
                        return
                    }

                    stickerName = args[0] ?? DEFAULT_STICKER_NAME;

                    if (msg.type === MessageTypes.IMAGE) {
                        if (args.length > 0) {
                            const buffer = Buffer.from(media.data, 'base64');
                            switch (args[0]) {
                                case 'full':
                                    stickerName = args[1] ?? DEFAULT_STICKER_NAME;
                                    media.data = (await coverImage(buffer)).toString('base64');
                                    break;
                                case 'fill':
                                    stickerName = args[1] ?? DEFAULT_STICKER_NAME;
                                    media.data = (await fillImage(buffer)).toString('base64');
                                    break;
                            }
                        }
                    }

                    await sendSticker(msg, media, stickerName);
                } else {
                    await msg.reply('Only images and videos are supported.');
                }
            } else if (msg.hasQuotedMsg) {
                const quotedMsg = await msg.getQuotedMessage();
                if (!quotedMsg.hasMedia) {
                    await msg.reply('Reply a message with image/video to create a sticker')
                    return
                }

                if (quotedMsg.type === MessageTypes.IMAGE || quotedMsg.type === MessageTypes.VIDEO) {
                    let media = await quotedMsg.downloadMedia();
                    if (!media) {
                        await msg.reply('Failed to download media, try again later.')
                        return
                    }

                    stickerName = args[0] ?? DEFAULT_STICKER_NAME;

                    if (quotedMsg.type === MessageTypes.IMAGE) {
                        if (args.length > 0) {
                            const buffer = Buffer.from(media.data, 'base64');
                            switch (args[0]) {
                                case 'full':
                                    stickerName = args[1] ?? DEFAULT_STICKER_NAME;
                                    media.data = (await coverImage(buffer)).toString('base64');
                                    break;
                                case 'fill':
                                    stickerName = args[1] ?? DEFAULT_STICKER_NAME;
                                    media.data = (await fillImage(buffer)).toString('base64');
                                    break;
                            }
                        }
                    }

                    await sendSticker(msg, media, stickerName);
                } else {
                    await msg.reply('Only images and videos are supported.');
                }
            } else {
                if (args.length > 0) {
                    const url = args[0];
                    const readableStream = await fetch(url).then(r => r.body).catch(() => null);
                    if (!readableStream) {
                        await client.sendMessage(msg.from, 'Failed to fetch media.');
                        return;
                    }

                    const buffer = await streamToBuffer(readableStream);
                    if (!(await isImage(buffer))) {
                        await client.sendMessage(msg.from, 'Only images are supported.');
                        return;
                    }

                    stickerName = args[1] ?? DEFAULT_STICKER_NAME;

                    const fileType = await fileTypeFromBuffer(buffer);
                    const mime = fileType?.mime ?? '';
                    let imageBuf = mime === 'image/gif' ? buffer : await convertImage(buffer, 'image/jpeg');
                    switch (args[1] || '') {
                        case 'full':
                            stickerName = args[2] ?? DEFAULT_STICKER_NAME;
                            imageBuf = await coverImage(imageBuf, mime);
                            break;
                        case 'fill':
                            stickerName = args[2] ?? DEFAULT_STICKER_NAME;
                            imageBuf = await fillImage(imageBuf, mime);
                            break;
                    }

                    const media = new MessageMedia('image/jpeg', imageBuf.toString('base64'));
                    await sendSticker(msg, media, stickerName);
                } else {
                    await client.sendMessage(msg.from, 'Please send/reply to an image or video to convert it to a sticker.');
                }
            }
            break;
        case "!stats":
            await msg.reply(
                "RAM Usage: " + (Math.round(process.memoryUsage().rss / 10485.76) / 100).toFixed(1) + " MB\n" +
                "Uptime: " + getUptime()
            )
            break
    }
});

/**
 * @param {Message} msg
 * @param {MessageContent} media
 * @param {string} stickerName
 * @returns {Promise<void>}
 */
async function sendSticker(msg, media, stickerName) {
    await client.sendMessage(msg.from, `Processing your sticker (${stickerName})...`);
    await client.sendMessage(msg.from, media, {
        sendMediaAsSticker: true,
        stickerAuthor: 'broki\'s bot',
        stickerName: stickerName
    });
}

process.on("SIGINT", async () => {
    console.log("(SIGINT) Shutting down...");
    await client.destroy();
    process.exit(0);
})

process.on("SIGTERM", async () => {
    console.log("(SIGTERM) Shutting down...");
    await client.destroy();
    process.exit(0);
})

await client.initialize();

