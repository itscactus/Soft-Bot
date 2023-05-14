require('dotenv').config();
const { Client, Partials, Collection }  = require('discord.js');
const loadEvents = require('./src/handler/event.js');

const client = new Client({
    intents: [
        'AutoModerationConfiguration',
        'AutoModerationExecution',
        'DirectMessageReactions',
        'DirectMessageTyping',
        'DirectMessages',
        'GuildBans',
        'GuildEmojisAndStickers',
        'GuildIntegrations',
        'GuildInvites',
        'GuildMembers',
        'GuildMessageReactions',
        'GuildMessageTyping',
        'GuildMessages',
        'GuildPresences',
        'GuildScheduledEvents',
        'GuildVoiceStates',
        'GuildWebhooks',
        'Guilds',
        'MessageContent'
    ],
    partials: [
        Partials.Channel,
        Partials.GuildMember,
        Partials.GuildScheduledEvent,
        Partials.Message,
        Partials.Reaction,
        Partials.ThreadMember,
        Partials.User
    ]
});


client.commands = new Collection();

loadEvents(client);

client.login(process.env.TOKEN);