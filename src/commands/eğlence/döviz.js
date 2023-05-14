const { SlashCommandBuilder, Client, EmbedBuilder, Colors, ChatInputCommandInteraction, AttachmentBuilder } = require("discord.js");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cheerio = require('cheerio-without-node-native');
const currencyData = require("./../../../currencies.json");
const { createCanvas, loadImage } = require("@napi-rs/canvas");
let currencies = currencyData.map((cur) => ({
    name: cur.CurrencyCode,
    value: cur.CurrencyCode.toLowerCase()
}))
module.exports = {
    data: new SlashCommandBuilder()
        .setName("döviz")
        .setDescription("Soft Bot | Döviz")
        .addSubcommand(cmd => cmd
            .setName("bozdur")
            .setDescription("Döviz Bozdur")
            .addStringOption(opt => opt
                .setName("kur1")
                .setDescription("Döviz kuru (Çevirilecek)")
                .setRequired(true)
            )
            .addStringOption(opt => opt
                .setName("kur2")
                .setDescription("Döviz kuru (Çevirilmiş)")
                .setRequired(true)
            )
            .addIntegerOption(opt => opt
                .setName("miktar")
                .setDescription("Çevirilecek miktar.")
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(99999)
            )
        )
        .addSubcommand(cmd => cmd
            .setName("bilgi")
            .setDescription("Döviz Bilgisi")
        ),
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
            .setTitle("SoftBot | Döviz")
            .setColor(Colors.LuminousVividPink)
            .setThumbnail(interaction.user.displayAvatarURL())
            .setFooter({
                text: "SoftBot ❤ Google"
            })
        let subcmd = interaction.options.getSubcommand();
        let subcmdGroup = interaction.options.getSubcommandGroup();
        if(subcmd === 'bozdur') {
            let cur1 = interaction.options.getString("kur1")
            let cur2 = interaction.options.getString("kur2")
            let amount = interaction.options.getInteger("miktar")


            let exchange = await fetch(`https://www.google.com/finance/quote/${cur1.toUpperCase()}-${cur2.toUpperCase()}`).then(res => res.text());
            const $ = cheerio.load(exchange);
            let out = $("div[class='YMlKec fxKbKc']").text();
            let lastOutput = Number(out.replaceAll(",", "")) * amount;
            if(currencies.filter(cur => cur.name == cur1.toUpperCase()).length <= 0 || currencies.filter(cur => cur.name == cur2.toUpperCase()).length <= 0) return interaction.editReply({
                embeds: [embed.setDescription("Lütfen geçerli döviz giriniz. \n\n> Döviz Listesi: `/döviz bilgi`")]
            });
            // const canvas = createCanvas(300, 500);
            // const ctx = canvas.getContext("2d");

            // ctx.save();
            // ctx.shadowColor = "black";
            // ctx.shadowBlur = 10;
            // ctx.shadowOffsetX = 3;
            // ctx.shadowOffsetY = 3;
            // ctx.fillStyle = "#eeeee5";
            // ctx.strokeStyle = "#eeeee5";
            // ctx.beginPath()
            // ctx.roundRect(0,0, 300, 500,10);
            // ctx.fill();

            // ctx.restore();
            // ctx.beginPath()
            // ctx.roundRect(80, 10, 140, 50, 10);
            // ctx.fill()

            // ctx.restore();
            // ctx.font = '40px poppins';
            // ctx.textAlign = "center";
            // ctx.fillStyle = "white";
            // ctx.fillText(`DÖVİZ`, 150, 50);
            
            // ctx.restore();
            // ctx.fillStyle = "black";
            // ctx.beginPath();
            // ctx.roundRect(20, 80, 70, 40, 10);
            // ctx.fill();
            
            // ctx.restore();
            // ctx.font = '30px poppins';
            // ctx.fillAlign = "center";
            // ctx.fillStyle = "white";
            // ctx.fillText(`${cur1.toUpperCase()}`, 55, 110);
            
            // ctx.restore();
            // ctx.fillStyle = "black";
            // ctx.beginPath();
            // ctx.roundRect(210, 80, 70, 40, 10);
            // ctx.fill();
            
            // ctx.restore();
            // ctx.font = '30px poppins';
            // ctx.fillAlign = "center";
            // ctx.fillStyle = "white";
            // ctx.fillText(`${cur2.toUpperCase()}`, 245, 110);
            // ctx.restore();
            // let left_arrow = await loadImage(process.cwd() + "/assets/left_arrow.png");
            // ctx.drawImage(left_arrow, 150, 70, 64, 64)
            // ctx.drawImage(left_arrow, 120, 70, 64, 64)
            // ctx.drawImage(left_arrow, 90, 70, 64, 64)

            // ctx.restore();
            // ctx.fillStyle = "black";
            // ctx.beginPath();
            // ctx.roundRect(20, 180, 115, 40, 10);
            // ctx.fill();
            
            // ctx.restore();
            // ctx.font = '30px poppins';
            // ctx.fillAlign = "center";
            // ctx.fillStyle = "white";
            // ctx.fillText(`Miktar`, 76, 210);
            // ctx.restore()
            // ctx.font = '25px poppins';
            // ctx.fillAlign = "start";
            // ctx.fillStyle = "black";
            // ctx.fillText(`${amount} ${cur1.toUpperCase()}`, 76, 245);

            // ctx.restore();
            // ctx.fillStyle = "black";
            // ctx.beginPath();
            // ctx.roundRect(200, 180, 90, 40, 10);
            // ctx.fill();
            
            // ctx.restore();
            // ctx.font = '30px poppins';
            // ctx.fillAlign = "center";
            // ctx.fillStyle = "white";
            // ctx.fillText(`Birim`, 245, 210);
            // ctx.restore()
            // ctx.font = '20px poppins';
            // ctx.fillAlign = "start";
            // ctx.fillStyle = "black";
            // ctx.fillText(`${(lastOutput / amount).toFixed(2)} ${cur2.toUpperCase()}`, 230, 245);

            // ctx.restore();
            // ctx.beginPath()
            // ctx.roundRect(80, 300, 140, 50, 10);
            // ctx.fill()

            // ctx.restore();
            // ctx.font = '30px poppins';
            // ctx.textAlign = "center";
            // ctx.fillStyle = "white";
            // ctx.fillText(`Sonuç`, 150, 335);
            // ctx.restore();
            // ctx.font = '30px poppins';
            // ctx.textAlign = "center";
            // ctx.fillStyle = "black";
            // ctx.fillText(`${lastOutput.toFixed(2)} ${cur2.toUpperCase()}`, 150, 380);
            embed.setDescription(`
**Döviz Bilgisi**
${Number(out) != NaN ? `
> İşlem: \`${cur1.toUpperCase()} -> ${cur2.toUpperCase()}\`
> Miktar: \`${amount}\`
> Sonuç: \`${lastOutput.toFixed(2)} ${cur2.toUpperCase()}\`


` : '`Döviz bilgisi alınamadı`'}
            `)
            // const attachment = new AttachmentBuilder(await canvas.encode('png'), {
            //     name: "döviz.png"
            // })
            interaction.editReply({
                embeds:[embed]
                // files: [attachment]
            })

        } else if(subcmd === 'bilgi') {
            let page = 0;
            let max_page = Math.ceil(currencies.length / 10) - 1;
            embed.setAuthor({
                name: "Sayfa 1/"+(max_page + 1)
            });
            embed.setDescription(`
**Döviz Bilgileri:**

${currencyData.map(cur => `> \`${cur.CurrencyCode}\` => \`${cur.CurrencyName}\``).slice(page * 10, page * 10 + 10).join("\n")}
            `)
            let msg = await interaction.editReply({
                embeds: [embed]
            });
            msg.react("◀️").catch(err => {})
            msg.react("▶️").catch(err => {})
            let filter = (react, usr) => (usr.id == interaction.user.id && (react.emoji.name === "▶️" || react.emoji.name == "◀️"));
            let collector = msg.createReactionCollector({
                filter
            });
            collector.on("collect", async(react, usr) => {
                react.users.remove(usr);
                if(react.emoji.name === "▶️") page++;
                if(page > max_page) page = 0;
                if(react.emoji.name === "◀️") page--;
                if(page < 0) page = max_page;
                embed.setAuthor({
                    name: "Sayfa " + (page + 1) + "/"+(max_page + 1)
                })
                embed.setDescription(`
**Döviz Bilgileri**

${currencyData.map(cur => `> \`${cur.CurrencyCode}\` => \`${cur.CurrencyName}\``).slice(page * 10, page * 10 + 10).join('\n')}
                `);
                embed.setAuthor({
                    name: `Sayfa ${page + 1}/${max_page + 1}`
                });
                interaction.editReply({
                    embeds: [embed]
                })
            })
        }
    }
}