"use strict";

const portal =
    require("../features/portal");

module.exports = {
    name: "guildMemberAdd",

    async execute(client, member) {
        await portal.handleMemberAdd(
            client,
            member
        );
    }
};