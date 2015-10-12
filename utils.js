exports.capitalize = function(string){
	return string[0].toUpperCase() + string.slice(1);
}

exports.stripHtml = function(string){
	return string.replace(/<(?:.|\n)*?>/gm, '');
}

