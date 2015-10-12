var fs    = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var mssgClient = require('twilio');
var lib = require('./lib.js');

fs.readdirSync(__dirname + "/env").forEach(function (file) {
    if (!process.env[file]) {
        process.env[file] = fs.readFileSync(__dirname + "/env/" + file, "UTF-8").replace(/\n[\s\S]*/, '');
    }
});

var authToken = process.env.AUTH_TOKEN;
var port = process.env.PORT;
var endpointUrl = process.env.ENDPOINT_URL;
var googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
var sourceKeyword = " from ";
var destinationKeyword = " to ";
var characterLimit = 1550;

var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(port);
console.log("Listening for incoming connections on port: " + port);

app.post('/respond_to_sms', function(req, res){	
	var options = {
		url: endpointUrl
	};
	if (mssgClient.validateExpressRequest(req, authToken, options)){
		var command = req.body.Body;		
		var mode = command.split(sourceKeyword)[0].trim();		
		var source = command.substring(command.indexOf(sourceKeyword) + sourceKeyword.length, command.indexOf(destinationKeyword)).trim();
		var destination = command.substring(command.indexOf(destinationKeyword) + destinationKeyword.length).trim();

		var twiml = new mssgClient.TwimlResponse();
		var steps = lib.getDirections(mode, source, destination, googleMapsApiKey, onDirectionsReturned);

		function onDirectionsReturned(mssg){
			var mssgs = lib.splitIntoMultipleMssgs(mssg, characterLimit);
			for (var i=0; i<mssgs.length;i++){
				twiml.message(mssgs[i]);	
			}			 
	
			res.type('text/xml');
			console.log("sending: " + twiml);
			res.send(twiml.toString());
		};
	} else {
		res.type('text/xml');
		res.send('you are not authorized. good bye!');
	}
});


