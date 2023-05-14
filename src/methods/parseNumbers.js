module.exports = function(number) {
    let formatter = Intl.NumberFormat('tr', { notation: 'compact' })
    return formatter.format(number)
}