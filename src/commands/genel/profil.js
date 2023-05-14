const { createCanvas, loadImage } = require("@napi-rs/canvas");
const { SlashCommandBuilder, Client, CommandInteraction, EmbedBuilder, Colors, AttachmentBuilder } = require("discord.js");
const { readdirSync } = require("fs");
const applyText = require("../../methods/applyText");
const buildUserProfile = require("../../methods/buildUserProfile");
const parseDate = require("../../methods/parseDate");
const parseNumbers = require("../../methods/parseNumbers");
const progressBar = require("../../methods/progressBar");
const roundedImage = require("../../methods/roundedImage");
const MemberSchema = require("../../models/MemberSchema");
const UserSchema = require("../../models/UserSchema");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
module.exports = {
    data: new SlashCommandBuilder()
        .setName("profil")
        .setDescription("Soft Bot | Kullanıcının Profilini görüntüle")
        .addUserOption(opt => opt
            .setName("kullanici")
            .setDescription("Profilini görüntüleyeceğiniz kişi.")
            .setRequired(false)    
        ),
    /**
     * 
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     */
    run: async(client, interaction) => {

        
        var member = interaction.options.getMember('kullanici') || interaction.member;
        var user = client.users.cache.get(member.id)
        const apiUser = await fetch(`https://discord.com/api/v10/users/${member.id}`, {
            headers: {
                Authorization: `Bot ${client.token}`
            }
        }).then(res => res.json());
        var userDB = await UserSchema.findOne({
            userId: member.id
        });
        if(!userDB) {
            userDB = await new UserSchema({
                userId: member.id
            }).save();
        }

        const canvas = createCanvas(900, 900);
        const ctx = canvas.getContext("2d");
        
        const picture = await loadImage("https://cdn.discordapp.com/avatars/" + apiUser.id + "/" + apiUser.avatar + ".png");
        ctx.save();
        ctx.shadowColor = "black";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        ctx.fillStyle = "#eeeee5";
        ctx.strokeStyle = "#eeeee5";
        ctx.beginPath();
        ctx.roundRect(0,0, 500, 200, 10);
        ctx.fill();
        ctx.beginPath()
        ctx.roundRect(0, 300, 500, 600, 10);
        ctx.fill();
        ctx.beginPath()
        ctx.roundRect(600, 0, 300, 900, 10);
        ctx.fill();
  
        roundedImage(ctx, 20, 20, 160, 160, 30)
        ctx.clip();
        ctx.drawImage(picture, 20, 20, 160, 160)
        ctx.restore();

        ctx.font = `semibold 33px poppins`;
        ctx.textAlign = "start";
        ctx.fillStyle = "black";
        ctx.fillText(apiUser.username.toUpperCase(), 200, 80);
        
        ctx.font = ` 27px poppins`;
        ctx.textAlign = "start";
        ctx.fillStyle = "black";
        ctx.fillText("#" + apiUser.discriminator.toUpperCase(), 200, 115);

        var badges = [await loadImage(process.cwd() + "/assets/badges/user.png")];
        if(userDB.isDeveloper) badges.push(await loadImage(process.cwd() + "/assets/badges/dev.png"));
        ctx.save()
        badges.map((badge, index) => {
            ctx.drawImage(badge, (200 + (36 * index)), 135, 32, 32);
        })
        ctx.restore();

        ctx.font = ` 40px poppins`;
        ctx.textAlign = "start";
        ctx.fillStyle = "black";
        ctx.fillText("Takma İsim", 20, 380);
        ctx.restore()

        ctx.beginPath()
        ctx.roundRect(20, 400, 450, 50,20);
        ctx.fill();
        ctx.restore();
        ctx.font = applyText(canvas, `${interaction.member.displayName}!`, 47, 500, false);
        ctx.textAlign = "start";
        ctx.fillStyle = "white";
        ctx.fillText(member.nickname ?? "Yok", 30, 440);
        
        ctx.font = `semibold 40px poppins`;
        ctx.textAlign = "start";
        ctx.fillStyle = "black";
        ctx.fillText("İsim Rengi", 20, 520);
        ctx.restore()

        ctx.beginPath()
        ctx.fillStyle = member.displayHexColor ?? "#000000"
        ctx.roundRect(20, 540, 450, 50,20);
        ctx.fill();
        ctx.restore();
        // ctx.font = applyText(canvas, `${member.displayHexColor}`, 47, 500, true);
        // ctx.textAlign = "start";
        // ctx.fillStyle = "white";
        // ctx.fillText(member.displayHexColor ?? "#000000", 30, 580);
        ctx.font = `semibold 40px poppins`;
        ctx.textAlign = "start";
        ctx.fillStyle = "black";
        ctx.fillText("En üst rol", 20, 650);
        
        ctx.beginPath()
        ctx.roundRect(20, 680, 450, 50,20);
        ctx.fill();
        ctx.restore();
        ctx.font = applyText(canvas, `@${member.roles.highest.name}`, 47, 500, false);
        ctx.textAlign = "start";
        ctx.fillStyle = "white";
        ctx.fillText(((member.roles.highest.name != "@everyone") ? "@" : "") + member.roles.highest.name, 30, 715);

        ctx.beginPath()
        ctx.roundRect(40, 760, 420, 2, 10);
        ctx.fillStyle = "black";
        ctx.fill();
        ctx.restore();
        ctx.save();

        const bankIcon = await loadImage(process.cwd() + "/assets/banka.png");
        ctx.drawImage(bankIcon, 670, 20, 160, 160)
        
        ctx.save();
        ctx.fillStyle = "black";
        ctx.roundRect(650, 220, 200, 43, 10);
        ctx.fill()
        ctx.roundRect(650, 350, 200, 43, 10);
        ctx.fill()

        ctx.fillStyle = "white";
        ctx.font = applyText(canvas, "SoftBank", 47, 200, true);
        ctx.textAlign = "center"
        ctx.fillText("SoftBank", 750, 255);
        
        ctx.fillStyle = "black";
        ctx.font = applyText(canvas, "Paran", 47, 200, true);
        ctx.textAlign = "start"
        ctx.fillText("Paran:", 650, 340);

        ctx.fillStyle = "white";
        ctx.font = applyText(canvas, parseNumbers(userDB.coins), 47, 200, true);
        ctx.textAlign = "start"
        ctx.fillText(parseNumbers(userDB.coins), 665, 385);


        const discordLogo = await loadImage(process.cwd() + "/assets/discordlogo.png");
        roundedImage(ctx, 60, 780, 60, 60, 10)
        ctx.clip();
        ctx.drawImage(discordLogo, 60, 780, 60, 60)
        ctx.restore();
        ctx.font = '25px poppins'
        ctx.textAlign = "start";
        ctx.fillStyle = "black";
        ctx.fillText(parseDate(new Date(member.user.createdTimestamp)), 23, 870);
        ctx.save();
        const guildLogo = await loadImage((interaction.guild.iconURL({ extension: "png" }) || "https://ui-avatars.com/api/?name=" + interaction.guild.name));
        roundedImage(ctx, 380, 780, 60, 60, 10)
        ctx.clip();
        ctx.drawImage(guildLogo, 380, 780, 60, 60)
        ctx.restore();
        ctx.font = '25px poppins'
        ctx.textAlign = "start";
        ctx.fillStyle = "black";
        ctx.fillText(parseDate(new Date(member.joinedTimestamp)), 326, 870);
        const attachment = new AttachmentBuilder(await canvas.encode('png'), {
            name: "profile.png"
        })
        interaction.editReply({
            files: [attachment]
        })
    }
}