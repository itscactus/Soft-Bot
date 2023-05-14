const UserSchema = require("../../models/UserSchema");
const { SlashCommandBuilder, Client, ChatInputCommandInteraction, AttachmentBuilder, EmbedBuilder, Colors } = require("discord.js");
const { createCanvas, loadImage } = require("@napi-rs/canvas");
const CoinHistorySchema = require("../../models/CoinHistorySchema");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("günlüködül")
        .setDescription("Soft Bot | Günlük Ödül"),
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
        const now = new Date();
        const nextTake = userDB.lastDailyTaken?.setDate(userDB.lastDailyTaken.getDate() + 1) || now;
        const between = nextTake - now;
        const hours = Math.floor(between / (1000 * 60 * 60));
        const minutes = Math.floor((between % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((between % (1000 * 60)) / 1000);
        const canvas = createCanvas(400, 300);
        const ctx = canvas.getContext("2d");
        ctx.save();
        ctx.shadowColor = "black";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        ctx.fillStyle = "#eeeee5";
        ctx.strokeStyle = "#eeeee5";
        ctx.beginPath();
        ctx.roundRect(0,0, 400, 300, 10);
        ctx.fill()
        ctx.restore();
        
        if(hours <= 0) {
            let coinstoAdd = Math.floor(Math.random() * 1000)
            const box = await loadImage(process.cwd() + "/assets/open-box.png");
            ctx.drawImage(box, 160, 50, 80, 80);
            const coin = await loadImage(process.cwd() + "/assets/coin.png");
            ctx.drawImage(coin, 220, 40, 32, 32);
            ctx.drawImage(coin, 185, 30, 32, 32);
            ctx.drawImage(coin, 185, 50, 32, 32);
            ctx.drawImage(coin, 150, 40, 32, 32);

            ctx.beginPath();
            ctx.roundRect(140, 150, 120, 30, 10);
            ctx.fill();
            ctx.restore()
            ctx.font = '20px poppins';
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText(`+${coinstoAdd} coin`, 200, 172);
            userDB.coins += coinstoAdd;
            await new CoinHistorySchema({
                amount: coinstoAdd,
                date: new Date(),
                to: `${interaction.member.id}`,
                from: "Günlük Ödül"
            }).save();
            userDB.lastDailyTaken = now;
        } else {
            const box = await loadImage(process.cwd() + "/assets/box.png");
            ctx.drawImage(box, 160, 50, 80, 80);

            ctx.beginPath();
            ctx.roundRect(20, 150, 360, 30, 10);
            ctx.fill();
            ctx.restore()
            ctx.font = '20px poppins';
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText(`${hours}s. ${minutes}dk. ${seconds}sn sonra tekrar dene.`, 200, 172);
        }
        await userDB.save();
        const attachment = new AttachmentBuilder(await canvas.encode('png'), {
            name: "GünlükÖdül.png"
        })
        interaction.editReply({
            files: [attachment]
        })
    }
}