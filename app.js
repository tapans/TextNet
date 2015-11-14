var fs         = require('fs');
var express    = require('express');
var bodyParser = require('body-parser');
var mssgClient = require('twilio');
var lib        = require('./lib.js');

fs.readdirSync(__dirname + "/env").forEach(function (file) {
    if (!process.env[file]) {
        process.env[file] = fs.readFileSync(__dirname + "/env/" + file, "UTF-8").replace(/\n[\s\S]*/, '');
    }
});

var authToken = process.env.AUTH_TOKEN;
var port = process.env.PORT;
var endpointUrl = process.env.ENDPOINT_URL;


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
		lib.parseAndProcessCommand(command, function(mssgs){			
			var twiml = new mssgClient.TwimlResponse();
			var numMssgs = mssgs.length;
			var i;
			for (i=0; i<numMssgs;i++){
				twiml.message(mssgs[i]);	
			}
			console.log(twiml.toString());
			res.type('text/xml');
			res.send(twiml.toString());
		});			
	} else {
		res.type('text/xml');
		res.send('you are not authorized. good bye!');
	}
});