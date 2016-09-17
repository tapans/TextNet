var fs         = require('fs');
var https      = require('https');
var express    = require('express');
var bodyParser = require('body-parser');
var mssgClient = require('twilio');
var lib        = require('./lib/lib');

fs.readdirSync(__dirname + "/env").forEach(function (file) {
    if (!process.env[file]) {
        process.env[file] = fs.readFileSync(__dirname + "/env/" + file, "UTF-8").replace(/\n[\s\S]*/, '');
    }
});

var authToken = process.env.AUTH_TOKEN;
var port = process.env.PORT;
var endpointUrl = process.env.ENDPOINT_URL;
var allowed_numbers = process.env.ALLOWED_NUMS.split(",");
var maxResponseTexts = process.env.MAX_RESPONSE_TEXTS || 5;

var credentials = {key: process.env.ssl_key), cert: process.env.ssl_cert)};
var app = express(credentials);
var secureServer = https.createServer(credentials, app).listen(port);
app.use(bodyParser.urlencoded({ extended: true }));
console.log("Listening for incoming connections on port: " + port);

app.post('/respond_to_sms', function(req, res){	
	var options = {
		url: endpointUrl
	};
	if (mssgClient.validateExpressRequest(req, authToken, options) && allowed_numbers.indexOf(req.body.From) !== -1){
		var command = req.body.Body;	
		lib.parseAndProcessCommand(command, function(mssgs){			
			var twiml = new mssgClient.TwimlResponse();
			var numMssgs = mssgs.length;
			var i;
			if (numMssgs > maxResponseTexts){
				twiml.message("Response message too long!");
			} else {
				for (i=0; i<numMssgs;i++){
					twiml.message(mssgs[i]);
				}
			}
			console.log(twiml.toString());
			res.type('text/xml');
			res.send(twiml.toString());
		});			
	} else {
		console.log(req.body.Body);
		res.type('text/xml');
		res.send('you are not authorized. good bye!');
	}
});
