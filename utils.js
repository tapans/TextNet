var request = require('request');
var htmlToText = require('html-to-text');

exports.capitalize = function(string){
	return string[0].toUpperCase() + string.slice(1);
}

exports.stripHtml = function(string){
	return string.replace(/<(?:.|\n)*?>/gm, '');
}

exports.parseDate = function(string){
	var date = Date.parse(string);
	if (date){
		return date/1000;
	} else {
		var today = new Date();
		var year = today.getFullYear();
		var month = today.getMonth() + 1;
		var day = today.getDate();

		var todayRegex = new RegExp(/([\d:]+)\s*(?:(am|pm)?)\stoday/i);
		var tomorrowRegex = new RegExp(/([\d:]+)\s*(?:(am|pm)?)\stomorrow/i);
		var stringMatchesToday = string.match(todayRegex);
		var stringMatchesTomorrow = string.match(tomorrowRegex);
		if (stringMatchesToday){
			var time = fixTime(stringMatchesToday[1]);
			var period = stringMatchesToday[2];			
			return getDate(month, day, year, time, period);
		} else if(stringMatchesTomorrow){
			var time = fixTime(stringMatchesTomorrow[1]);
			var period = stringMatchesTomorrow[2];
			day = day+1;
			return getDate(month, day, year, time, period);
		}
	}
}

exports.httpGet = function(url, callback){
	url = addProtocol(url);
	console.log(url);
	request(url, function (error, response, body) {		
	    if (!error && response.statusCode == 200) {
	    	var content = htmlToText.fromString(body, {
							    wordwrap: 130
							});
	    	console.log(content);
	        return callback(null, response, content);
	    } else {
	    	console.log(error);
	    	return callback(error);
	    }
	});
}

function addProtocol(url){
	if (!(url.indexOf("http") === 0) && !(url.indexOf('https') === 0)){
		return "http://"+url;
	} else {
		return url;
	}

}

function fixTime(time){
	if (time.indexOf(":") === -1){
		return time+":"+"00";
	} else {
		return time;
	}
}

function getDate(month, day, year, time, period){
	var date = new Date(month+"/"+day+"/"+year+" "+time+" "+period);
	date = Date.parse(date);
	if (date){
		return date/1000;
	}
}
