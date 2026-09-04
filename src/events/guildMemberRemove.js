"use strict";

const portal =
    require("../features/portal");

module.exports = {
    name: "guildMemberRemove",

    async execute(client, member) {
        await portal.handleMemberRemove(
            client,
            member
        );
    }
};