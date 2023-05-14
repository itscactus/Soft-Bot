const { Client, SlashCommandBuilder } = require("discord.js")
const fs = require("fs");
/**
 * 
 * @param {Client} client 
 */
module.exports = async function loadCommands(client) {
    let clientCommands = await client.application.commands.fetch();
    
    const commandDirs = fs.readdirSync("./src/commands");
    var commands = [];
    commandDirs.map(async(dir) => {
        let commands_in_dir = fs.readdirSync("./src/commands/" + dir).filter(file => file.endsWith(".js"));
        commands_in_dir.map((cmdFile) => {
            const cmdData = require("../commands/" + dir + "/" + cmdFile);
            commands.push(cmdData);
            client.commands.set(cmdData.data.name, cmdData);
            
        });
    });
    commands.map(async(cmd) => {
        let command = clientCommands.filter(cmdd => cmdd.name == cmd.data.name).first();
        if(!command?.equals(cmd.data)) {
            await client.application.commands.create(cmd.data.toJSON());
            console.log("[Command Loader] /" + cmd.data.name + " komutu oluşturuldu.");
        } else {
            console.log("[Command Loader] /" + cmd.data.name + " komutu zaten var.")
        }
    });
    clientCommands.map(async(cmd) => {
        if(client.commands.get(cmd.name) == null) {
            await cmd.delete().catch(err => console.log(err))
            console.log("[Command Loader] /" + cmd.name + " komutu bulunamadı ve silindi.")
        }
    })

}