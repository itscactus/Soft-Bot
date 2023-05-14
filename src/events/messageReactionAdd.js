const { Client, ReactionEmoji, User, MessageReaction } = require("discord.js");
const { Ticket } = require("../class/Ticket");
const GuildSchema = require("../models/GuildSchema");

module.exports = {
    name: "messageReactionAdd",
    once: false,
    /**
     * 
     * @param {Client} client 
     * @param {MessageReaction} reaction 
     * @param {User} user
     */
    run: async(client, reaction, user) => {
        const ticketReactionName = "🎫";
        const guild = reaction.message.guild;
        let guildDB = await GuildSchema.findOne({
            guildId: guild.id
        });
        if(reaction.message.id == guildDB.destekSistem.ticketMessageId && reaction.emoji.name == ticketReactionName) {
            if(user.bot) return;
            const ticket = new Ticket(guild);
            const data = await ticket.create(user, {
                categories: {
                    activeId: guildDB.destekSistem.categories.active,
                    archiveId: guildDB.destekSistem.categories.archive
                },
                gorevliRole: guildDB.destekSistem.gorevliRole,
                lastTicketId: guildDB.destekSistem.lastTicketId,
                modal: {
                    talepSebebi: null
                },
                embedData: guildDB.destekSistem.talepEmbed
            });
            if(data["error"] != null) {
                let chnl = guild.channels.cache.get(data["channelId"]);
                chnl.send({
                    content: `${user}, ` + data["message"]
                });
            } else {
                guildDB.destekSistem.lastTicketId = data["ticketId"]++;
                guildDB.save();
            }
            await reaction.users.remove(user.id);
        }
    }
}