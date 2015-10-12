var fs    = require('fs');
var request = require('request');
var express = require('express');
var bodyParser = require('body-parser');
var mssgClient = require('twilio');

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
		var steps = getDirections(mode, source, destination, onDirectionsReturned);

		function onDirectionsReturned(mssg){
			twiml.message(mssg);
	
			res.type('text/xml');
			console.log("sending: " + twiml);
			res.send(twiml.toString());
		};
	} else {
		res.type('text/xml');
		res.send('you are not authorized. good bye!');
	}
});

function getDirections(mode, origin, destination, callback){
	var origin = origin || 'streetsville go station';
	var destination = destination || 'toronto union station';
	var mode = mode || 'transit';
	var params = "origin="+origin+"&destination="+destination+"&mode="+mode;
	console.log(params);
	var url = "https://maps.googleapis.com/maps/api/directions/json?" + params + "&key=" + googleMapsApiKey;
	var request_url = encodeURI(url);	

	request(request_url, function(err, resp, body){
		if (err){
			return console.error(err);	
		} else {
			body = JSON.parse(body);
			if (body.status.toLowerCase() !== "ok") return callback(body.status + ": " + params);			

			var mssg = generateMssg(mode, body);
			return callback(mssg);
		} 
	});
}

function generateMssg(mode, data){
	var routeData = data.routes[0].legs[0];
	var totalDistance = routeData.distance.text;
	var totalDuration = routeData.duration.text;
	var startAddress = routeData.start_address;
	var endAddress = routeData.end_address;
	var steps = routeData.steps;
	var numSteps = steps.length;

	var mssg = printSummary(startAddress, endAddress, totalDistance, totalDuration, mode);
	var stepNum = 1;

	switch(mode){		
		case "transit":
			var arrivalTime = routeData.arrival_time.text;
			var departureTime = routeData.departure_time.text;			
			mssg += "" + departureTime + " - " + arrivalTime + "\n";
			for (var j = 0; j < numSteps; j++){
				var step = steps[j];		
				switch(step.travel_mode.toLowerCase()){
					case "walking":
						var walkingSteps = step.steps;
						var numWalkingSteps = walkingSteps.length;
						for (var k = 0; k < numWalkingSteps; k++){
							var walkingStep = walkingSteps[k];
							mssg += printStep(stepNum, walkingStep.html_instructions, walkingStep.distance.text, walkingStep.duration.text);
							stepNum++;
						}
						break;
					case "transit":						
						var summary = step.html_instructions;
						var transitDetails = step.transit_details;
						var arrivalStopName = transitDetails.arrival_stop.name;
						var arrivalTime = transitDetails.arrival_time.text;
						var departureStopName = transitDetails.departure_stop.name;
						var departureTime = transitDetails.departure_time.text;
						var agency = transitDetails.line.agencies[0].name;
						var numStops = transitDetails.num_stops;
						var distance = step.distance.text;
						var duration = step.duration.text;

						mssg += printTransitStep(stepNum, agency, departureStopName, departureTime, arrivalStopName, arrivalTime, numStops, summary, distance, duration);
						stepNum++;
						break;
					case "default":
						mssg += printStep(stepNum, step.html_instructions, step.distance.text, step.duration.text);	
						stepNum++;					
						break;						
				}
			}
			break;
		default:
			for (var m = 0; m < numSteps; m++){
				step = steps[m];
				mssg += printStep(stepNum, step.html_instructions, step.distance.text, step.duration.text);
				stepNum++;
			}
			break;
	}
	console.log(mssg);
	return mssg;
}

function capitalize(string){
	return string[0].toUpperCase() + string.slice(1);
}

function stripHtml(string){
	return string.replace(/<(?:.|\n)*?>/gm, '');
}

function printSummary(startAddress, endAddress, distance, duration, mode){
	mode = mode.toLowerCase();
	if (mode !== "transit" && mode !== "driving" && mode !== "bicycling" && mode !== "walking"){
		mode = "driving";	
	}
	mode = capitalize(mode);
	var line = mode + " directions from " + startAddress + " to " + endAddress + ". \n(" + distance + " in " + duration + ")" + "\n";
	return line;
}

function printStep(stepNum, stepMssg, stepDistance, stepDuration){
	stepMssg = stripHtml(stepMssg);
	var line = stepNum + ". " + stepMssg + " (" + stepDistance + " in " + stepDuration + ")" + "\n";	
	return line;
}

function printTransitStep(stepNum, agency, departureStopName, departureTime, arrivalStopName, arrivalTime, numStops, summary, distance, duration){
	var line = stepNum + ". " + agency + ": " + summary + " (" + numStops + " stops). ";
	line += "Depart " + departureStopName + " at " + departureTime + " and arrive at " + arrivalStopName + " at " + arrivalTime + ". (" + distance + " in " + duration + ")" + "\n";
	return line;
}