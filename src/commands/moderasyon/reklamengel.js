const { SlashCommandBuilder, Client, CommandInteraction, EmbedBuilder, Colors, PermissionFlagsBits } = require("discord.js");
const { readdirSync, readFileSync } = require("fs");
const GuildSchema = require("../../models/GuildSchema");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("reklamengel")
        .setDescription("Soft Bot | Reklam Engelleme")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(subcmd => subcmd
            .setName("aç")
            .setDescription("Reklam engellemeyi açar.")
        )
        .addSubcommand(subcmd => subcmd
            .setName("kapat")
            .setDescription("Reklam engellemeyi kapatır.")
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
            .setTitle("SoftBot | Reklam Engel")
            .setColor(Colors.LuminousVividPink)
            .setFooter({
                text: "SoftBot | Reklam Engelleme",
                iconURL: client.user.displayAvatarURL()
            });
        
        let guildDB = await GuildSchema.findOne({
            guildId: `${interaction.guild.id}`
        });
        let subCommandGroup = interaction.options.getSubcommandGroup(); 
        let subCommand = interaction.options.getSubcommand(); 
        if(subCommandGroup == null) {
            if(subCommand == "aç") {
                let reklam = require(`${process.cwd()}/assets/liste/reklam/reklam.json`);
                
                embed.setDescription(`
> Reklam koruma sistemi başarıyla aktifleştirildi!

**Bilgi**
> **${reklam['tlds'].length}** adet uzantı engellenecektir.
                `)
                guildDB.reklamKoruma.enabled = true;

            } else if(subCommand == "kapat") {
                embed.setDescription(`
> Reklam koruma sistemi başarıyla deaktifleştirildi! Artık reklamlar engellenmeyecektir.
                `)
                guildDB.reklamKoruma.enabled = false;
            }
        }
        await guildDB.save();
        interaction.editReply({
            embeds: [embed]
        })
    }
}