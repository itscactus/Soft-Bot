const { Schema, Model, model } = require("mongoose");

const coin_history_schema = new Schema({
    from: {
        type: String,
        required: true,
        default: "Sistem"
    },
    to: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    }
});

module.exports = model('CoinHistories', coin_history_schema);