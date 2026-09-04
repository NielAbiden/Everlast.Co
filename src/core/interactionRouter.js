"use strict";

const portal =
    require("../features/portal");

const contract =
    require("../features/contract");

async function routeInteraction(
    interaction
) {

    // ========================================================
    // SLASH COMMAND
    // ========================================================

    if (
        interaction.isChatInputCommand()
    ) {

        const command =
            interaction.client.commands.get(
                interaction.commandName
            );

        if (!command) {

            console.warn(
                `⚠️ Command tidak ditemukan: /${interaction.commandName}`
            );

            return false;
        }

        try {

            await command.execute(
                interaction
            );

        } catch (error) {

            console.error(
                `❌ COMMAND ERROR | /${interaction.commandName}`,
                error
            );

            try {

                if (
                    interaction.deferred ||
                    interaction.replied
                ) {

                    await interaction.editReply({
                        content:
                            "❌ Terjadi kesalahan saat menjalankan command.",
                        embeds: [],
                        components: []
                    });

                } else {

                    await interaction.reply({
                        content:
                            "❌ Terjadi kesalahan saat menjalankan command.",
                        flags: 64
                    });

                }

            } catch (replyError) {

                console.error(
                    "❌ COMMAND ERROR RESPONSE |",
                    replyError
                );

            }
        }

        return true;
    }

    // ========================================================
    // PORTAL
    // ========================================================

    try {

        if (
            await portal.handleInteraction(
                interaction
            )
        ) {

            return true;
        }

    } catch (error) {

        console.error(
            "❌ PORTAL INTERACTION ERROR |",
            error
        );

        if (
            !interaction.replied &&
            !interaction.deferred
        ) {

            await interaction.reply({
                content:
                    "❌ Terjadi kesalahan pada Portal System.",
                flags: 64
            }).catch(() => {});

        }

        return true;
    }

    // ========================================================
    // CONTRACT
    // ========================================================

    try {

        if (
            await contract.handleInteraction(
                interaction
            )
        ) {

            return true;
        }

    } catch (error) {

        console.error(
            "❌ CONTRACT INTERACTION ERROR |",
            error
        );

        if (
            !interaction.replied &&
            !interaction.deferred
        ) {

            await interaction.reply({
                content:
                    "❌ Terjadi kesalahan pada Contract System.",
                flags: 64
            }).catch(() => {});

        }

        return true;
    }

    // ========================================================
    // UNKNOWN
    // ========================================================

    return false;
}

module.exports = {
    routeInteraction
};