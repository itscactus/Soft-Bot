const { SlashCommandBuilder, Client, EmbedBuilder, Colors, ChatInputCommandInteraction } = require("discord.js");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cheerio = require('cheerio-without-node-native');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("lyrics")
        .setDescription("Soft Bot | Şarkı Sözlerini bul/ara")
        .addStringOption(opt => opt
            .setName("arama")
            .setDescription("Lyrics için aranacak şarkı")
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
            .setTitle("SoftBot | Şarkı Sözleri")
            .setColor(Colors.LuminousVividPink)
            .setThumbnail(interaction.user.displayAvatarURL())
            .setFooter({
                text: "SoftBot ❤ Genius"
            })
        
        let searchSong = await fetch(`https://api.genius.com/search?q=${search}`, {
            headers: {
                'Authorization': 'Bearer ' + process.env.API_GENIUS_KEY,
            }
        }).then(res => res.json());
        let emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣"] // "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"]
        let hits = searchSong.response.hits.slice(0, emojis.length);

        embed.setTitle("SoftBot | 🔍 Sonuçlar")
        .setDescription(`
> ${hits.length >= 1 ? hits.map((hit, index) => `${emojis[index]}: ${hit['result']['artist_names']} \`-\` ${hit['result']['title_with_featured']}`).join("\n> ") : "Sonuç bulunamadı."}

⚠️ | _Bir seçenek seçmek için 20 saniyen var._
        `)

        let msg = await interaction.editReply({
            embeds: [embed]
        });
        hits.map((hit, index) => msg.react(emojis[index]).catch(err => console.log));
        let filter = (reaction, user) => (user.id == interaction.user.id && emojis.includes(reaction.emoji.name));
        let collector = msg.createReactionCollector({
            filter,
            max: 1,
            time: 20 * 1000,
        });
        collector.on("collect", async(reaction, user) => {

            reaction.message.reactions.removeAll();
            let index = emojis.findIndex((e) => e === reaction.emoji.name);
            let hit = hits[index];
            let api_path = hit['result']['api_path'];
            let path = hit['result']['path'];
            let song = await fetch(`https://genius.com${path}`).then(res => res.text());
            const $ = cheerio.load(song);
            let lyrics = $('div[class="lyrics"]').text().trim() ? $('div[class="lyrics"]').text().trim() : '';
            if(lyrics == '') {
                $('div[class^="Lyrics__Container"]').each((i, elem) => {
                    if ($(elem).text().length !== 0) {
                        let snippet = $(elem)
                            .html()
                            .replace(/<br>/g, '\n')
                            .replace(/<(?!\s*br\s*\/?)[^>]+>/gi, '');
                        lyrics += $('<textarea/>').html(snippet).text().trim() + '\n\n';
                    }
                });
            }
            let maxPages = (Math.ceil(lyrics.length / 500) || 1) -1;
            let page = 0; 
            embed.setTitle(`${hit['result']['artist_names']} - ${hit['result']['title']}`);
            embed.setDescription(`> ${lyrics.slice(page * 500, page * 500 + 500)}`);
            interaction.editReply({
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
                if(page > maxPages) page = 0;
                if(react.emoji.name === "◀️") page--;
                if(page < 0) page = maxPages;
    
                embed.setDescription(`
${lyrics.slice(page * 500, page * 500 + 500)}
                `);
                embed.setAuthor({
                    name: `Sayfa ${page + 1}/${maxPages + 1}`
                });
                interaction.editReply({
                    embeds: [embed]
                })
            })
        })
    }
}