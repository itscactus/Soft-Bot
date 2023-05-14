module.exports = function (canvas, text, fontSize, width, bold = false) {
    const context = canvas.getContext("2d");
	do {
		context.font = `${bold ? 'bold' : ''} ${fontSize -= 10}px poppins`;
	} while (context.measureText(text).width > canvas.width - width);
	return context.font;
};