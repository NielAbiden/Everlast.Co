const fs = require("fs");
const path = require("path");

function loadEvents(client) {
    const eventPath = path.join(__dirname, "../events");

    if (!fs.existsSync(eventPath)) {
        console.warn("[EventLoader] Event directory not found.");
        return;
    }

    const files = fs
        .readdirSync(eventPath)
        .filter(file => file.endsWith(".js"));

    for (const file of files) {
        const filePath = path.join(eventPath, file);
        const event = require(filePath);

        if (!event.name || typeof event.execute !== "function") {
            console.warn(`[EventLoader] Invalid event: ${file}`);
            continue;
        }

        const handler = (...args) => {
            event.execute(client, ...args);
        };

        if (event.once) {
            client.once(event.name, handler);
        } else {
            client.on(event.name, handler);
        }

        console.log(`[EventLoader] Loaded: ${event.name}`);
    }
}

module.exports = loadEvents;