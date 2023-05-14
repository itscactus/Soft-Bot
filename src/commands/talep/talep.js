const { SlashCommandBuilder, Client, CommandInteraction, EmbedBuilder, Colors, ChannelType, TextChannel, PermissionFlagsBits, ModalBuilder, ActionRowBuilder, TextInputBuilder, ButtonBuilder, ButtonStyle, Message, Component, ComponentType, TextInputStyle } = require("discord.js");
const { readdirSync } = require("fs");
const { TicketTypes, TicketManager } = require("../../class/Ticket");
const GuildSchema = require("../../models/GuildSchema");
const parsePlaceholders = require("../../methods/parsePlaceholders");

module.exports = {
    ephemeral: true,
    data: new SlashCommandBuilder()
        .setName("talep")
        .setDescription("Soft Bot | Talep Sistemi")
        .addSubcommandGroup(subcmdG => subcmdG
            .setName("kurulum")
            .setDescription("Soft Bot | Talep Kurulumu")
            .addSubcommand(subcmd => subcmd
                .setName("tür")
                .setDescription("Soft Bot | Talep Türü")
                .addStringOption(str => str
                    .setName("tür")
                    .setDescription("Talep türünü seç.")
                    .setRequired(true)
                    .setChoices(
                        {
                            name: "Buton",
                            value: "button"
                        },
                        {
                            name: "Form",
                            value: "modal"
                        },
                        {
                            name: "Reaksiyon",
                            value: "reaction"
                        }
                    )
                )
            )
            .addSubcommand(subcmd => subcmd
                .setName("kanal")
                .setDescription("Soft Bot | Talep Kanalı")
                .addChannelOption(chnl => chnl
                    .setDescription("Talep açılacağı kanalı seç.")
                    .setRequired(true)
                    .setName("kanal")
                    .addChannelTypes(ChannelType.GuildText)
                )
            )
            .addSubcommand(subcmd => subcmd
                .setName("embed")
                .setDescription("Soft Bot | Embed düzenleyici")
                .addStringOption(str => str
                    .setName("embed")
                    .setDescription("Lütfen düzenlemek istediğiniz embedi seçiniz.")
                    .setChoices(
                        {
                            name: "Talep Embed",
                            value: "talep"
                        },
                        {
                            name: "Mesaj Embed",
                            value: "mesaj"
                        }
                    )
                )
            )
            .addSubcommand(subcmd => subcmd
                .setName("kategori")
                .setDescription("Soft Bot | Kategori ayarlama.")
                .addChannelOption(opt => opt
                    .setName("aktif")
                    .setDescription("Aktif Talep Kategorilerini belirle")
                    .addChannelTypes(ChannelType.GuildCategory)
                )
                .addChannelOption(opt => opt
                    .setName("arşiv")
                    .setDescription("Arşivlenmiş Talep kategorilerini belirle")
                    .addChannelTypes(ChannelType.GuildCategory)
                )
            )
        ),
    /**
     * 
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     */
    run: async(client, interaction) => {
        var guildDB = await GuildSchema.findOne({
            guildId: interaction.guild.id
        });

        const subCommandGroup = interaction.options.getSubcommandGroup();
        const subCommand = interaction.options.getSubcommand();
        
        /**
         * Kurulum
         */
        if(subCommandGroup == "kurulum") {
            if(subCommand == "kategori") {
                const archive = interaction.options.getChannel("arşiv") || null;
                const active  = interaction.options.getChannel("aktif") || null;

                if(archive != null) guildDB.destekSistem.categories.archive = archive.id; 
                if(active != null) guildDB.destekSistem.categories.active = active.id; 
                
                let archiveCategory = interaction.guild.channels.cache.get(guildDB.destekSistem.categories.archive) || null;
                let activeCategory = interaction.guild.channels.cache.get(guildDB.destekSistem.categories.active) || null;
                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: interaction.user.tag,
                        iconURL: interaction.user.displayAvatarURL()
                    })
                    .setTitle("SoftBot | Destek Kategorileri")
                    .setColor(Colors.LuminousVividPink)
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .setFooter({
                        text: "SoftBot | 2022 ©"
                    })
                    .setDescription(`
> Aşağıda şuanki ayarlı kategorilerinizi görebilirsiniz.

> Aktif Kategorisi: ${activeCategory != null ? `${activeCategory} \`(${activeCategory.id})\`` : "Yok"}
> Arşiv Kategorisi: ${archiveCategory != null ? `${archiveCategory} \`(${archiveCategory.id})\`` : "Yok"}
                    `)
                interaction.editReply({
                    embeds: [embed]
                })
                await guildDB.save();
            }
            if(subCommand == "embed") {
                const embedType = interaction.options.getString("embed");
                if(embedType != null) {
                    const embed = embedType == "mesaj" ? guildDB.destekSistem.embed : guildDB.destekSistem.talepEmbed;
                    const modal = new ModalBuilder()
                        .addComponents(
                            new ActionRowBuilder().addComponents(
                                new TextInputBuilder({
                                    custom_id: "author",
                                    label: "Yazar?",
                                    value: `${embed.author.name}`,
                                    max_length: 256,
                                    style: TextInputStyle.Short,
                                    required: false
                                })
                            ),
                            new ActionRowBuilder().addComponents(new TextInputBuilder({
                                custom_id: "title",
                                label: "Başlık?",
                                value: `${embed.title}`,
                                max_length: 256,
                                style: TextInputStyle.Short,
                                required: true
                            })),
                            new ActionRowBuilder().addComponents(new TextInputBuilder({
                                custom_id: "description",
                                label: "İçerik?",
                                value: `${embed.description}`,
                                max_length: 2048,
                                style: TextInputStyle.Paragraph,
                                required: true
                            })),
                            new ActionRowBuilder().addComponents(
                                new TextInputBuilder({
                                    custom_id: "footer",
                                    label: "Altyazı?",
                                    value: `${embed.footer.text || ""}`,
                                    max_length: 512,
                                    style: TextInputStyle.Short,
                                    required: false
                                })
                            )
                        );
                    if(embedType == "mesaj") modal.setTitle("Mesaj Embedini Düzenliyorsun!").setCustomId("embedEditor-ticket-mesaj");
                    else modal.setTitle("Talep Embedini Düzenliyorsun!").setCustomId("embedEditor-ticket-talep");
                    /**
                     * @type {Message}
                     */
                    const msg = await interaction.editReply({
                        embeds: [
                            embedType == "mesaj" ?
                            parsePlaceholders.ticketParse(interaction.guild, embed)
                            :
                            parsePlaceholders.ticketChannelParse(interaction.guild, interaction.user, embed, guildDB.destekSistem.gorevliRole, "Embed Editör")
                        ],
                        components: [
                            new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder({
                                        custom_id: "duzenle-" + embedType,
                                        label: "Embedi Düzenle",
                                        emoji: {
                                            name: "✏️"
                                        },
                                        style: ButtonStyle.Success
                                    })
                                )
                        ]
                    });
                    const collector = msg.createMessageComponentCollector({
                        componentType: ComponentType.Button,
                        time: 60000
                    });
                    collector.on("collect", async (i) => {
                        await i.showModal(modal);
                    })
                } else {
                    const embed = new EmbedBuilder()
                        .setAuthor({
                            name: interaction.user.tag,
                            iconURL: interaction.user.displayAvatarURL()
                        })
                        .setTitle("SoftBot | Destek Embed Düzenleyici")
                        .setColor(Colors.LuminousVividPink)
                        .setThumbnail(interaction.user.displayAvatarURL())
                        .setFooter({
                            text: "SoftBot | 2022 ©"
                        })
                        .setDescription(`
\`\`\`Mesaj Embedi için Placeholderlar:\`\`\`
\`{{guild_name}}\` => Sunucu Adı 
\`{{guild_id}}\` => Sunucu İD
\`{{guild_icon}}\` => Sunucu ikonu 

\`\`\`Talep Embedi için Placeholderlar:\`\`\`
\`{{guild_name}}\` => Sunucu Adı 
\`{{guild_id}}\` => Sunucu İD
\`{{guild_icon}}\` => Sunucu ikonu 

\`{{user}}\` => Kullanıcı
\`{{user_id}}\` => Kullanıcı İD
\`{{user_tag}}\` => Kullanıcı İsmi & Tagı
\`{{user_avatar}}\` => Kullanıcı Avatarı
\`{{user_discriminator}}\` => Kullanıcı Tagı
\`{{user_username}}\` => Kullanıcı İsmi

\`{{gorevliRole}}\` => Görevli Rolü
\`{{gorevliRole_name}}\` => Görevli Rol Adı
\`{{gorevliRole_id}}\` => Görevli Rol İD
                        `);
                    interaction.editReply({
                        embeds: [embed]
                    });
                }
            }
            if(subCommand == "tür") {
                let type = interaction.options.getString("tür");
                if(["reaction", "button", "modal"].includes(type)) {

                    let ticketType = TicketTypes.valueOf(type);
                    guildDB.destekSistem.ticketType = ticketType;
                    if(guildDB.destekSistem.channelId != null) {
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
                    interaction.editReply({
                        content: "Destek Türü başarıyla " + (ticketType == 1 ? "Reaksiyon" : (ticketType == 2 ? "Buton" : "Form")) + "olarak ayarlandı."
                    });
                } else {
                    interaction.editReply({
                        content: "Lütfen geçerli bir tür giriniz! `Reaksiyon, Buton, Form`",
                    });
                    return;
                }
            } else if(subCommand == "kanal") {
                /**
                 * @type {TextChannel}
                 */
                let channel = interaction.options.getChannel("kanal");
                if(channel.permissionsFor(interaction.guild.members.me).has(PermissionFlagsBits.SendMessages, true)) {

                    const manager = new TicketManager(interaction.guild);
                    const data = await manager.setup(channel, { 
                        ticketType: guildDB.destekSistem.ticketType, 
                        oldChannelId: guildDB.destekSistem.channelId, 
                        oldMessageId: guildDB.destekSistem.ticketMessageId,
                        embedData: guildDB.destekSistem.embed
                    });
                    
                    guildDB.destekSistem.channelId = data.channelId;
                    guildDB.destekSistem.ticketMessageId = data.ticketMessageId;
                    await guildDB.save();
                    interaction.editReply({
                        content: `${channel} kanalına destek sistemini kurdum.`
                    })
                } else {
                    interaction.editReply({
                        content: `${channel} kanalına mesaj gönderme iznim yok.`
                    })
                }
            }
        }
    }
}