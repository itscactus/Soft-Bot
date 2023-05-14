const { SlashCommandBuilder, Client, EmbedBuilder, Colors, ChatInputCommandInteraction } = require("discord.js");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cheerio = require('cheerio-without-node-native');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("film")
        .setDescription("Soft Bot | Film arama")
        .addStringOption(opt => opt
            .setName("arama")
            .setDescription("Aranacak film")
            .setRequired(true)    
        ),
    /**
     * 
     * @param {Client} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async(client, interaction) => {
        let search = interaction.options.getString('arama', true);
        const embed = new EmbedBuilder()
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setTitle("SoftBot | Film arama")
            .setColor(Colors.LuminousVividPink)
            .setThumbnail(interaction.user.displayAvatarURL())
            .setFooter({
                text: "SoftBot ❤ iTunes"
            })
        let film = await fetch(`https://itunes.apple.com/search?term=${search}&entity=movie&country=tr&lang=tr_tr`).then(res => res.json()).catch(err => null);
        if(film == null) return interaction.editReply({
            embeds: [embed.setDescription("❌ | API de bir hata oluştu.")]
        });
        let filmData = film.results[0] || null;
        if(filmData == null) return interaction.editReply({
            embeds: [embed.setDescription("❌ | Film Bulunamadı!")]
        });
        embed.setAuthor({
            name: `${filmData.trackName}`,
            iconURL: `${filmData.artworkUrl30}`
        });
        embed.setThumbnail(`${filmData.artworkUrl30.replaceAll("30x30bb.jpg", "1024x1024bb.jpg")}`)
        embed.setDescription(`
> Film: \`${filmData.trackName}\`
> Yapımcı: \`${filmData.artistName}\`
> Tür: \`${filmData.primaryGenreName}\`
> Yaş Kitlesi: \`${filmData.contentAdvisoryRating}\`
> Görüntüle: [iTunes](${filmData.trackViewUrl})
> Çıkış Tarihi: <t:${new Date(filmData.releaseDate).getTime() / 1000}> (<t:${new Date(filmData.releaseDate).getTime() / 1000}:R>)

**Açıklama:**
\`\`\`${filmData.longDescription}\`\`\`
        `)
        interaction.editReply({
            embeds: [embed]
        })
    }
}