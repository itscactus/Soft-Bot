const { SlashCommandBuilder, Client, ChatInputCommandInteraction, AttachmentBuilder, EmbedBuilder, Colors } = require("discord.js");
const CoinHistorySchema = require("../../models/CoinHistorySchema");
const UserSchema = require("../../models/UserSchema");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("hesabım")
        .setDescription("Soft Bot | Banka Hesabınız"),
    /**
     * 
     * @param {Client} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async(client, interaction) => {

        let userDB = await UserSchema.findOne({
            userId: interaction.member.id
        });
        if(!userDB) {
            userDB = await new UserSchema({
                userId: interaction.member.id,
            }).save();
        }
        
        let girisCoins = await CoinHistorySchema.find({
            to: `${interaction.member.id}`
        })
        let cikisCoins = await CoinHistorySchema.find({
            from: `${interaction.member.id}`
        });

        let filteredGirisler = girisCoins.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4);
        let filteredCikislar = cikisCoins.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4);

        let cikisLogs = await Promise.all(filteredCikislar.map(async(cikis) => {
            let user = await client.users.fetch(cikis.from).catch(err => ({
                tag: cikis.from
            }));

            return `\`${user ? user.tag : cikis.to}\` tarafından <t:${Math.floor(cikis.date.getTime() / 1000)}:R> -${cikis.amount} coin`
        }));
        let girisLogs = await Promise.all(filteredGirisler.map(async(giris) => {
            let user = await client.users.fetch(giris.from).catch(err => ({
                tag: giris.from
            }));

            return `\`${user ? user.tag : giris.from}\` tarafından <t:${Math.floor(giris.date.getTime() / 1000)}:R> +${giris.amount} coin`
        }));

        const embed = new EmbedBuilder()
            .setAuthor({
                name: `${interaction.user.tag}`,
                iconURL: `${interaction.user.displayAvatarURL({ extension: "png" })}`
            })
            .setTitle("Hesap Aktiviteleriniz")
            .setDescription(`
> Hesabınızda **${userDB.coins}** coin bulunuyor.

**Giriş Aktiviteleri**
${filteredGirisler.length > 0 ? girisLogs.join('\n') : "`Temiz Görünüyor`"}

**Çıkış Aktiviteleri**
${filteredCikislar.length > 0 ? cikisLogs.join('\n') : "`Temiz Görünüyor`"}

**Not:** *Eğer bilginiz dışında bir aktivite bulunuyorsa bir yetkili ile görüşünüz.*
            `)
            .setFooter({
                text: "SoftBot | Hesap Aktiviteleri",
                iconURL: client.user.displayAvatarURL()
            })
            .setColor(Colors.LuminousVividPink)
        interaction.editReply({
            embeds: [embed]
        })
    }
}