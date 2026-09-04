const {
    routeInteraction
} = require("../core/interactionRouter");

module.exports = {
    name: "interactionCreate",

    async execute(client, interaction) {
        await routeInteraction(interaction);
    }
};