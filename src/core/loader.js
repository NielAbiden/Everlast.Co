"use strict";

const client = require("./client");

const loadEvents =
    require("./eventLoader");

const {
    loadCommands,
    registerCommands
} = require("./commandLoader");

async function bootstrap() {
    try {
        client.commands = new Map();

        loadEvents(client);

        loadCommands(client);

        await client.login(
            process.env.DISCORD_TOKEN
        );

        await registerCommands(client);

    } catch (error) {
        console.error(
            "[Everlast] Failed to start."
        );

        console.error(error);

        process.exit(1);
    }
}

bootstrap();