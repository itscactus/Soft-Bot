const { Client, Message } = require("discord.js");
const { readFileSync } = require("fs");
const GuildHistorySchema = require("../models/GuildHistorySchema");
const GuildSchema = require("../models/GuildSchema");
const MemberSchema = require("../models/MemberSchema");

module.exports = {
    name: "messageCreate",
    once: false,
    /**
     * 
     * @param {Client} client
     * @param {Message} message
     */
    run: async(client, message) => {
        if(!message.guild) return;
        let database = await GuildSchema.findOne({
            guildId: message.guild.id
        });
        if(database.reklamKoruma.enabled == true) {
            let reklam = await Promise.all(require(`${process.cwd()}/assets/liste/reklam/reklam.json`)['tlds'].map((tld) => tld.replace('\.', '').replaceAll('.', '\\.')));
            if(!message.member.permissions.has("ManageMessages")) {
                // \.(com|com\.tr)$
                const pattern = new RegExp(`\\.(${reklam.join("|")})$`);
                if(pattern.test(message.content)) {
                    await message.delete().catch(async (err) => {
                        console.log('[Reklam Koruması] ' + message.guild.name + ' sunucusunda reklamı silemedim :(');
                        await new GuildHistorySchema({
                            date: new Date(),
                            guildId: message.guild.id,
                            message: "Sunucuda Mesaj Silemiyorum :(",
                            type: "error"
                        }).save();
                    });
                    message.channel.send({
                        content: `${message.member}! Reklam yapma dostum bu hiç güzel değil.`
                    }).then((msg) => {
                        setTimeout(async() => {
                            await msg.delete().catch(async (err) => {
                                console.log('[Küfür Koruması] ' + message.guild.name + ' sunucusunda mesajımı silemedim :(');
                                await new GuildHistorySchema({
                                    date: new Date(),
                                    guildId: message.guild.id,
                                    message: "Sunucuda Mesaj Silemiyorum :(",
                                    type: "error"
                                }).save();
                            });
                        }, 3000)
                    })
                }
            }
        }
        if(database.kufurKoruma.enabled == true) {
            let trKufur = readFileSync(`./assets/liste/küfür/tr.txt`, {encoding:'utf8', flag:'r'}).split("\r\n");
            let enKufur = readFileSync(`./assets/liste/küfür/en.txt`, {encoding:'utf8', flag:'r'}).split("\r\n");

            if(!message.member.permissions.has("ManageMessages")) {
                if(message.content.split(" ").some(item => trKufur.includes(item.toLowerCase())) || message.content.split("").some(item => enKufur.includes(item.toLowerCase()))) {
                    await message.delete().catch(async (err) => {
                        console.log('[Küfür Koruması] ' + message.guild.name + ' sunucusunda küfürü silemedim :(');
                        await new GuildHistorySchema({
                            date: new Date(),
                            guildId: message.guild.id,
                            message: "Sunucuda Mesaj Silemiyorum :(",
                            type: "error"
                        }).save();
                    });
                    message.channel.send({
                        content: `${message.member}! Küfür etmemelisin dostum bu hiç güzel değil.`
                    }).then((msg) => {
                        setTimeout(async() => {
                            await msg.delete().catch(async (err) => {
                                console.log('[Küfür Koruması] ' + message.guild.name + ' sunucusunda mesajımı silemedim :(');
                                await new GuildHistorySchema({
                                    date: new Date(),
                                    guildId: message.guild.id,
                                    message: "Sunucuda Mesaj Silemiyorum :(",
                                    type: "error"
                                }).save();
                            });
                        }, 3000)
                    })
                }
            }
        }
        /**
         * Levelling
         */
        if(database.levellingSystem.enabled == true) {
            if(message.author.bot) return;
            let xp_per_message = database.levellingSystem.XpPerMessage;
            let log_channel = message.guild.channels.cache.get(database.levellingSystem.channelId) || null;
            let memberDB = await MemberSchema.findOne({
                guildId: message.guild.id,
                userId: message.member.id
            });
            if(!memberDB) {
                memberDB = await new MemberSchema({
                    guildId: message.guild.id,
                    userId: message.member.id
                }).save();
            }

            memberDB.xp = memberDB.xp + xp_per_message;
            if(memberDB.xp >= (300 * memberDB.level)) {
                memberDB.level = memberDB.level + 1;
                memberDB.xp = 0;
                let mesaj_str = database.levellingSystem.LevelUpMessage
                    .replaceAll('{{member}}', `${message.member}`)
                    .replaceAll('{{level}}', `${memberDB.level}`)
                    .replaceAll('{{old_level}}', `${memberDB.level - 1}`)
                    .replaceAll('{{next_level}}', `${memberDB.level + 1}`);
                if(log_channel != null) log_channel?.send({
                    content: mesaj_str
                }).catch(err => {});
                else message.channel.send({
                    content: mesaj_str
                }).catch(err => {});
            }

            await memberDB.save();
        }
    }
}