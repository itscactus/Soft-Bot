const { Schema, Model, model } = require("mongoose");

const member_schema = new Schema({
    guildId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    xp: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 1
    }
})

module.exports = model('Members', member_schema);