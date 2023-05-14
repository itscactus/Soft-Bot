const { SlashCommandBuilder, Client, EmbedBuilder, Colors, ChatInputCommandInteraction, AttachmentBuilder } = require("discord.js");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cheerio = require('cheerio-without-node-native');
const { createCanvas, loadImage } = require("@napi-rs/canvas");
const roundedImage = require("../../methods/roundedImage");
const applyText = require("../../methods/applyText");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ülke")
        .setDescription("Soft Bot | Ülke Bilgilerini Görüntüle")
        .addStringOption(opt => opt
            .setName("arama")
            .setDescription("Bilgi için aranacak ülke")
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
            .setTitle("SoftBot | Ülke arama")
            .setColor(Colors.LuminousVividPink)
            .setThumbnail(interaction.user.displayAvatarURL())
            .setFooter({
                text: "SoftBot ❤ RestCountries"
            })
        let countries = await fetch(`https://restcountries.com/v3.1/all`).then(res => res.json()).catch(err => null);
        if(countries == null) return interaction.editReply({
            embeds: [embed.setDescription("❌ | API de bir hata oluştu.")]
        });
        let countryData = countries.filter((country) => 
            country.cca2.toLowerCase() == search.toLowerCase()
            || `${country.ccn3}`.toLowerCase() == search.toLowerCase()
            || `${country.cca3}`.toLowerCase() == search.toLowerCase()
            || `${country.cioc}`.toLowerCase() == search.toLowerCase()
            || `${country.name.common}`.toLowerCase() == search.toLowerCase()
            || `${country.name.official}`.toLowerCase() == search.toLowerCase()
        )[0] || null;
        if(countryData == null) return interaction.editReply({
            embeds: [embed.setDescription("❌ | Ülke Bulunamadı!")]
        });

        const canvas = createCanvas(600, 300);
        const ctx = canvas.getContext("2d");

        ctx.save();
        ctx.shadowColor = "black";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        ctx.fillStyle = "#eeeee5";
        ctx.strokeStyle = "#eeeee5";
        ctx.beginPath()
        ctx.roundRect(0,0, 600, 300,10);
        ctx.fill();

        const flag = await loadImage(countryData.flags.png);
        ctx.beginPath()
        roundedImage(ctx, 430, 10, flag.width/2, flag.height/2, 6);
        ctx.clip();
        ctx.drawImage(flag, 430, 10, flag.width/2, flag.height/2);
        ctx.restore();

        ctx.font = ` 25px poppins`;
        ctx.textAlign = "start";
        ctx.fillStyle = "black";
        ctx.fillText(`${countryData.translations.tur.official || countryData.name.official}`, 20, 40);


        ctx.font = ` 20px poppins`;
        ctx.textAlign = "start";
        ctx.fillStyle = "black";
        ctx.fillText(`Ana Dil`, 20, 80);
        ctx.beginPath()
        ctx.roundRect(20, 90, 300, 20, 10);
        ctx.fill();
        ctx.restore();
        ctx.font = applyText(canvas, `${Object.values(countryData.languages).join(", ")}`, 25, 300, false);
        ctx.textAlign = "start";
        ctx.fillStyle = "white";
        ctx.fillText(`${Object.values(countryData.languages).join(", ")}`, 30, 105);
        
        ctx.font = ` 20px poppins`;
        ctx.textAlign = "start";
        ctx.fillStyle = "black";
        ctx.fillText(`Para Birimi`, 20, 150);
        ctx.beginPath()
        ctx.roundRect(20, 160, 300, 20, 10);
        ctx.fill();
        ctx.restore();
        ctx.font = applyText(canvas, `${Object.values(countryData.currencies).map(currency => currency.name + '(' + currency.symbol + ')').join("`, `")}`, 25, 300, false);
        ctx.textAlign = "start";
        ctx.fillStyle = "white";
        ctx.fillText(`${Object.values(countryData.currencies).map(currency => currency.name + '(' + currency.symbol + ')').join("`, `")}`, 30, 175);

        ctx.font = ` 20px poppins`;
        ctx.textAlign = "start";
        ctx.fillStyle = "black";
        ctx.fillText(`Bağımsız`, 360, 150);
        ctx.beginPath()
        ctx.roundRect(360, 160, 300/2, 20, 10);
        ctx.fill();
        ctx.restore();
        ctx.font = applyText(canvas, `${countryData.independent ? 'Evet' : 'Hayır'}`, 25, 300, false);
        ctx.textAlign = "start";
        ctx.fillStyle = "white";
        ctx.fillText(`${countryData.independent ? 'Evet' : 'Hayır'}`, 370, 175);

        ctx.font = ` 20px poppins`;
        ctx.textAlign = "start";
        ctx.fillStyle = "black";
        ctx.fillText(`Nüfüs`, 20, 220);
        ctx.beginPath()
        ctx.roundRect(20, 230, 300, 20, 10);
        ctx.fill();
        ctx.restore();
        ctx.font = applyText(canvas, `${countryData.population}`, 25, 300, false);
        ctx.textAlign = "start";
        ctx.fillStyle = "white";
        ctx.fillText(`${countryData.population}`, 30, 245);

        ctx.font = ` 20px poppins`;
        ctx.textAlign = "start";
        ctx.fillStyle = "black";
        ctx.fillText(`Başkent`, 360, 220);
        ctx.beginPath()
        ctx.roundRect(360, 230, 300/2, 20, 10);
        ctx.fill();
        ctx.restore();
        ctx.font = applyText(canvas, `${countryData.capital.join("`, `")}`, 25, 300, false);
        ctx.textAlign = "start";
        ctx.fillStyle = "white";
        ctx.fillText(`${countryData.capital.join("`, `")}`, 370, 245);

        const attachment = new AttachmentBuilder(await canvas.encode('png'), {
            name: "ülke.png"
        })
        interaction.editReply({
            embeds: [],
            files: [attachment]
        })
    }
}