const { createCanvas, loadImage } = require("@napi-rs/canvas");
const { SlashCommandBuilder, Client, ChatInputCommandInteraction, AttachmentBuilder } = require("discord.js");
const calculateProgress = require("../../methods/calculateProgress");
const MemberSchema = require("../../models/MemberSchema");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
module.exports = {
    data: new SlashCommandBuilder()
        .setName("rank")
        .setDescription("Soft Bot | Seviye kartı")
        .addUserOption(opt => opt
            .setName("kullanici")
            .setDescription("Seviye kartını görüntüleyeceğiniz kişi.")
            .setRequired(false)    
        ),
    /**
     * 
     * @param {Client} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async(client, interaction) => {

        
        var member = interaction.options.getMember('kullanici') || interaction.member;
        if(member.bot) return interaction.editReply({
            content: "Bot kullanıcıların Seviye kartına bakamazsın"
        });
        var memberDB = await MemberSchema.findOne({
            guildId: interaction.guild.id,
            userId: member.id
        })
        
        if(!memberDB) {
            memberDB = new MemberSchema({
                guildId: interaction.guild.id,
                userId: member.id
            }).save();
        }

        let canvas = createCanvas(400, 98);
        let ctx = canvas.getContext("2d");
        let bg = await loadImage(`${process.cwd()}/assets/RankCard.png`);
        ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
        let avatar = await loadImage(member.displayAvatarURL({ extension: 'png', forceStatic: true, size: 128 }));
        // Tag
        ctx.font = '20px sans-serif'
        ctx.fillStyle = 'white'
        ctx.fillText(member.user.tag, 100, 40)
        // Seviye
        ctx.font = '10px sans-serif';
        ctx.fillStyle = 'white';
        ctx.textAlign = "center"
        ctx.fillText(memberDB.level, (canvas.width)/1.175, 35);

        // XP
        ctx.font = '10px sans-serif';
        ctx.fillStyle = 'white';
        ctx.textAlign = "center"
        ctx.fillText(memberDB.xp, (canvas.width)/1.175, 84.5);
        // Status
        let status = member.presence?.status;
        var color;
        if(status == "dnd") {
            color = "red";
        } else if(status == "online") {
            color = "green";
        } else if(status == "idle") {
            color = "orange";
        } else if(status == "streaming") {
            color = "magenta";
        } else {
            color = "gray";
        }

        ctx.beginPath();
        ctx.arc(60, 50, 34, 0, Math.PI * 2);
        ctx.strokeStyle = color
        ctx.stroke();

        // XP PRogress
        ctx.font = `bold 10px sans-serif`;
        ctx.textAlign = "start";
        ctx.fillText(memberDB.xp + "/" + memberDB.level * 300, 150, 60);
        
        // XP Bar
        ctx.beginPath()
        ctx.fillStyle = "white";
        ctx.fillRect(100, 70, calculateProgress(memberDB.level * 300, memberDB.xp), 10);

        ctx.beginPath();
        ctx.strokeStyle = "gray";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(100, 70, 150, 10);
        
        ctx.save();
        // Yuvarlak
        ctx.beginPath();
        ctx.arc(60, 50, 32, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // Avatar
        ctx.drawImage(avatar, 30, 17, 64, 64)
        ctx.restore();
        const attachment = new AttachmentBuilder(await canvas.encode("png"), {
            name: "RankCard.png"
        })
        interaction.editReply({
           files: [attachment]
        })
    }
}