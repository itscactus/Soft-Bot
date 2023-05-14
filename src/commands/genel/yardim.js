const { SlashCommandBuilder, Client, CommandInteraction, EmbedBuilder, Colors } = require("discord.js");
const { readdirSync } = require("fs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("yardım")
        .setDescription("Soft Bot | Yardım Menüsü"),
    /**
     * 
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     */
    run: async(client, interaction) => {

        var categories = readdirSync("./src/commands");
        categories.splice(categories.findIndex((v) => v == "sahip"), categories.findIndex((v) => v == "sahip"))
        var commands = [];
        categories.map((category) => {
            if(category.includes("sahip")) return;
            readdirSync("./src/commands/" + category).map((cmd) => {
                let commanddata = require("../" + category + "/" + cmd);
                commands.push({
                    category: category,
                    command: commanddata.data
                })
            })
        })
        
        const embed = new EmbedBuilder()
            .setAuthor({
                name: interaction.guild.name,
                iconURL: interaction.guild.iconURL({ extension: 'png' })
            })
            .setTitle("SoftBot | Yardım Menüsü")
            .setColor(Colors.LuminousVividPink)
            .setDescription(`
> Kategori Sayısı:  **${categories.length}**
> Komut Sayısı: **${commands.length}**

${categories.map((ctgry) => {
    let cmds = commands.filter((c) => c.category == ctgry);
    return `**${ctgry.charAt(0).toLocaleUpperCase() + ctgry.slice(1)}**
    ${cmds.length > 0 ? "`" + cmds.map((cmd) => cmd.command.name).join("`, `" , "") + "`" : "__Kategoriye ait hiç bir komut yok__"}
    `
}).join("\n")}

            `)
            .setFooter({
                text: "SoftBot | 2022 ©",
                iconURL: client.user.displayAvatarURL()
            });
        interaction.editReply({
            embeds: [embed]
        })
    }
}