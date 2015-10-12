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

Suppose you send the following text to the twilio number:<br>
<b>transit</b> <b>from</b> square one go station <b>to</b> toronto union station

The response would be the following text:
<pre>
 Transit directions from Square One GO Bus Terminal At Station, Mississauga, ON L5B, Canada to Union Station, 65 Front St W, Toronto, ON M5J 1E6, Canada. 
(34.8 km in 1 hour 49 mins)
3:57am - 5:45am
1. Head southeast on Station Gate Rd toward Rathburn Rd W (47 m in 1 min)
2. Turn right onto Rathburn Rd W (0.2 km in 3 mins)
3. Turn right onto Duke of York Blvd (0.2 km in 3 mins)
4. Turn right onto Centre View DrDestination will be on the left (0.2 km in 2 mins)
5. GO Transit: Bus towards 40 - Richmond Hill Centre (1 stops). Depart Square One at 4:05am and arrive at Renforth and Convair at 4:15am. (9.7 km in 10 mins)
6. Walk to Renforth Dr at Convair Dr (53 m in 1 min)
7. TTC: Bus towards East - 332 Eglinton West Blue Night Towards Eglinton Station (50 stops). Depart Renforth Dr at Convair Dr at 4:35am and arrive at Eglinton Ave West at Yonge St at 5:09am. (16.9 km in 34 mins)
8. Walk to Yonge St at Eglinton Ave West (Eglinton Station) (0.1 km in 2 mins)
9. TTC: Bus towards South - 320 Yonge Blue Night Towards Queens Quay (31 stops). Depart Yonge St at Eglinton Ave West (Eglinton Station) at 5:22am and arrive at Bay St at Front St West (Union Station) at 5:42am. (7.2 km in 21 mins)
10. Head south on Bay St toward Front St W (23 m in 1 min)
11. Turn right onto Front St WDestination will be on the left (0.1 km in 2 mins)
</pre>
