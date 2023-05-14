module.exports = function calculateProgress(requiredXP, currentXP) {
    const cx = currentXP;
    const rx = requiredXP;

    if (rx <= 0) return 1;
    if (cx > rx) return 150;

    let width = (cx * 150) / rx;
    if (width > 150) width = 150;
    return width;
}