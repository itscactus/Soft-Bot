const { Client, ActivityType } = require("discord.js");
const { default: mongoose } = require("mongoose");
const { TicketTypes } = require("../class/Ticket.js");
const loadCommands = require("../handler/command.js");
const GuildSchema = require("../models/GuildSchema.js");
module.exports = {
    name: "ready",
    once: false,
    /**
     * 
     * @param {Client} client 
     */
    run: async(client) => {
        console.log(`Başarıyla giriş yaptım! ${client.user.username}`)
        client.user.setPresence({
            activities: [
                {
                    name: "31",
                    type: ActivityType.Competing
                }
            ],
            status: "idle"
        })
        await mongoose.connect(process.env.MONGO_URI).then(() => {
            console.log("[Veritabanı] Bağlantı kuruldu")
        }).catch(err => {
            console.error("[Veritabanı] Bağlantı kurulamadı")
            console.error(err)
        })
        client.guilds.cache.map(async (guild) => {
            let g = await GuildSchema.findOne({
                guildId: guild.id
            });
            if(!g) {
                g = new GuildSchema({
                    guildId: guild.id
                });
                await g.save();
            }

            if(g.destekSistem.ticketType == TicketTypes.Reaction) {
                try {
                    const channel = guild.channels.cache.get(g.destekSistem.channelId);
                    await channel.messages.fetch(g.destekSistem.ticketMessageId)
                    console.log("[Destek] " + guild.name + " için reaksiyon destek talebi hazır.")
                } catch(err) {
                    console.log("[Destek] " + guild.name + " için reaksiyon destek talebi hazır değil verileri silinmiş :(.")
                }
            }
        })
        await loadCommands(client);

    }
}