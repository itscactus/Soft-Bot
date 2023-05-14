const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("@discordjs/builders");
const { Guild, TextChannel, Colors, ButtonStyle, User, ChannelType, Message } = require("discord.js");
const { JsonDatabase } = require("wio.db");
const GuildSchema = require("../models/GuildSchema");
const parsePlaceholders = require("../methods/parsePlaceholders");

const TicketTypes = {
    Reaction: 1,
    Button: 2,
    Modal: 3,
    /**
     * 
     * @param {String} str 
     */
    valueOf: (str) => {
        if(["reaction", "reaksiyon", "react", "1"].includes(str.toLowerCase())) return TicketTypes.Reaction;
        if(["button", "buton", "düğme", "2"].includes(str.toLowerCase())) return TicketTypes.Button;
        if(["form", "modal", "modals", "3"].includes(str.toLowerCase())) return TicketTypes.Modal;
    }
};

class Ticket {
    constructor(guild) {
        /**
         * @type {Guild}
         */
        this.guild = guild;
        this.jsonDB = new JsonDatabase({
            databasePath: "./database/tickets.json"
        });
    }
    /**
     * 
     * @param {TextChannel} channel 
     * @param {User} user
     */
    async close(channel, user, data = {
        categories: { archiveId: null, activeId: null },
        gorevliRole: null
    }) {
        let tickets = this.jsonDB.fetch(`${this.guild.id}`);
        tickets = tickets ? Object.values(tickets) : [];
        tickets = await Promise.all(tickets.map(ticket => {
            if(ticket['channelId'] == channel.id) ticket["active"] = false;
            return ticket;
        }));
        
        
        let activeCategory = this.guild.channels.cache.filter((chnl) => chnl.type == ChannelType.GuildCategory && chnl.id == data.categories.activeId).first();
        let archiveCategory = this.guild.channels.cache.filter((chnl) => chnl.type == ChannelType.GuildCategory && chnl.id == data.categories.archiveId).first();
        let gorevliRole = this.guild.roles.cache.filter((role) => role.id == data.gorevliRole).first();

        channel.setParent(archiveCategory ? archiveCategory : null);
        channel.permissionOverwrites.set([
            {
                id: (gorevliRole || this.guild.ownerId),
                allow: ["ViewChannel", "SendMessages"]
            },
            {
                id: this.guild.roles.everyone.id,
                deny: ["ViewChannel", "SendMessages"]
            }
        ])

        this.jsonDB.set(`${this.guild.id}`, tickets);
        data["success"] = true;
        return data;
    }
    /**
     * 
     * @param {User} user 
     */
    async create(user, data = {
        categories: { archiveId: null, activeId: null },
        gorevliRole: null,
        lastTicketId: 0,
        embedData: null,
        modal: {
            talepSebebi: null
        }
    }) {
        let tickets = this.jsonDB.fetch(`${this.guild.id}`);
        tickets = tickets ? Object.values(tickets) : [];
        tickets = tickets.filter((val) => val.userId == user.id && val.active == true && this.guild.channels.cache.get(val.channelId) != null);
        if(tickets[0] != null) return {
            error: true,
            message: "Zaten bir destek talebin var.",
            channelId: tickets[0].channelId
        };
        data["ticketId"] = data.lastTicketId +1;
        let activeCategory = this.guild.channels.cache.filter((chnl) => chnl.type == ChannelType.GuildCategory && chnl.id == data.categories.activeId).first();
        let archiveCategory = this.guild.channels.cache.filter((chnl) => chnl.type == ChannelType.GuildCategory && chnl.id == data.categories.archiveId).first();
        let gorevliRole = this.guild.roles.cache.filter((role) => role.id == data.gorevliRole).first() || this.guild.ownerId;
        /**
         * @type {TextChannel}
         */
        const channel = await this.guild.channels.create({
            name: "destek-" + data["ticketId"],
            reason: "Destek",
            parent: (activeCategory || null),
            permissionOverwrites: [
                {
                    id: gorevliRole,
                    allow: ["ViewChannel", "SendMessages"]
                },
                {
                    id: user.id,
                    allow: ["ViewChannel", "SendMessages"]
                },
                {
                    id: this.guild.roles.everyone.id,
                    deny: ["ViewChannel", "SendMessages"]
                }
            ]
        });
        /**
         * @type {Message}
         */
        const msg = await channel.send({
            content: `${user}`,
            embeds: [parsePlaceholders.ticketChannelParse(this.guild, user, data.embedData, gorevliRole, data.modal.talepSebebi)],
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder({
                        custom_id: "closeTicket-" + user.id,
                        style: ButtonStyle.Secondary,
                        label: "Talebi Kapat",
                        emoji: {
                            name: "❌"
                        }
                    })
                )
            ]
        });
        await msg.pin();
        data["channelId"] = channel.id;
        this.jsonDB.push(`${this.guild.id}`, {
            userId: user.id,
            channelId: channel.id,
            pinnedMessageId: msg.id,
            date: new Date(),
            active: true
        });
        return data;
    }
}
class TicketManager {
    constructor(guild) {
        /**
         * @type {Guild}
         */
        this.guild = guild;
    }
    /**
     * 
     * @param {TextChannel} channel 
     */
    async setup(channel, data = { 
        ticketType: 1,
        oldMessageId: null,
        oldChannelId: null,
        embedData: null
    }) {
        data["channelId"] = channel.id;
        if(data.ticketType == 0) data.ticketType = TicketTypes.valueOf("reaksiyon");
        const reaction = data.ticketType == 1 ? "🎫" : null;

        var row = null;
        if(data.ticketType == 2 || data.ticketType == 3) {
            row = new ActionRowBuilder().addComponents(
                new ButtonBuilder({
                    custom_id: "createTicket-" + data.ticketType,
                    emoji: {
                        name: "🎫"
                    },
                    label: "Talep Oluştur",
                    style: ButtonStyle.Secondary
                })
            );
        };
        try {
            if(data.oldMessageId != null && data.oldChannelId != null) {
                const channel = this.guild.channels.cache.get(data.oldChannelId)
                const message = await channel.messages.fetch(data.oldMessageId)
                await message.delete();
                
            }
        } catch (err) {
            console.log(err);
        }
        const msg = await channel.send({
            embeds: [parsePlaceholders.ticketParse(this.guild, data.embedData)],
            components: row == null ? null : [row]
        });
        data['ticketMessageId'] = msg.id;
        if(reaction != null) msg.react(reaction);
        return data;
    }
}

module.exports = { TicketTypes, Ticket, TicketManager };