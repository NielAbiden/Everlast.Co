"use strict";

const {
    SlashCommandBuilder
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription(
            "Cek status Everlast dan jaringan Discord."
        ),

    async execute(interaction) {

        const sent =
            await interaction.reply({
                content: "🏓 Mengecek jaringan...",
                fetchReply: true
            });

        const responseLatency =
            sent.createdTimestamp -
            interaction.createdTimestamp;

        const websocketPing =
            interaction.client.ws.ping;

        await interaction.editReply({
            content:
                "🏓 **Everlast aktif!**\n\n" +
                `🤖 Bot: \`${responseLatency}ms\`\n` +
                `🌐 Jaringan Discord: \`${websocketPing}ms\``
        });
    }
};