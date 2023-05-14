const { SlashCommandBuilder, Client, EmbedBuilder, Colors, ChannelType, ChatInputCommandInteraction, PermissionsBitField, PermissionFlagsBits } = require("discord.js");
const { readdirSync } = require("fs");
const { isFunction } = require("util");
const GuildSchema = require("../../models/GuildSchema");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("seviye")
        .setDescription("Soft Bot | Seviye Sistemi")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommandGroup(subcmdGroup => subcmdGroup
            .setName("xp")
            .setDescription("Mesaj başı XP ayarlamaları")
            .addSubcommand(subcmd => subcmd
                .setName("ayarla")
                .setDescription("Mesaj başı xp ayarla.")
                .addIntegerOption(opt => opt
                    .setName("xp")
                    .setDescription("Mesaj başı alınacak XP (0-50 arası bir rakam girin.)")
                    .setMaxValue(50)
                    .setMinValue(0)
                    .setRequired(true)
                )
            )
        )
        .addSubcommand(subcmd => subcmd
            .setName("aç")
            .setDescription("Seviye sistemini aktifleştir.")
        ) 
        .addSubcommand(subcmd => subcmd
            .setName("kapat")
            .setDescription("Seviye sistemini kapat.")
        )
        .addSubcommand(subcmd => subcmd
            .setName("ayarlar")
            .setDescription("Seviye sisteminin ayarlarını görüntüle")
        )
        .addSubcommandGroup(subcmdGroup => subcmdGroup
            .setName("mesaj")
            .setDescription("Seviye Log mesajı ayarlamaları")
            .addSubcommand(subcmd => subcmd
                .setName("ayarla") 
                .setDescription("Seviye Log mesajını ayarla.")
                .addStringOption(opt => opt
                    .setName("mesaj")
                    .setDescription("Placeholderlar: {{old_level}} {{level}} {{next_level}} {{member}}")
                    .setRequired(true)
                )
            )
            .addSubcommand(subcmd => subcmd
                .setName("sıfırla")
                .setDescription("Seviye log mesajını sıfırlar.")
            )
        )
        .addSubcommandGroup(subcmdGroup => subcmdGroup
            .setName("kanal")
            .setDescription("Seviye Log kanalı ayarlamaları.")
            .addSubcommand(subcmd => subcmd
                .setName("ayarla") 
                .setDescription("Seviye Log kanalını ayarla.")
                .addChannelOption(opt => opt
                    .setName("kanal")
                    .setRequired(true)
                    .setDescription("Seviye Log kanalı")
                    .addChannelTypes(ChannelType.GuildText)
                )
            )
            .addSubcommand(subcmd => subcmd
                .setName("sıfırla")
                .setDescription("Seviye log kanalını kapat.")
            )
        ),
    /**
     * 
     * @param {Client} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async(client, interaction) => {        
        const embed = new EmbedBuilder()
            .setAuthor({
                name: interaction.guild.name,
                iconURL: interaction.guild.iconURL({ extension: 'png' })
            })
            .setTitle("SoftBot | Seviye Sistemi")
            .setColor(Colors.LuminousVividPink)
            .setFooter({
                text: "SoftBot | 2022 ©",
                iconURL: client.user.displayAvatarURL()
            })
        let database = await GuildSchema.findOne({
            guildId: interaction.guild.id
        });
        const subcmdGroup = interaction.options.getSubcommandGroup() || null;
        const subcmd = interaction.options.getSubcommand() || null;
        if(subcmdGroup == null) {
            if(subcmd == "aç") {
                if(!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
                    embed.setDescription("❌ | Bunun için `Sunucuyu Yönet` yetkisine sahip olmalısınız.")
                    return interaction.editReply({
                        embeds: [embed]
                    })
                }
                database.levellingSystem.enabled = true;
                embed.setDescription(`
✔ | Seviye sistemi başarıyla aktifleştirildi.
                `)
            } else if(subcmd == "kapat") {
                if(!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
                    embed.setDescription("❌ | Bunun için `Sunucuyu Yönet` yetkisine sahip olmalısınız.")
                    return interaction.editReply({
                        embeds: [embed]
                    })
                }
                database.levellingSystem.enabled = false;
                embed.setDescription(`
✔ | Seviye sistemi başarıyla deaktifleştirildi.
                `)
            } else if(subcmd == "ayarlar") {
                let enabled = database.levellingSystem.enabled;
                let log_channel = interaction.guild.channels.cache.get(database.levellingSystem.channelId) || null;
                let log_message = database.levellingSystem.LevelUpMessage;
                let xp_per_message = database.levellingSystem.XpPerMessage;

                embed.setDescription(`
**Durum:**
> ${enabled ? "🟢" : "🔴"}
> Komut: \`/seviye aç/kapat\`

**Log Kanalı:**
> ${log_channel?.name ? `${log_channel} (${log_channel?.id})` : "Kapalı"}
> Komut: \`/seviye kanal ayarla/sıfırla\`

**Log Mesajı:**
> ${log_message}
> Komut: \`/seviye mesaj ayarla/sıfırla\`

**Mesaj başı XP:**
> ${xp_per_message}
> Komut: \`/seviye xp ayarla\`
                `)
            }
        }
        if(subcmdGroup === "xp") {
            if(!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
                embed.setDescription("❌ | Bunun için `Sunucuyu Yönet` yetkisine sahip olmalısınız.")
                return interaction.editReply({
                    embeds: [embed]
                })
            }
            if(subcmd === "ayarla") {
                let xp = interaction.options.getInteger('xp') || 3;
                database.levellingSystem.XpPerMessage = xp;
                embed.setDescription(`
✔ | Mesaj başı XP başarıyla \`${xp}\` olarak ayarlandı.
                `)
            }
        }
        if(subcmdGroup === "mesaj") {
            if(!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
                embed.setDescription("❌ | Bunun için `Sunucuyu Yönet` yetkisine sahip olmalısınız.")
                return interaction.editReply({
                    embeds: [embed]
                })
            }
            if(subcmd === "ayarla") {
                let mesaj_str = interaction.options.getString("mesaj");
                database.levellingSystem.LevelUpMessage = `${mesaj_str}`;
                embed.setDescription(`
✔ | Başarıyla Seviye log mesajı ayarlandı.

**Mesaj:**
\`\`\`
${
mesaj_str.replaceAll("\\n", `
`)

}
\`\`\`
**Örnek:**
${mesaj_str
    .replaceAll("{{old_level}}", 0)
    .replaceAll("{{level}}", 1)
    .replaceAll("{{next_level}}", 2)
    .replaceAll("{{member}}", `${interaction.member}`)
    .replaceAll("\\n", `
`)
}
                `);
            } else if(subcmd === "sıfırla") {
                let mesaj_str = "⚡ | {{member}} kişisi seviye atladı! **{{old_level}}** → **{{level}}**"
                database.levellingSystem.LevelUpMessage = `${mesaj_str}`
                embed.setDescription(`
✔ | Başarıyla Seviye log mesajı sıfırlandı.

**Mesaj:**
\`\`\`
${
mesaj_str.replaceAll("\\n", `
`)

}
\`\`\`
**Örnek:**
${mesaj_str
    .replaceAll("{{old_level}}", 0)
    .replaceAll("{{level}}", 1)
    .replaceAll("{{next_level}}", 2)
    .replaceAll("{{member}}", `${interaction.member}`)
    .replaceAll("\\n", `
`)}
                `);
            }
        }
        if(subcmdGroup === "kanal") {
            if(!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
                embed.setDescription("❌ | Bunun için `Sunucuyu Yönet` yetkisine sahip olmalısınız.")
                return interaction.editReply({
                    embeds: [embed]
                })
            }
            if(subcmd === "ayarla") {
                let channel = interaction.options.getChannel('kanal');
                if(interaction.guild.members.me.permissionsIn(channel).has(PermissionsBitField.Flags.SendMessages)) {
                    database.levellingSystem.channelId = `${channel.id}`;
                    embed.setDescription(`
✔ | Başarıyla Seviye log kanalı ayarlandı.

**Kanal Bilgileri:**
> ID: \`${channel.id}\`
> Adı: \`${channel.name}\`
                    `);
                } else {
                    embed.setDescription("❌ | Kanala mesaj göndermek için yetkim yok!");
                }
            } else if(subcmd == "sıfırla") {
                database.levellingSystem.channelId = `0`;
                embed.setDescription(`
✔ | Başarıyla Seviye log kanalı deaktif bırakıldı..
                `);
            }
        }
        await database.save();
        interaction.editReply({
            embeds: [embed]
        })
    }
}