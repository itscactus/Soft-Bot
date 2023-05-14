const { SlashCommandBuilder, Client, EmbedBuilder, Colors, ChatInputCommandInteraction } = require("discord.js");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cheerio = require('cheerio-without-node-native');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("atasöz")
        .setDescription("Soft Bot | Rastgele Atasözü gönderir."),
    /**
     * 
     * @param {Client} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async(client, interaction) => {
        const embed = new EmbedBuilder()
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setTitle("SoftBot | Atasözü")
            .setColor(Colors.LuminousVividPink)
            .setThumbnail(interaction.user.displayAvatarURL())
            .setFooter({
                text: "SoftBot | 2022 ©"
            })
        let api = await fetch(`https://raw.githubusercontent.com/Abdullah-V/Turkce-Atasozleri-icin-API/master/DATA.json`).then(res => res.json()).catch(err => null);
        if(api == null) return interaction.editReply({
            embeds: [embed.setDescription("❌ | API da bir hata oluştu!")]
        });
        let atasozler = Object.values(api['data'])[Math.floor(Math.random() * Object.values(api['data']).length)];
        let randomAtasoz = atasozler[Math.floor(Math.random() * atasozler.length)];
        embed.setDescription(randomAtasoz)
        interaction.editReply({
            embeds: [embed]
        })
    }
}