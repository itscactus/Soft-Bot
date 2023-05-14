module.exports = function(date) {
    const d = new Date(date);
    const months = ['Oca.', 'Şub.', 'Mar.', 'Nis.', 'May.', 'Haz.', 'Tem.', 'Ağu.', 'Eyl.', 'Eki.', 'Kas.']
    return d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear();
}