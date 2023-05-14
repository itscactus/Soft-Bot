const fs = require('fs');

module.exports = function loadEvents(client) {
    let dir = fs.readdirSync("./src/events");
    dir.map(async(file) => {
        
        let eventContent = require(`../events/${file}`);
        if(eventContent?.once) {
            client.once(eventContent.name, eventContent.run.bind(null, client));
        } else {
            client.on(eventContent.name, eventContent.run.bind(null, client));
        }
        console.log("[Event Loader] Type: " + eventContent.name + " || Once: " + (eventContent?.once || false))
    })
}