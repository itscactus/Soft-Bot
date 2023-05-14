const { EmbedBuilder } = require("@discordjs/builders");
const { Client, GuildMember } = require("discord.js");
const parsePlaceholders = require("../methods/parsePlaceholders");
const GuildSchema = require("../models/GuildSchema")
module.exports = {
    name: "guildMemberAdd",
    once: false,
    /**
     * 
     * @param {Client} client 
     * @param {GuildMember} member
     */
    run: async(client, member) => {
        let database = await GuildSchema.findOne({
            guildId: member.guild.id
        });

        /**
         * Autorole
         */
        if(database.autoRole.roleId != null) {
            let role = member.guild.roles.cache.get(database.autoRole.roleId) || null;
            let channel = member.guild.channels.cache.get(database.autoRole.channelId) || null;

            if(role != null) {
                member.roles.add(role);
                let embedJSON = database.autoRole.message.embed;
                let parsed = parsePlaceholders.autoRoleParse(member.guild, member.user, embedJSON, database);
                if(channel != null) channel.send({
                    embeds: [
                        new EmbedBuilder(parsed)
                    ]
                })
            }
        }
    }
}