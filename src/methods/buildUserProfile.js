const { createCanvas } = require("@napi-rs/canvas");

module.exports = function buildUserBanner(color) {
    if(color == null) return null;
    const canvas = createCanvas(512, 204);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 512, 204);
    return canvas
}