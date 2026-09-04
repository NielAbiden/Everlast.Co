"use strict";

const config =
    require("./config");

const services =
    require("./services");

// ========================================================
// MEMBER JOIN
// ========================================================

async function handleMemberAdd(
    client,
    member
) {

    if (
        !config.welcome.enabled
    ) {
        return;
    }

    await services.sendWelcome(
        client,
        member
    );
}

// ========================================================
// MEMBER LEAVE
// ========================================================

async function handleMemberRemove(
    client,
    member
) {

    if (
        !config.goodbye.enabled
    ) {
        return;
    }

    await services.sendGoodbye(
        client,
        member
    );
}

// ========================================================
// INTERACTION
// ========================================================

async function handleInteraction(
    interaction
) {

    // Portal saat ini tidak menggunakan
    // button / select menu / modal.

    return false;
}

// ========================================================
// EXPORT
// ========================================================

module.exports = {
    ...config,
    services,
    handleMemberAdd,
    handleMemberRemove,
    handleInteraction
};