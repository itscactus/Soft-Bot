const { Schema, Model, model } = require("mongoose");

const guild_history_schema = new Schema({
    guildId: {
        type: String,
        required: true    
    },
    type: {
        type: String,
        required: true
    },
    message: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    }
});

module.exports = model('GuildHistories', guild_history_schema);