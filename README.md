# Directions-with-SMS
Get directions to locations using only SMS / text messages using Twilio and Google Maps API

## Installation 
<ol>
<li>npm install</li>
<li>Make and configure a Twilio Account. Be sure to get a number, and configure your SMS request url to point to your server endpoint</li>
<li>Get Google Maps API key</li>
<li>Create a directory called env and within that directory, create the following files:
  <ul>
    <li><b>AUTH_TOKEN</b>: Store your Twilio auth token in this file.</li>
    <li><b>GOOGLE_MAPS_API_KEY</b>: Store your google maps api key in this file.</li>
    <li><b>PORT</b>: Store the port number to run your app on in this file.</li>
    <li><b>ENDPOINT_URL</b>: Store the full web url of your server endpoint in this file.</li>
  </ul>
</li>
<li>node app.js &</li>
</ol>

## Usage
From your mobile device, send a text message to your twilio number in the following format:<br>
<b>Mode</b> <b>from</b> ADDRESS/POSTAL CODE <b>to</b> ADDRESS/POSTAL CODE

Where mode is one of:
<ol>
  <li>transit</li>
  <li>walking</li>
  <li>bicycling</li>
  <li>driving (default)</li> 
</ol>
### Examples
<ul>
</ul>
