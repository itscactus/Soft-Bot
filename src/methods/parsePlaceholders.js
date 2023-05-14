const { Guild, User } = require("discord.js");

module.exports = {
    /**
     * 
     * @param {Guild} guild 
     * @param {User} owner
     * @param {User} user 
     * @param {JSON} embedJson 
     */
    ticketChannelParse: function(guild, owner, embedJson, gorevliRole, reason) {
        gorevliRole = guild.roles.cache.get(gorevliRole) || null;
        reason = reason == null ? "Yok" : reason
        return JSON.parse(
            JSON.stringify(embedJson)
                .replaceAll("{{gorevliRole}}", (gorevliRole != null ? gorevliRole : '@AyarlanmamışRol'))
                .replaceAll("{{gorevliRol}}", (gorevliRole != null ?  `${gorevliRole}` : '@AyarlanmamışRol'))
                .replaceAll("{{gorevliRole_name}}", (gorevliRole != null ?  `${gorevliRole.name}` : 'AyarlanmamışRol'))
                .replaceAll("{{gorevliRol_name}}", (gorevliRole != null ?  `${gorevliRole.name}` : 'AyarlanmamışRol'))
                .replaceAll("{{gorevliRol_id}}", (gorevliRole != null ?  `${gorevliRole.id}` : '0000000000'))
                .replaceAll("{{gorevliRole_id}}", (gorevliRole != null ?  `${gorevliRole.id}` : '0000000000'))
                .replaceAll("{{reason}}", reason)
                .replaceAll("{{sebep}}", reason)
                .replaceAll("{{user}}", `${owner}`)
                .replaceAll("{{user_tag}}", `${owner.tag}`)
                .replaceAll("{{user_discriminator}}", `${owner.discriminator}`)
                .replaceAll("{{user_id}}", `${owner.id}`)
                .replaceAll("{{user_avatar}}", `${owner.displayAvatarURL()}`)
                .replaceAll("{{user_username}}", `${owner.username}`)
                .replaceAll("{{guild_name}}", guild.name)
                .replaceAll("{{guild_id}}", guild.id)
                .replaceAll("{{guild_icon}}", (guild.iconURL() || `https://ui-avatars.com/api/?name=${guild.name}`))
        );
    }, 
    /**
     * 
     * @param {Guild} guild 
     * @param {User} user 
     * @param {JSON} embedJson 
     */
    ticketParse: function(guild, embedJson) {
        return JSON.parse(
            JSON.stringify(embedJson)
                .replaceAll("{{guild_name}}", guild.name)
                .replaceAll("{{guild_id}}", guild.id)
                .replaceAll("{{guild_icon}}", (guild.iconURL() || `https://ui-avatars.com/api/?name=${guild.name}`))
        );
    },
    /**
     * 
     * @param {Guild} guild 
     * @param {User} user 
     * @param {JSON} embedJson 
     */
    autoRoleParse: function(guild, user, embedJson, database) {
        let role = guild.roles.cache.get(database.autoRole.roleId) || null;
        return JSON.parse(
            JSON.stringify(embedJson)
                .replaceAll("{{user}}", `${user}`)
                .replaceAll("{{user_tag}}", user.tag)
                .replaceAll("{{user_avatar}}", user.displayAvatarURL())
                .replaceAll("{{user_id}}", user.id)
                .replaceAll("{{role_id}}", (role != null ? role.id : '00000'))
                .replaceAll("{{role}}", (role != null ?  `${role}` : '@AyarlanmamışRol'))
                .replaceAll("{{role_name}}", (role != null ?  `${role.name}` : 'AyarlanmamışRol'))
                .replaceAll("{{autorole}}", (role != null ? `${role}` : '@AyarlanmamışRol'))
                .replaceAll("{{guild_name}}", guild.name)
                .replaceAll("{{guild_id}}", guild.id)
                .replaceAll("{{user_name}}", user.username)
                .replaceAll("{{guild_icon}}", (guild.iconURL() || user.displayAvatarURL()))
        );
    }
}