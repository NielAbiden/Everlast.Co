"use strict";

const path = require("node:path");

const {
    EmbedBuilder,
    AttachmentBuilder
} = require("discord.js");

const config = require("./config");

// ============================================================
// GET PORTAL CHANNEL
// ============================================================

async function getPortalChannel(client) {
    const channel = await client.channels.fetch(
        config.channelId
    );

    if (!channel) {
        throw new Error(
            `Portal channel tidak ditemukan: ${config.channelId}`
        );
    }

    if (!channel.isTextBased()) {
        throw new Error(
            `Portal channel bukan text-based channel: ${config.channelId}`
        );
    }

    return channel;
}

// ============================================================
// WELCOME
// ============================================================

async function sendWelcome(client, member) {
    const channel =
        await getPortalChannel(client);

    const imagePath = path.join(
        __dirname,
        "assets",
        "welcome.png"
    );

    const attachment =
        new AttachmentBuilder(
            imagePath,
            {
                name: "welcome.png"
            }
        );

    const embed =
        new EmbedBuilder()
            .setDescription(
                `👋 **Welcome to Everlast!**\n\n` +
                `Selamat datang ${member}!`
            )
            .setImage(
                "attachment://welcome.png"
            )
            .setTimestamp();

    await channel.send({
        embeds: [
            embed
        ],
        files: [
            attachment
        ]
    });

    console.log(
        `[Portal] Welcome sent: ${member.user.tag}`
    );
}

// ============================================================
// GOODBYE
// ============================================================

async function sendGoodbye(client, member) {
    const channel =
        await getPortalChannel(client);

    const imagePath = path.join(
        __dirname,
        "assets",
        "goodbye.png"
    );

    const attachment =
        new AttachmentBuilder(
            imagePath,
            {
                name: "goodbye.png"
            }
        );

    const embed =
        new EmbedBuilder()
            .setDescription(
                `👋 **Goodbye!**\n\n` +
                `${member.user.tag} telah meninggalkan server.`
            )
            .setImage(
                "attachment://goodbye.png"
            )
            .setTimestamp();

    await channel.send({
        embeds: [
            embed
        ],
        files: [
            attachment
        ]
    });

    console.log(
        `[Portal] Goodbye sent: ${member.user.tag}`
    );
}

// ============================================================
// EXPORT
// ============================================================

module.exports = {
    sendWelcome,
    sendGoodbye
};