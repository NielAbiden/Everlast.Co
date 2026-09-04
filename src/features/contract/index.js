"use strict";

const config =
    require("./config");

const services =
    require("./services");

async function createContract(
    interaction,
    targetUser
) {

    if (!interaction.guild) {
        throw new Error(
            "Contract hanya dapat dibuat dari server."
        );
    }

    await services.sendContractDM(
        targetUser,
        interaction.user,
        interaction.guild.id
    );
}

async function handleInteraction(
    interaction
) {
    return services.handleInteraction(
        interaction
    );
}

module.exports = {
    ...config,
    services,
    createContract,
    handleInteraction
};