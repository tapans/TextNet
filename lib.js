var request = require('request');
var utils = require('./utils.js');

exports.getDirections = function(mode, origin, destination, googleMapsApiKey, callback){
	var origin = origin || 'streetsville go station';
	var destination = destination || 'toronto union station';
	var mode = mode.toLowerCase() || 'transit';
	var params = "origin="+origin+"&destination="+destination+"&mode="+mode;	
	var url = "https://maps.googleapis.com/maps/api/directions/json?" + params + "&key=" + googleMapsApiKey;
	var request_url = encodeURI(url);	
	console.log(request_url);

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

exports.splitIntoMultipleMssgs = function(mssg, characterLimit){
	var mssgs = [];
	var temp = "";	
	var c = 0;
	var mssgLen = mssg.length;
	for (var i=0;i<mssgLen;i++){
		temp += mssg[i];		
		if (c === characterLimit - 1){
			mssgs.push(temp);
			temp = "";
			c = 0;
		}
		c++;
	}
	mssgs.push(temp);
	return mssgs;
}

function generateMssg(mode, data){
	var routeData = data.routes[0].legs[0];
	var totalDistance = routeData.distance.text;
	var totalDuration = routeData.duration.text;
	var startAddress = routeData.start_address;
	var endAddress = routeData.end_address;
	var steps = routeData.steps;
	var numSteps = steps.length;

	var mssg = createSummaryLine(startAddress, endAddress, totalDistance, totalDuration, mode);
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
							mssg += createStepLine(stepNum, walkingStep.html_instructions || step.html_instructions, walkingStep.distance.text, walkingStep.duration.text);
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
						var transitName = transitDetails.line.short_name;
						var numStops = transitDetails.num_stops;
						var distance = step.distance.text;
						var duration = step.duration.text;

						mssg += createTransitStepLine(stepNum, agency, departureStopName, departureTime, arrivalStopName, arrivalTime, numStops, summary, distance, duration, transitName);
						stepNum++;
						break;
					case "default":
						mssg += createStepLine(stepNum, step.html_instructions, step.distance.text, step.duration.text);	
						stepNum++;					
						break;						
				}
			}
			break;
		default:
			for (var m = 0; m < numSteps; m++){
				step = steps[m];
				mssg += createStepLine(stepNum, step.html_instructions, step.distance.text, step.duration.text);
				stepNum++;
			}
			break;
	}
	
	return mssg;
}

function createSummaryLine(startAddress, endAddress, distance, duration, mode){
	mode = mode.toLowerCase();
	if (mode === "walk"){
		mode = "walking"
	} else if (mode !== "transit" && mode !== "driving" && mode !== "bicycling" && mode !== "walking"){
		mode = "driving";	
	}	
	mode = utils.capitalize(mode);
	var line = mode + " directions from " + startAddress + " to " + endAddress + ". \n(" + distance + " in " + duration + ")" + "\n";
	return line;
}

function createStepLine(stepNum, stepMssg, stepDistance, stepDuration){
	stepMssg = utils.stripHtml(stepMssg);
	var line = stepNum + ". " + stepMssg + " (" + stepDistance + " in " + stepDuration + ")" + "\n";	
	return line;
}

function createTransitStepLine(stepNum, agency, departureStopName, departureTime, arrivalStopName, arrivalTime, numStops, summary, distance, duration, transitName){
	var line = stepNum + ". " + agency + " Transit " + transitName + ": " + summary + " (" + numStops + " stops). ";
	line += "Depart " + departureStopName + " at " + departureTime + " and arrive at " + arrivalStopName + " at " + arrivalTime + ". (" + distance + " in " + duration + ")" + "\n";
	return line;
}

