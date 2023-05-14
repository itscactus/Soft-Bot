const { SlashCommandBuilder, Client, CommandInteraction, EmbedBuilder, Colors, PermissionFlagsBits } = require("discord.js");
const { readdirSync, readFileSync } = require("fs");
const GuildSchema = require("../../models/GuildSchema");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("küfürengel")
        .setDescription("Soft Bot | Küfür Engelleme")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(subcmd => subcmd
            .setName("aç")
            .setDescription("Küfür engellemeyi açar.")
        )
        .addSubcommand(subcmd => subcmd
            .setName("kapat")
            .setDescription("Küfür engellemeyi kapatır.")
        ),
    /**
     * 
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     */
    run: async(client, interaction) => {
        const embed = new EmbedBuilder()
            .setAuthor({
                name: interaction.guild.name,
                iconURL: interaction.guild.iconURL({ extension: 'png' })
            })
            .setTitle("SoftBot | Küfür Engel")
            .setColor(Colors.LuminousVividPink)
            .setFooter({
                text: "SoftBot | Küfür Engelleme",
                iconURL: client.user.displayAvatarURL()
            });
        
        let guildDB = await GuildSchema.findOne({
            guildId: `${interaction.guild.id}`
        });
        let trKufur = readFileSync(`./assets/liste/küfür/tr.txt`, {encoding:'utf8', flag:'r'}).split("\n");
        let enKufur = readFileSync(`./assets/liste/küfür/en.txt`, {encoding:'utf8', flag:'r'}).split("\n");
        let subCommandGroup = interaction.options.getSubcommandGroup(); 
        let subCommand = interaction.options.getSubcommand(); 
        if(subCommandGroup == null) {
            if(subCommand == "aç") {
                embed.setDescription(`
> Küfür koruma sistemi başarıyla aktifleştirildi!

**Bilgi**
> **${trKufur.length}** adet Türkçe Küfür engellenecek.
> **${enKufur.length}** adet İngilizce Küfür engellenecek.
                `)
                guildDB.kufurKoruma.enabled = true;

            } else if(subCommand == "kapat") {
                embed.setDescription(`
> Küfür koruma sistemi başarıyla deaktifleştirildi! Artık küfürler engellenmeyecektir.
                `)
                guildDB.kufurKoruma.enabled = false;
            }
        }
        await guildDB.save();
        interaction.editReply({
            embeds: [embed]
        })
    }
}