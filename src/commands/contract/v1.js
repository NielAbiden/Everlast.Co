"use strict";

const {
    SlashCommandBuilder
} = require("discord.js");

const contract =
    require("../../features/contract");

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName("v1")
            .setDescription(
                "Mengirim contract pekerjaan Everlast.Co Workshop."
            )
            .addUserOption(option =>
                option
                    .setName("username")
                    .setDescription(
                        "User yang akan menerima contract."
                    )
                    .setRequired(true)
            ),

    async execute(interaction) {

        console.log(
            `[Contract] /v1 dipanggil oleh ${interaction.user.tag}`
        );

        if (!interaction.guild) {
            await interaction.reply({
                content:
                    "❌ Command ini hanya dapat digunakan di server.",
                flags: 64
            });
            return;
        }

        if (
            !interaction.member ||
            !contract.services.hasAuthorizedRole(
                interaction.member
            )
        ) {
            await interaction.reply({
                content:
                    "❌ Anda tidak memiliki izin untuk membuat contract.",
                flags: 64
            });
            return;
        }

        const targetUser =
            interaction.options.getUser(
                "username"
            );

        if (!targetUser) {
            await interaction.reply({
                content:
                    "❌ User tidak ditemukan.",
                flags: 64
            });
            return;
        }

        if (
            targetUser.id ===
            interaction.user.id
        ) {
            await interaction.reply({
                content:
                    "❌ Anda tidak dapat membuat contract untuk diri sendiri.",
                flags: 64
            });
            return;
        }

        // ACK interaction SEBELUM melakukan request API
        await interaction.deferReply({
            flags: 64
        });

        const targetMember =
            await interaction.guild.members
                .fetch(targetUser.id)
                .catch(() => null);

        if (!targetMember) {
            await interaction.editReply({
                content:
                    "❌ User tersebut bukan member dari server ini."
            });
            return;
        }

        try {

            await contract.createContract(
                interaction,
                targetUser
            );

            await interaction.editReply({
                content:
                    `✅ Contract berhasil dikirim ke ${targetUser}.`
            });

            console.log(
                `[Contract] Contract berhasil dibuat untuk ${targetUser.tag}.`
            );

        } catch (error) {

            console.error(
                "❌ CONTRACT CREATE ERROR |",
                error
            );

            await interaction.editReply({
                content:
                    "❌ Gagal mengirim contract. Pastikan user dapat menerima DM dari bot."
            });
        }
    }
};