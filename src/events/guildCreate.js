const { Guild } = require("discord.js");
const GuildSchema = require("../models/GuildSchema");

module.exports = {
    name: "guildCreate",
    once: false,
    /**
     * 
     * @param {Client} client 
     * @param {Guild} guild
     */
    run: async(client, guild) => {
        let guildData = await GuildSchema.findOne({
            guildId: guild.id
        });

        if(!guildData) {
            guildData = await new GuildSchema({
                guildId: guild.id
            }).save();
            console.log(`${guild.name} Sunucusunun verilerini oluşturdum.`)
        }
    }
}