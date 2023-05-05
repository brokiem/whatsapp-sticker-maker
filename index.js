import wweb, {Client} from "whatsapp-web.js";
const {LocalAuth, MessageMedia, MessageTypes} = wweb;
import Jimp from "jimp";
import {getUptime, streamToBuffer} from "./utils.js";

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: process.env.AUTH_DATA_PATH || './data/.wwebjs_auth/'
    }),
    puppeteer: {
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
            await client.sendMessage(msg.from, 'Available commands:\n - !help\n - !sticker\n - !sticker full\n - !sticker fill\n - !sticker <@mention>\n - !stats');
            break;
        case '!sticker':
            await client.sendMessage(msg.from, 'Processing your sticker...');

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
                    stickerAuthor: 'Sticker Pack',
                    stickerName: 'broki\'s bot'
                });
                return;
            }

            if (msg.hasMedia) {
                if (msg.type === MessageTypes.IMAGE || msg.type === MessageTypes.VIDEO) {
                    const media = await msg.downloadMedia();

                    if (args.length > 0) {
                        switch (args[0]) {
                            case 'full':
                                const buffer = Buffer.from(media.data, 'base64');
                                const image = await Jimp.read(buffer);
                                image.cover(512, 512);
                                const buf = await image.getBufferAsync(Jimp.MIME_JPEG);
                                media.data = buf.toString('base64');
                                break;
                            case 'fill':
                                const buffer2 = Buffer.from(media.data, 'base64');
                                const image2 = await Jimp.read(buffer2);
                                image2.contain(512, 512);
                                const buf2 = await image2.getBufferAsync(Jimp.MIME_JPEG);
                                media.data = buf2.toString('base64');
                                break;
                        }
                    }

                    await client.sendMessage(msg.from, media, {
                        sendMediaAsSticker: true,
                        caption: 'Here\'s your sticker!',
                        stickerAuthor: 'Sticker Pack',
                        stickerName: 'broki\'s bot'
                    })
                }
            } else if (msg.hasQuotedMsg) {
                const quotedMsg = await msg.getQuotedMessage();
                if (!quotedMsg.hasMedia) {
                    await msg.reply('Reply a message with image/video to create a sticker')
                    return
                }

                if (quotedMsg.type === MessageTypes.IMAGE || quotedMsg.type === MessageTypes.VIDEO) {
                    let media = await quotedMsg.downloadMedia()

                    if (args.length > 0) {
                        switch (args[0]) {
                            case 'full':
                                const buffer = Buffer.from(media.data, 'base64');
                                const image = await Jimp.read(buffer);
                                image.cover(512, 512);
                                const buf = await image.getBufferAsync(Jimp.MIME_JPEG);
                                media.data = buf.toString('base64');
                                break;
                            case 'fill':
                                const buffer2 = Buffer.from(media.data, 'base64');
                                const image2 = await Jimp.read(buffer2);
                                image2.contain(512, 512);
                                const buf2 = await image2.getBufferAsync(Jimp.MIME_JPEG);
                                media.data = buf2.toString('base64');
                                break;
                        }
                    }

                    await client.sendMessage(msg.from, media, {
                        sendMediaAsSticker: true,
                        caption: 'Here\'s your sticker!',
                        stickerAuthor: 'Sticker Pack',
                        stickerName: 'broki\'s bot'
                    });
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

