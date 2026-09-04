"use strict";

const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require("discord.js");

const config =
    require("./config");

// ========================================================
// CONTRACT STORAGE
// ========================================================

const activeContracts =
    new Map();

// ========================================================
// AUTHORIZATION
// ========================================================

function hasAuthorizedRole(member) {

    if (!member) {
        return false;
    }

    return member.roles.cache.has(
        config.authorizedRoleId
    );
}

// ========================================================
// GET GUILD MEMBER
// ========================================================

async function getGuildMember(
    client,
    guildId,
    userId
) {

    const guild =
        await client.guilds.fetch(
            guildId
        );

    if (!guild) {

        throw new Error(
            `Guild tidak ditemukan: ${guildId}`
        );
    }

    const member =
        await guild.members.fetch(
            userId
        );

    if (!member) {

        throw new Error(
            `Member tidak ditemukan: ${userId}`
        );
    }

    return member;
}

// ========================================================
// SEND CONTRACT DM
// ========================================================

async function sendContractDM(
    targetUser,
    issuer,
    guildId
) {

    const acceptButton =
        new ButtonBuilder()
            .setCustomId(
                `contract:v1:accept:${targetUser.id}`
            )
            .setLabel(
                config.contract.acceptLabel
            )
            .setStyle(
                ButtonStyle.Success
            );

    const rejectButton =
        new ButtonBuilder()
            .setCustomId(
                `contract:v1:reject:${targetUser.id}`
            )
            .setLabel(
                config.contract.rejectLabel
            )
            .setStyle(
                ButtonStyle.Danger
            );

    const row =
        new ActionRowBuilder()
            .addComponents(
                acceptButton,
                rejectButton
            );

    const embed =
        new EmbedBuilder()
            .setTitle(
                config.contract.title
            )
            .setDescription(
                config.contract.description
            )
            .addFields({
                name: "Contract dari",
                value: `${issuer}`,
                inline: false
            })
            .setTimestamp();

    // Simpan data contract secara internal.
    activeContracts.set(
        targetUser.id,
        {
            guildId,
            issuerId: issuer.id,
            targetUserId: targetUser.id
        }
    );

    await targetUser.send({
        embeds: [
            embed
        ],
        components: [
            row
        ]
    });

    console.log(
        `[Contract] Contract dikirim ke ${targetUser.tag}.`
    );
}

// ========================================================
// ACCEPT CONTRACT
// ========================================================

async function acceptContract(
    interaction,
    contractData
) {

    const member =
        await getGuildMember(
            interaction.client,
            contractData.guildId,
            contractData.targetUserId
        );

    const alreadyHasRole =
        member.roles.cache.has(
            config.contractRoleId
        );

    if (!alreadyHasRole) {

        await member.roles.add(
            config.contractRoleId,
            "Everlast.Co Workshop Contract accepted"
        );
    }

    const description =
        alreadyHasRole
            ? "✅ **Contract diterima.**\n\n" +
              "Anda telah menerima contract pekerjaan Everlast.Co Workshop.\n\n" +
              "Role workshop sudah Anda miliki."
            : "✅ **Contract diterima.**\n\n" +
              "Selamat! Anda telah menerima contract pekerjaan Everlast.Co Workshop.\n\n" +
              "Role workshop telah diberikan kepada Anda.";

    const embed =
        new EmbedBuilder()
            .setTitle(
                config.contract.title
            )
            .setDescription(
                description
            )
            .setTimestamp();

    await interaction.update({
        embeds: [
            embed
        ],
        components: []
    });

    activeContracts.delete(
        contractData.targetUserId
    );

    console.log(
        `[Contract] ${interaction.user.tag} accepted contract.`
    );

    if (!alreadyHasRole) {

        console.log(
            `[Contract] Role ${config.contractRoleId} diberikan kepada ${interaction.user.tag}.`
        );
    }
}

// ========================================================
// REJECT CONTRACT
// ========================================================

async function rejectContract(
    interaction,
    contractData
) {

    const embed =
        new EmbedBuilder()
            .setTitle(
                config.contract.title
            )
            .setDescription(
                "❌ **Contract ditolak.**\n\n" +
                "Anda telah menolak contract pekerjaan Everlast.Co Workshop."
            )
            .setTimestamp();

    await interaction.update({
        embeds: [
            embed
        ],
        components: []
    });

    activeContracts.delete(
        contractData.targetUserId
    );

    console.log(
        `[Contract] ${interaction.user.tag} rejected contract.`
    );
}

// ========================================================
// HANDLE CONTRACT INTERACTION
// ========================================================

async function handleInteraction(
    interaction
) {

    if (!interaction.isButton()) {
        return false;
    }

    if (
        !interaction.customId.startsWith(
            "contract:v1:"
        )
    ) {
        return false;
    }

    const parts =
        interaction.customId.split(":");

    const action =
        parts[2];

    const targetUserId =
        parts[3];

    if (
        !action ||
        !targetUserId
    ) {

        console.warn(
            "[Contract] Invalid contract button data."
        );

        return true;
    }

    if (
        interaction.user.id !==
        targetUserId
    ) {

        await interaction.reply({
            content:
                "❌ Contract ini bukan untuk Anda.",
            flags: 64
        }).catch(() => {});

        return true;
    }

    const contractData =
        activeContracts.get(
            targetUserId
        );

    if (!contractData) {

        await interaction.reply({
            content:
                "❌ Contract ini sudah tidak aktif atau bot baru saja restart.",
            flags: 64
        }).catch(() => {});

        return true;
    }

    // ====================================================
    // ACCEPT
    // ====================================================

    if (
        action === "accept"
    ) {

        await acceptContract(
            interaction,
            contractData
        );

        return true;
    }

    // ====================================================
    // REJECT
    // ====================================================

    if (
        action === "reject"
    ) {

        await rejectContract(
            interaction,
            contractData
        );

        return true;
    }

    return false;
}

// ========================================================
// EXPORT
// ========================================================

module.exports = {
    hasAuthorizedRole,
    sendContractDM,
    handleInteraction
};