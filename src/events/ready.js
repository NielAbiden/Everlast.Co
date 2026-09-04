module.exports = {
    name: "clientReady",
    once: true,

    execute(client) {
        console.log(`[Everlast] Logged in as ${client.user.tag}`);
    }
};