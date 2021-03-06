var request = require('request');
var utils = require('./utils');
var google = require('googleapis');

var sourceKeyword = " from ";
var destinationKeyword = " to ";
var destinationSeparator = "with";
var alternativesKeyword = "alternatives";
var departingTimeKeyword = "departure time of";
var arrivalTimeKeyword = "arrival time of";
var lessWalkingPreference = "less walking";
var fewTransfersPreference = "less transfers";

var browseWebpageKeyword = "go to ";

var defaultNumResults = 1;
var characterLimit = 1550;

exports.parseAndProcessCommand = function(command, sendResponse){
	var apiKey = process.env.GOOGLE_MAPS_API_KEY;
	var command = command.toLowerCase();
	console.log(command);
	if (directionsCommand(command)){
		return invokeGoogleMapsAPI(command, apiKey, sendResponse);
	} else if (webpageCommand(command)){
		return browseWebpage(command, sendResponse);
	} else {
		return invokeCustomSearchAPI(command, apiKey, sendResponse);
	}
}

function webpageCommand(command){
	if (command.indexOf("http://") === 0
		|| command.indexOf("https://") === 0
		|| command.indexOf(browseWebpageKeyword) === 0){
		return true;
	}
}

function directionsCommand(command){
	if (command.indexOf("transit") === 0
		|| command.indexOf("walking") === 0
		|| command.indexOf("walk") === 0
		|| command.indexOf("bicycling") === 0
		|| command.indexOf("bike") === 0
		|| command.indexOf("driving") === 0
		|| command.indexOf("drive") === 0){
		return true;
	}
	return false;
}

function browseWebpage(command, sendResponse){
	var url;
	if (command.indexOf(browseWebpageKeyword) === 0){
		url = command.split(browseWebpageKeyword)[1];
		console.log(url);
		utils.httpGet(url, function(err, resp, content){
			if (err){
				return sendResponse(err);
			} else {
				var mssgs = splitIntoMultipleMssgs(content);
				return sendResponse(mssgs);
			}			
		})
	}
}

function invokeCustomSearchAPI(command, apiKey, sendResponse){
	//format: query [limit n]
	var commandRegex = new RegExp("([\\w\\s]+)");
	var commandRegexWithLimit = new RegExp("([\\w\\s]+)\\s*limit\\s*(\\d+)");
	if (command.indexOf("limit") !== -1){
		var commandMatch = command.match(commandRegexWithLimit);
		var numResults = commandMatch ? commandMatch[2] : defaultNumResults;
	} else {
		var commandMatch = command.match(commandRegex);
	}
	var numResults = numResults || defaultNumResults;
	var query = commandMatch ? commandMatch[1] : "mississauga weather";
	
	var customsearch = google.customsearch('v1');
	var CX = process.env.CX;
	console.log(CX, apiKey, query, numResults);

	customsearch.cse.list({ cx: CX, q: query, auth: apiKey, num: numResults}, function(err, resp) {
	  if (err) {
	    console.log('An error occured', err);
	    return;
	  }
	  // Got the response from custom search
	  console.log('Result: ' + resp.searchInformation.formattedTotalResults);
	  console.log(resp.items[0]);
	  var items = resp.items;
	  var numItems = items.length;
	  if (items && numItems > 0) {
	  	var mssgs = [];
	  	var mssg, title, content, link;
	  	for (var i=0;i<numItems;i++){
	  		title = items[i].title;
	  		content = items[i].snippet;
	  		link = items[i].link;
	  		mssg = title + "\n\n" + content + "\n\n" + link;
	  		mssgs.push(mssg);
	  	}
	    sendResponse(mssgs);
	  }
	});
}

function invokeGoogleMapsAPI(command, googleMapsApiKey, sendResponse){
	var commandParts = command.split(destinationSeparator);
	var mainCommand = commandParts[0];	
	var mode = mainCommand.split(sourceKeyword)[0].trim().toLowerCase();				
	var source = mainCommand.substring(mainCommand.indexOf(sourceKeyword) + sourceKeyword.length, mainCommand.indexOf(destinationKeyword)).trim();
	var destination = mainCommand.substring(mainCommand.indexOf(destinationKeyword) + destinationKeyword.length).trim();	

	var options = commandParts[1];
	if (options){
		var alternatives = options.indexOf("alternatives") !== -1 ? true : false;			
		var routePreference = options.indexOf(lessWalkingPreference) !== -1 ? "less_walking" : undefined;
		routePreference = options.indexOf(fewTransfersPreference) !== -1 ? "fewer_transfers" : undefined;
		var arrivalTime = options.indexOf(arrivalTimeKeyword) !== -1 ? utils.parseDate(options.split(arrivalTimeKeyword)[1]) : undefined;
		var departureTime = options.indexOf(departingTimeKeyword) !== -1 ? utils.parseDate(options.split(departingTimeKeyword)[1]) : undefined;	
	}
	
	var steps = getDirections(mode, source, destination, alternatives, arrivalTime, departureTime, routePreference, googleMapsApiKey, onDirectionsReturned);	
	function onDirectionsReturned(mssg){
		var mssgs = splitIntoMultipleMssgs(mssg);		 
		sendResponse(mssgs);		
	};
}

function getDirections(mode, origin, destination, alternatives, arrivalTime, departureTime, routePreference, googleMapsApiKey, callback){
	var origin = origin || 'streetsville go station';
	var destination = destination || 'toronto union station';
	if (mode === "walk") mode = "walking";
	else if (mode === "bike") mode = "bicycling";
	else mode = mode || "transit";
      	
	var alternatives = alternatives || false;
	var params = "origin="+origin+"&destination="+destination+"&mode="+mode+"&alternatives="+alternatives;	
	if (routePreference) params+="&transit_routing_preference="+routePreference;
	if (arrivalTime) params+="&arrival_time="+arrivalTime;
	else if(departureTime) params+="&departure_time="+departureTime;
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

function generateMssg(mode, data){
	var routes = data.routes;
	var numRoutes = routes.length;
	var mssg = "";
	for (var l=0;l<numRoutes;l++){
		if (l>0) mssg += "\n-------------Alternative Route-------------\n";
		var routeData = routes[l].legs[0];
		var totalDistance = routeData.distance.text;
		var totalDuration = routeData.duration.text;
		var startAddress = routeData.start_address;
		var endAddress = routeData.end_address;
		var steps = routeData.steps;
		var numSteps = steps.length;

		mssg += createSummaryLine(startAddress, endAddress, totalDistance, totalDuration, mode);
		var stepNum = 1;

		switch(mode){		
			case "transit":
				var arrivalTime = routeData.arrival_time.text;
				var departureTime = routeData.departure_time.text;			
				mssg += "" + departureTime + " - " + arrivalTime + "\n\n";
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
	}	
	
	return mssg;
}

function createSummaryLine(startAddress, endAddress, distance, duration, mode){
	mode = mode.toLowerCase();

	if (mode !== "transit" && mode !== "driving" && mode !== "bicycling" && mode !== "walking"){
		mode = "driving";	
	}	
	mode = utils.capitalize(mode);
	var line = "\n" + mode + " directions from " + startAddress + " to " + endAddress + ". \n(" + distance + " in " + duration + ")" + "\n";
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

function splitIntoMultipleMssgs(mssg){
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
