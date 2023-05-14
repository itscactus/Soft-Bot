const { Client, InteractionType, ComponentType, ModalBuilder, ActionRowBuilder, TextInputComponent, TextInputBuilder, TextInputStyle, EmbedBuilder } = require("discord.js");
const { TicketTypes, Ticket, TicketManager } = require("../class/Ticket");
const GuildSchema = require("../models/GuildSchema");
const parsePlaceholders = require("../methods/parsePlaceholders");

module.exports = {
    name: "interactionCreate",
    once: false,
    /**
     * 
     * @param {Client} client ,
     * @param {import("discord.js").Interaction} interaction
     */
    run: async(client, interaction) => {
        if(interaction.isCommand()) {
            let cmd = interaction.commandName;
            let cmdData = client.commands.get(cmd);
            await interaction.deferReply({
                ephemeral: cmdData?.ephemeral == true ? true: false
            }).catch(err => {});
            try {
                cmdData.run(client, interaction);
            } catch(err) {
                interaction.editReply({
                    content: "Komutu çalıştırırken bir hata oluştu! Bir geliştiriciye danışın."
                })
            }
        }
        let guildDB = await GuildSchema.findOne({
            guildId: interaction.guild.id
        });
        if(interaction.type == InteractionType.ModalSubmit) {
            if(interaction.customId.startsWith("embedEditor")) {
                // embedEditor-ticket-talep
                const settings = interaction.customId.split("-");
                let editorType = settings[1]
                if(editorType == "ticket") {
                    const embedType = settings[2];
                    const authorName = interaction.components[0].components[0].value;
                    const title = interaction.components[1].components[0].value;
                    const description = interaction.components[2].components[0].value;
                    const footer = interaction.components[3].components[0].value;
                    if(embedType == "mesaj") {
                        guildDB.destekSistem.embed.author.name = authorName;
                        guildDB.destekSistem.embed.title = title;
                        guildDB.destekSistem.embed.description = description;
                        guildDB.destekSistem.embed.footer.text = footer;
                    } else {
                        guildDB.destekSistem.talepEmbed.author.name = authorName;
                        guildDB.destekSistem.talepEmbed.title = title;
                        guildDB.destekSistem.talepEmbed.description = description;
                        guildDB.destekSistem.talepEmbed.footer.text = footer;
                    }
                    if(embedType == "mesaj" && guildDB.destekSistem.channelId != null) {
                        const channel = interaction.guild.channels.cache.get(guildDB.destekSistem.channelId);
                        const manager = new TicketManager(interaction.guild);
                        const data = await manager.setup(channel, { 
                            ticketType: guildDB.destekSistem.ticketType, 
                            oldChannelId: guildDB.destekSistem.channelId, 
                            oldMessageId: guildDB.destekSistem.ticketMessageId,
                            embedData: guildDB.destekSistem.embed
                        });                        
                        guildDB.destekSistem.channelId = data.channelId;
                        guildDB.destekSistem.ticketMessageId = data.ticketMessageId;
                    }
                    await guildDB.save();
                    interaction.reply({
                        content: "Embed düzenlendi.",
                        ephemeral: true,
                        embeds: [parsePlaceholders.ticketParse(interaction.guild, (embedType == "mesaj" ? guildDB.destekSistem.embed : guildDB.destekSistem.talepEmbed))]
                    });
                }
            }
            if(interaction.customId == "createTicket") {
                const sebep = interaction.components[0].components[0].value;
                const ticket = new Ticket(interaction.guild);
                const data = await ticket.create(interaction.user, {
                    categories: {
                        activeId: guildDB.destekSistem.categories.active,
                        archiveId: guildDB.destekSistem.categories.archive
                    },
                    gorevliRole: guildDB.destekSistem.gorevliRole,
                    lastTicketId: guildDB.destekSistem.lastTicketId,
                    modal: {
                        talepSebebi: sebep
                    },
                    embedData: guildDB.destekSistem.talepEmbed
                });
                let chnl = interaction.guild.channels.cache.get(data["channelId"]);
                if(data["error"] != null) {
                    chnl.send({
                        content: `${interaction.user}, ` + data["message"] + `! Merak etme sebep mesajını silmedik 😊\n> Sebep: \`${sebep}\``
                    });
                    interaction.reply({
                        content: "Zaten bir destek talebin bulunuyor! <#" + chnl.id + ">",
                        ephemeral: true
                    })
                } else {
                    interaction.reply({
                        content: "Destek talebin başarıyla oluşturuldu. <#" + chnl.id + ">",
                        ephemeral: true
                    })
                    guildDB.destekSistem.lastTicketId = data["ticketId"]++;
                    guildDB.save();
                }

            }
        }
        if(interaction.type == InteractionType.MessageComponent) {
            if(interaction.componentType == ComponentType.Button) {
                let customId = interaction.customId;
                if(customId.startsWith("closeTicket")) {
                    await interaction.deferReply().catch(err => { })
                    const ticket = new Ticket(interaction.guild);
                    const data = await ticket.close(interaction.channel, interaction.user, {
                        categories: {
                            activeId: guildDB.destekSistem.categories.active,
                            archiveId: guildDB.destekSistem.categories.archive
                        },
                        gorevliRole: guildDB.destekSistem.gorevliRole,
                    });
                    if(data["success"] == true) interaction.editReply({
                        content: "Talep başarıyla arşivlendi."
                    })
                }
                if(customId.startsWith("createTicket")) {
                    let ticketType = customId.split("-")[1];

                    if(ticketType == TicketTypes.Modal) {
                        const modal = new ModalBuilder()
                        .setCustomId("createTicket")
                        .setTitle("Yeni Bir destek talebi oluştur.")
                        .addComponents(
                            new ActionRowBuilder().addComponents(
                                new TextInputBuilder()
                                    .setCustomId("sebep")
                                    .setLabel("Talep açma sebebiniz nedir?")
                                    .setStyle(TextInputStyle.Paragraph)
                                    .setMaxLength(1024)
                                    .setMinLength(10)
                                    .setRequired(true)
                            )
                        )
                        interaction.showModal(modal);
                    } else if(ticketType == TicketTypes.Button) {
                        const ticket = new Ticket(interaction.guild);
                        const data = await ticket.create(interaction.user, {
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
                        let chnl = interaction.guild.channels.cache.get(data["channelId"]);
                        if(data["error"] != null) {
                            chnl.send({
                                content: `${interaction.user}, ` + data["message"]
                            });
                            interaction.reply({
                                content: "Zaten bir destek talebin bulunuyor! <#" + chnl.id + ">",
                                ephemeral: true
                            })
                        } else {
                            interaction.reply({
                                content: "Destek talebin başarıyla oluşturuldu. <#" + chnl.id + ">",
                                ephemeral: true
                            })
                            guildDB.destekSistem.lastTicketId = data["ticketId"]++;
                            guildDB.save();
                        }
                    }
                }
            }
        }
    }
}