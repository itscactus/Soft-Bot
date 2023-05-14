const { Client, Message } = require("discord.js");
const { readFileSync } = require("fs");
const GuildSchema = require("../models/GuildSchema");

module.exports = {
    name: "messageUpdate",
    once: false,
    /**
     * 
     * @param {Client} client 
     * @param {Message} newMessage
     * @param {Message} oldMessage
     */
    run: async(client, oldMessage, newMessage) => {
        if(!newMessage.guild) return;
        let database = await GuildSchema.findOne({
            guildId: newMessage.guild.id
        });
        if(database.kufurKoruma.enabled == true) {
            let trKufur = readFileSync(`./assets/liste/küfür/tr.txt`, {encoding:'utf8', flag:'r'}).split("\r\n");
            let enKufur = readFileSync(`./assets/liste/küfür/en.txt`, {encoding:'utf8', flag:'r'}).split("\r\n");

            if(!newMessage.member.permissions.has("ManageMessages")) {
                if(newMessage.content.split(" ").some(item => trKufur.includes(item.toLowerCase())) || message.content.split("").some(item => enKufur.includes(item.toLowerCase()))) {
                    await newMessage.delete().catch(async (err) => {
                        console.log('[Küfür Koruması] ' + newMessage.guild.name + ' sunucusunda küfürü silemedim :(');
                        await new GuildHistorySchema({
                            date: new Date(),
                            guildId: newMessage.guild.id,
                            message: "Sunucuda Mesaj Silemiyorum :(",
                            type: "error"
                        }).save();
                    });
                    newMessage.channel.send({
                        content: `${newMessage.member}! mesajını düzenlesende Küfür ettiğini yakalarım 😉`
                    }).then((msg) => {
                        setTimeout(async() => {
                            await msg.delete().catch(async (err) => {
                                console.log('[Küfür Koruması] ' + newMessage.guild.name + ' sunucusunda mesajımı silemedim :(');
                                await new GuildHistorySchema({
                                    date: new Date(),
                                    guildId: newMessage.guild.id,
                                    message: "Sunucuda Mesaj Silemiyorum :(",
                                    type: "error"
                                }).save();
                            });
                        }, 3000)
                    })
                }
            }
        }
    }
}