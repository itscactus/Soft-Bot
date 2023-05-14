const { Schema, Model, model } = require("mongoose");

const user_schema = new Schema({
    userId: {
        type: String,
        required: true
    },
    coins: {
        type: Number,
        default: 0
    },
    lastDailyTaken: {
        type: Date,
        required: false
    },
    isDeveloper: {
        type: Boolean,
        default: false
    }
})

module.exports = model('Users', user_schema);