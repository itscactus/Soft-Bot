const { SlashCommandBuilder, Client, EmbedBuilder, Colors, ChannelType, ChatInputCommandInteraction, PermissionsBitField, PermissionFlagsBits } = require("discord.js");
const hexToDec = require("../../methods/hexToDec");
const hexValid = require("../../methods/hexValid");
const parsePlaceholders = require("../../methods/parsePlaceholders");
const GuildSchema = require("../../models/GuildSchema");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("otorol")
        .setDescription("Soft Bot | OtoRol Sistemi")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addSubcommand(subcmd => subcmd
            .setName("ayarlar")
            .setDescription("Otorol sisteminin ayarlarını görüntüle")
        )
        .addSubcommand(subcmd => subcmd
            .setName("kapat")
            .setDescription("Otorol sistemini kapat.")
        )
        .addSubcommandGroup(subcmdGroup => subcmdGroup
            .setName("ayarla")
            .setDescription("Otorol sistemini ayarla")
            .addSubcommand(subcmd => subcmd
                .setName("log")
                .setDescription('Otorol log kanalını ayarla')
                .addChannelOption(opt => opt
                    .setName("kanal")
                    .setDescription("Otorol log kanalı")
                    .addChannelTypes(ChannelType.GuildText)
                    .setRequired(true)
                )
            )
            .addSubcommand(subcmd => subcmd
                .setName("rol")
                .setDescription("Otorol verilcek rol")
                .addRoleOption(opt => opt
                    .setName("rol")
                    .setDescription("Verilecek Rol")
                    .setRequired(true)
                )
            )
        )
        .addSubcommandGroup(subcmdGroup => subcmdGroup
            .setName("embed")
            .setDescription("Otorol Log embed ayarlamaları")
            .addSubcommand(subcmd => subcmd
                .setName("author") 
                .setDescription("Otorol Log embed author ayarla.")
                .addStringOption(opt => opt
                    .setName("name")
                    .setRequired(false)
                    .setMaxLength(32)
                    .setDescription("Placeholderlar: {{user_tag}} {{user_id}} {{guild_name}} {{role}} {{role_id}}")
                )
                .addStringOption(opt => opt
                    .setName("icon")
                    .setDescription("Placeholderlar: {{user_avatar}} {{guild_icon}}")
                    .setRequired(false)
                )
            )
            .addSubcommand(subcmd => subcmd
                .setName("title")
                .setDescription("Otorol log Embed başlığını düzenle")
                .addStringOption(opt => opt
                    .setName("text")
                    .setMaxLength(80)
                    .setDescription("Placeholderlar: {{user_tag}} {{user_name}} {{user_id}} {{guild_name}} {{role}} {{role_id}}")
                )
            )
            .addSubcommand(subcmd => subcmd
                .setName("description")
                .setDescription("Otorol log Embed içeriğini düzenle")
                .addStringOption(opt => opt
                    .setName("text")
                    .setMaxLength(1024)
                    .setDescription("Placeholderlar: {{user_tag}} {{user_name}} {{user_id}} {{guild_name}} {{role}} {{role_id}}")
                )
            )
            .addSubcommand(subcmd => subcmd
                .setName("footer") 
                .setDescription("Otorol Log embed footer ayarla.")
                .addStringOption(opt => opt
                    .setName("text")
                    .setRequired(false)
                    .setMaxLength(32)
                    .setDescription("Placeholderlar: {{user_tag}} {{user_id}} {{guild_name}} {{role}} {{role_id}}")
                )
                .addStringOption(opt => opt
                    .setName("icon")
                    .setDescription("Placeholderlar: {{user_avatar}} {{guild_icon}}")
                    .setRequired(false)
                )
            )
            .addSubcommand(subcmd => subcmd
                .setName("color")
                .setDescription("Otorol embed rengini ayarla.")
                .addStringOption(opt => opt
                    .setName("hex")
                    .setDescription("Lütfen hex kodu olarak giriniz!")
                    .setRequired(true)
                )
            )
            .addSubcommand(subcmd => subcmd
                .setName("önizleme")
                .setDescription("Otorol Embedini önizle")
            )
            .addSubcommand(subcmd => subcmd
                .setName("sıfırla")
                .setDescription("Otorol log embedini sıfırlar.")
            )
        ),
    /**
     * 
     * @param {Client} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async(client, interaction) => {        
        let embed = new EmbedBuilder()
            .setAuthor({
                name: interaction.guild.name,
                iconURL: interaction.guild.iconURL({ extension: 'png' })
            })
            .setTitle("SoftBot | Otorol Sistemi")
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
        if(!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            embed.setDescription("❌ | Bunun için `Rolleri Yönet` yetkisine sahip olmalısınız.")
            return interaction.editReply({
                embeds: [embed]
            })
        }
        if(subcmdGroup === null) {
            if(subcmd === "ayarlar") {
                let channel = interaction.guild.channels.cache.get(database.autoRole.channelId) || null;
                let role = interaction.guild.roles.cache.get(database.autoRole.roleId) || null;
                embed.setDescription(`
**Durum**
> Kanal: ${channel ? '🟢' : '🔴'}
> Rol: ${role ? '🟢' : '🔴'}
> Komut: \`/otorol [ayarla/kapat]\`

**Log Kanalı**
> ${channel ? `${channel} (${channel.id})` : "Kapalı"}
> Komut: \`/otorol ayarla log\`

**Rol**
> ${role ? `${role} (${role.id})` : "Kapalı"}
> Komut: \`/otorol ayarla rol\`
                `)
            }
            if(subcmd === "kapat") {
                database.autoRole.channelId = null;
                database.autoRole.roleId = null;
                embed.setDescription(`✔ | Otorol sistemi kapatıldı.`)
            }
        }
        if(subcmdGroup === "ayarla") {
            if(subcmd === "log") {
                let kanal = interaction.options.getChannel("kanal");
                if(!interaction.guild.members.me.permissionsIn(kanal).has(PermissionsBitField.Flags.SendMessages) 
                && !interaction.guild.members.me.permissionsIn(kanal).has(PermissionsBitField.Flags.EmbedLinks)) {
                    embed.setDescription(`❌ | ${kanal} Kanalına mesaj yada embed gönderemiyorum.`);
                    return interaction.editReply({
                        embeds: [embed]
                    });
                }
                database.autoRole.channelId = `${kanal.id}`;
                embed.setDescription(`
✔ | Otorol kanalı ayarlandı.

**Kanal bilgileri:**
> Adı: \`${kanal.name}\`
> İD: \`${kanal.id}\`
                `);
            }
            if(subcmd === "rol") {
                let rol = interaction.options.getRole("rol");
                
                database.autoRole.roleId = `${rol.id}`;
                embed.setDescription(`
✔ | Otorol rolü ayarlandı.

**Rol bilgileri:**
> Adı: \`${rol.name}\`
> İD: \`${rol.id}\`
                `);
            }
        }
        if(subcmdGroup === "embed") {
            if(subcmd === "author") {
                let icon = interaction.options.getString("icon") || null;
                let name = interaction.options.getString("name") || null;

                if(icon != null) database.autoRole.message.embed.author.iconURL = `${icon}`;
                if(name != null) database.autoRole.message.embed.author.name = `${name}`;
                embed.setDescription(`
✔ | Embed \`author\` bölümü değiştirildi.

**Değişiklikler:**
${icon ? `> İcon (resim) kısmı değiştirildi.\n` : ''}${name ? `> Name (isim) kısmı değiştirildi.` : ''}
                `)
            }
            if(subcmd === "title") {
                let text = interaction.options.getString("text") || null;

                if(text != null) database.autoRole.message.embed.title = `${text}`;
                embed.setDescription(`
✔ | Embed \`title\` bölümü değiştirildi.

**Değişiklikler:**
${text ? `> Text (Yazı) kısmı değiştirildi.` : ''}
                `)
            }
            if(subcmd === "description") {
                let text = interaction.options.getString("text") || null;

                if(text != null) database.autoRole.message.embed.description = `${text}`;
                embed.setDescription(`
✔ | Embed \`description\` bölümü değiştirildi.

**Değişiklikler:**
${text ? `> Text (Yazı) kısmı değiştirildi.` : ''}
                `)
            }
            if(subcmd === "footer") {
                let icon = interaction.options.getString("icon") || null;
                let text = interaction.options.getString("text") || null;

                if(icon != null) database.autoRole.message.embed.footer.iconURL = `${icon}`;
                if(text != null) database.autoRole.message.embed.footer.text = `${text}`;
                embed.setDescription(`
✔ | Embed \`footer\` bölümü değiştirildi.

**Değişiklikler:**
${icon ? `> İcon (resim) kısmı değiştirildi.\n` : ''}${text ? `> Text (yazı) kısmı değiştirildi.` : ''}
                `)
            }
            if(subcmd === "color") {
                let hex = interaction.options.getString("hex");
                let validHex = hexValid(hex);
                if(validHex) {
                    database.autoRole.message.embed.color = `${hexToDec(hex.replaceAll("#", "")) - 1}`;
                    embed.setDescription(`
✔ | Embed rengi başarıyla ${hex} olarak ayarlandı.
                    `)
                } else {
                    embed.setDescription(`
❌ | ${hex} geçerli bir hex kodu değil.
                    `)
                }
            }
            if(subcmd === "sıfırla") {
                database.autoRole.message.embed.author = {
                    iconURL: '{{user_avatar}}',
                    name: '{{user_tag}}'
                };
                database.autoRole.message.embed.description = 'Sunucumuza hoşgeldin {{user}}, {{autorole}} rolün verildi.';
                database.autoRole.message.embed.title = 'OtoRol verildi!';
                database.autoRole.message.embed.footer = {
                    iconURL: '{{guild_icon}}',
                    text: 'Soft Bot | 2022 ©'
                };

                embed.setDescription(`
✔ | Otorol embedi sıfırlandı.
                `);
            }
            if(subcmd === "önizleme") {
                let embedJSON = database.autoRole.message.embed;
                let parsed = parsePlaceholders.autoRoleParse(interaction.guild, interaction.user, embedJSON, database);
                embed = new EmbedBuilder(parsed);
                // embed.setColor(database.autoRole.message.embed.color);
            }
        }
            
        await database.save();
        interaction.editReply({
            embeds: [embed]
        })
    }
}