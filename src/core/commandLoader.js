"use strict";

const fs = require("node:fs");
const path = require("node:path");


/*
|--------------------------------------------------------------------------
| GET COMMAND FILES
|--------------------------------------------------------------------------
*/

function getCommandFiles(dir) {

    let files = [];

    if (!fs.existsSync(dir)) {
        return files;
    }

    const entries = fs.readdirSync(dir, {
        withFileTypes: true
    });

    for (const entry of entries) {

        const fullPath = path.join(
            dir,
            entry.name
        );

        /*
        |--------------------------------------------------------------------------
        | Folder
        |--------------------------------------------------------------------------
        */

        if (entry.isDirectory()) {

            files = files.concat(
                getCommandFiles(fullPath)
            );

            continue;
        }

        /*
        |--------------------------------------------------------------------------
        | JavaScript command
        |--------------------------------------------------------------------------
        */

        if (
            entry.isFile() &&
            entry.name.endsWith(".js")
        ) {
            files.push(fullPath);
        }
    }

    return files;
}


/*
|--------------------------------------------------------------------------
| LOAD COMMANDS
|--------------------------------------------------------------------------
*/

function loadCommands(client) {

    const commandsPath = path.resolve(
        process.cwd(),
        "src/commands"
    );

    const commandFiles =
        getCommandFiles(commandsPath);


    for (const filePath of commandFiles) {

        const relativePath =
            path.relative(
                commandsPath,
                filePath
            );


        try {

            /*
            |--------------------------------------------------------------------------
            | Clear require cache
            |--------------------------------------------------------------------------
            */

            delete require.cache[
                require.resolve(filePath)
            ];


            /*
            |--------------------------------------------------------------------------
            | Load command
            |--------------------------------------------------------------------------
            */

            const command =
                require(filePath);


            /*
            |--------------------------------------------------------------------------
            | Validate command
            |--------------------------------------------------------------------------
            */

            if (
                !command.data ||
                typeof command.execute !== "function"
            ) {

                console.warn(
                    `⚠️ Command tidak valid: ${relativePath}`
                );

                continue;
            }


            const commandName =
                command.data.name;


            /*
            |--------------------------------------------------------------------------
            | Prevent duplicate command
            |--------------------------------------------------------------------------
            */

            if (
                client.commands.has(
                    commandName
                )
            ) {

                console.warn(
                    `⚠️ Command duplikat: /${commandName}`
                );

                continue;
            }


            /*
            |--------------------------------------------------------------------------
            | Store command
            |--------------------------------------------------------------------------
            */

            client.commands.set(
                commandName,
                command
            );


            console.log(
                `📌 Command dimuat: /${commandName} [${relativePath}]`
            );

        } catch (error) {

            console.error(
                `❌ Gagal memuat command: ${relativePath}`
            );

            console.error(error);
        }
    }
}


/*
|--------------------------------------------------------------------------
| REGISTER COMMANDS
|--------------------------------------------------------------------------
*/

async function registerCommands(client) {

    if (!client) {

        throw new Error(
            "Discord client tidak tersedia."
        );
    }


    if (!client.application) {

        throw new Error(
            "Discord application belum tersedia."
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Guild ID
    |--------------------------------------------------------------------------
    */

    const guildId =
        process.env.DISCORD_GUILD_ID;


    if (!guildId) {

        throw new Error(
            "DISCORD_GUILD_ID belum diatur di file .env."
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Prepare commands
    |--------------------------------------------------------------------------
    */

    const commands = [
        ...client.commands.values()
    ].map(command =>
        command.data.toJSON()
    );


    console.log(
        `📦 Menyiapkan ${commands.length} slash command...`
    );


    /*
    |--------------------------------------------------------------------------
    | STEP 1
    | Hapus SEMUA global command lama
    |--------------------------------------------------------------------------
    |
    | Sebelumnya command kamu pernah menggunakan:
    |
    | client.application.commands.set(commands)
    |
    | Itu membuat /v1 dan /ping menjadi GLOBAL.
    |
    | Sekarang kita hapus semuanya.
    |
    |--------------------------------------------------------------------------
    */

    try {

        await client.application.commands.set([]);

        console.log(
            "🧹 Semua global command berhasil dihapus."
        );

    } catch (error) {

        console.error(
            "❌ Gagal menghapus global command."
        );

        throw error;
    }


    /*
    |--------------------------------------------------------------------------
    | STEP 2
    | Fetch guild
    |--------------------------------------------------------------------------
    */

    let guild;

    try {

        guild =
            await client.guilds.fetch(
                guildId
            );

    } catch (error) {

        console.error(
            `❌ Tidak dapat menemukan guild dengan ID: ${guildId}`
        );

        throw error;
    }


    console.log(
        `📡 Guild target: ${guild.id}`
    );


    /*
    |--------------------------------------------------------------------------
    | STEP 3
    | Hapus semua guild command lama
    |--------------------------------------------------------------------------
    */

    try {

        await guild.commands.set([]);

        console.log(
            "🧹 Semua guild command lama berhasil dihapus."
        );

    } catch (error) {

        console.error(
            "❌ Gagal menghapus guild command lama."
        );

        throw error;
    }


    /*
    |--------------------------------------------------------------------------
    | STEP 4
    | Register command baru ke guild
    |--------------------------------------------------------------------------
    */

    try {

        await guild.commands.set(
            commands
        );

        console.log(
            `✅ ${commands.length} slash command berhasil didaftarkan ke guild.`
        );

    } catch (error) {

        console.error(
            "❌ Gagal mendaftarkan slash command."
        );

        throw error;
    }


    /*
    |--------------------------------------------------------------------------
    | STEP 5
    | Verify command yang benar-benar terdaftar
    |--------------------------------------------------------------------------
    */

    const registeredCommands =
        await guild.commands.fetch();


    const registeredNames =
        [...registeredCommands.values()]
            .map(command =>
                `/${command.name}`
            );


    console.log(
        "📋 Command terdaftar:",
        registeredNames.join(", ")
    );


    /*
    |--------------------------------------------------------------------------
    | STEP 6
    | Verify global command
    |--------------------------------------------------------------------------
    */

    const globalCommands =
        await client.application.commands.fetch();


    if (globalCommands.size === 0) {

        console.log(
            "🔒 Global command: KOSONG"
        );

    } else {

        console.warn(
            "⚠️ Global command masih ada:",
            [...globalCommands.values()]
                .map(command =>
                    `/${command.name}`
                )
                .join(", ")
        );
    }
}


/*
|--------------------------------------------------------------------------
| EXPORT
|--------------------------------------------------------------------------
*/

module.exports = {

    getCommandFiles,

    loadCommands,

    registerCommands

};