import wweb, {Client} from "whatsapp-web.js";
const {LocalAuth, MessageMedia, MessageTypes} = wweb;
import {getUptime, streamToBuffer} from "./utils.js";
import {coverImage, fillImage} from "./image-utils.js";

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
            await client.sendMessage(msg.from, 'Available commands:\n - !help\n - !sticker <stickerName>\n - !sticker full <stickerName>\n - !sticker fill <stickerName>\n - !sticker <@mention> <stickerName>\n - !stats');
            break;
        case '!sticker':
            const stickerName = args[1] ?? args[0] ?? 'Sticker Pack';
            await client.sendMessage(msg.from, `Processing your sticker (${stickerName})...`);

            const mentions = await msg.getMentions();
            if (mentions.length > 0) {
                const contact = mentions[0];
                const url = await contact.getProfilePicUrl();
                if (!url) {
                    await client.sendMessage(msg.from, 'This contact has no profile picture.');
                    return;
                }
                const readableStream = await fetch(url).then(r => r.body);
                if (!readableStream) {
                    await client.sendMessage(msg.from, 'Failed to fetch profile picture.');
                    return;
                }
                const buf = await streamToBuffer(readableStream);
                const media = new MessageMedia('image/jpeg', buf.toString('base64'));
                await client.sendMessage(msg.from, media, {
                    sendMediaAsSticker: true,
                    caption: 'Here\'s your sticker!',
                    stickerAuthor: 'broki\'s bot',
                    stickerName: stickerName
                });
                return;
            }

            if (msg.hasMedia) {
                if (msg.type === MessageTypes.IMAGE || msg.type === MessageTypes.VIDEO) {
                    const media = await msg.downloadMedia();
                    if (!media) {
                        await msg.reply('Failed to download media, try again later.')
                        return
                    }

                    if (msg.type === MessageTypes.IMAGE) {
                        if (args.length > 0) {
                            switch (args[0]) {
                                case 'full':
                                    const buffer = Buffer.from(media.data, 'base64');
                                    media.data = await coverImage(buffer);
                                    break;
                                case 'fill':
                                    const buffer2 = Buffer.from(media.data, 'base64');
                                    media.data = await fillImage(buffer2);
                                    break;
                            }
                        }
                    }

                    await client.sendMessage(msg.from, media, {
                        sendMediaAsSticker: true,
                        caption: 'Here\'s your sticker!',
                        stickerAuthor: 'broki\'s bot',
                        stickerName: stickerName
                    })
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

                    if (quotedMsg.type === MessageTypes.IMAGE) {
                        if (args.length > 0) {
                            switch (args[0]) {
                                case 'full':
                                    const buffer = Buffer.from(media.data, 'base64');
                                    media.data = await coverImage(buffer);
                                    break;
                                case 'fill':
                                    const buffer2 = Buffer.from(media.data, 'base64');
                                    media.data = await fillImage(buffer2);
                                    break;
                            }
                        }
                    }

                    await client.sendMessage(msg.from, media, {
                        sendMediaAsSticker: true,
                        caption: 'Here\'s your sticker!',
                        stickerAuthor: 'broki\'s bot',
                        stickerName: stickerName
                    });
                } else {
                    await msg.reply('Only images and videos are supported.');
                }
            } else {
                await client.sendMessage(msg.from, 'Please send/reply to an image or video to convert it to a sticker.');
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

process.on("SIGINT", async () => {
    console.log("(SIGINT) Shutting down...");
    await client.destroy();
    process.exit(0);
})

await client.initialize();

