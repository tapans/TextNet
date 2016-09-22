#TextNet

## Installation 
<ol>
<li>npm install</li>
<li>Make and configure a Twilio Account. Be sure to get a number, and configure your SMS request url to point to your server endpoint</li>
<li>Get Google Maps API key</li>
<li>Create the following files in the env directory:
  <ul>
    <li><b>AUTH_TOKEN</b>: Store your Twilio auth token in this file.</li>
    <li><b>GOOGLE_MAPS_API_KEY</b>: Store your google maps api key in this file.</li>
    <li><b>PORT</b>: Store the port number to run your app on in this file.</li>
    <li><b>ENDPOINT_URL</b>: Store the full web url of your server endpoint in this file.</li>
    <li><b>ALLOWED_NUMS</b>: Comma delimited full phone number strings that should be allowed to use this service
    <li><b>CX</b>: Store the cx ID for Google Custom Search API. <a href='http://stackoverflow.com/questions/6562125/getting-a-cx-id-for-custom-search-google-api-python' title='_blank'>See this</a>
  </ul>
</li>
<li>node app.js &</li>
</ol>

## Directions-with-SMS
Get directions to locations using only SMS / text messages using Twilio and Google Maps API

### Usage
From your mobile device, send a text message to your configured twilio number in the following format:<br>
<b>Mode</b> <b>from</b> ADDRESS/POSTAL CODE <b>to</b> ADDRESS/POSTAL CODE <b>with</b> [OPTIONS]

Where mode is one of:
<ol>
  <li>transit</li>
  <li>walking</li>
  <li>bicycling</li>
  <li>driving (default)</li> 
</ol>

Additional options can be followed by the keyword "<b>with</b>" after the destination address.
Supported options are:
<ol>
  <li>alternatives</li>
  <li>less walking</li>
  <li>less transfers</li>
  <li>arrival time of <b>dateString</b></li>
  <li>departure time of <b>dateString</b></li>
</ol>

#### Examples
<ul>
    <li>
<b>transit from square one go station to toronto union station</b>

The response would be the following text:
<pre>
 Transit directions from Square One GO Bus Terminal At Station, Mississauga, ON L5B, Canada to Union Station, 65 Front St W, Toronto, ON M5J 1E6, Canada. 
(30.0 km in 53 mins)
7:30pm - 8:23pm

1. GO Transit Transit 21: Bus towards 21P - Union Station (6 stops). Depart Square One at 7:30pm and arrive at Union Station Bus Terminal at 8:20pm. (29.8 km in 50 mins)
2. Head west toward Bay St (38 m in 1 min)
3. Turn right onto Bay St (50 m in 1 min)
4. Turn left onto Front St WDestination will be on the left (0.2 km in 2 mins)
</pre>
  </li>
<li>
<b>Transit from square one go station to toronto union station with arrival time of 9pm today</b>
<pre>
Transit directions from Square One GO Bus Terminal At Station, Mississauga, ON L5B, Canada to Union Station, 65 Front St W, Toronto, ON M5J 1E6, Canada. 
(37.0 km in 59 mins)
7:57pm - 8:55pm

1. Head southeast on Station Gate Rd toward Rathburn Rd W (47 m in 1 min)
2. Turn right onto Rathburn Rd W (0.2 km in 3 mins)
3. Turn right onto Duke of York Blvd (0.2 km in 3 mins)
4. Turn right onto Centre View DrDestination will be on the left (0.2 km in 2 mins)
5. GO Transit Transit 40: Bus towards 40 - Richmond Hill Centre (2 stops). Depart Square One at 8:05pm and arrive at Pearson Airport at 8:20pm. (11.6 km in 15 mins)
6. Walk to UP Express Pearson Airport (70 m in 1 min)
7. Walk to UP Express Pearson Airport (1 m in 1 min)
8. Walk to UP Express Pearson Airport (51 m in 1 min)
9. UP Express Transit UP: Train towards UP Express Union Station (3 stops). Depart UP Express Pearson Airport at 8:27pm and arrive at UP Express Union Station at 8:52pm. (24.3 km in 25 mins)
10. Walk to Union Station, 65 Front St W, Toronto, ON M5J 1E6, Canada (0.2 km in 3 mins)
11. Head east on Front St W toward Bay StDestination will be on the right (0.1 km in 1 min)
</pre>
</li>
<li>
<b>Transit from square one go station to toronto union station with alternatives</b>
(3 texts returned)
<pre>
Transit directions from Square One GO Bus Terminal At Station, Mississauga, ON L5B, Canada to Union Station, 65 Front St W, Toronto, ON M5J 1E6, Canada. 
(30.0 km in 53 mins)
7:30pm - 8:23pm

1. GO Transit Transit 21: Bus towards 21P - Union Station (6 stops). Depart Square One at 7:30pm and arrive at Union Station Bus Terminal at 8:20pm. (29.8 km in 50 mins)
2. Head west toward Bay St (38 m in 1 min)
3. Turn right onto Bay St (50 m in 1 min)
4. Turn left onto Front St WDestination will be on the left (0.2 km in 2 mins)

-------------Alternative Route-------------

Transit directions from Square One GO Bus Terminal At Station, Mississauga, ON L5B, Canada to Union Station, 65 Front St W, Toronto, ON M5J 1E6, Canada. 
(29.9 km in 1 hour 7 mins)
7:37pm - 8:44pm

1. Head southeast on Station Gate Rd toward Rathburn Rd W (47 m in 1 min)
2. Turn left onto Rathburn Rd W (90 m in 1 min)
3. Turn rightDestination will be on the right (0.1 km in 2 mins)
4. MiWay Transit 19: Bus towards Southbound (29 stops). Depart City Centre Bus Terminal Platform D at 7:40pm and arrive at Port Credit Go Station Platform 6 at 8:02pm. (8.4 km in 22 mins)
5. Walk to Port Credit GO (0.1 km in 2 mins)
6. Walk to Port Credit GO (73 m in 1 min)
7. GO Transit Transit LW: Train towards LW-Union Station (4 stops). Depart Port Credit GO at 8:11pm and arrive at Union Station at 8:40pm. (20.7 km in 29 mins)
8. Walk to Union Station, 65 Front St W, Toronto, ON M5J 1E6, Canada (31 m in 1 min)
9. Head east on The PATH - Union-VIA-GO toward The PATH - Union Station
10. Turn left onto Bay St (36 m in 1 min)
11. Turn left onto Front St WDestination will be on the left (0.1 km in 2 mins)

-------------Alternative Route-------------

Transit directions from Square One GO Bus Terminal At Station, Mississauga, ON L5B, Canada to Union Station, 65 Front St W, Toronto, ON M5J 1E6, Canada. 
(27.8 km in 1 hour 13 mins)
7:31pm - 8:44pm

1. Head southeast on Station Gate Rd toward Rathburn Rd W (47 m in 1 min)
2. Turn right onto Rathburn Rd WDestination will be on the left (32 m in 1 min)
3. MiWay Transit 20: Bus towards Eastbound (47 stops). Depart City Centre Bus Terminal Platform L at 7:33pm and arrive at Islington Subway Drop Off at 8:04pm. (13.4 km in 31 mins)
4. Walk to Islington Station - Eastbound Platform (38 m in 1 min)
5. TTC Transit 2: Subway towards Line 2 (Bloor-Danforth) (13 stops). Depart Islington Station - Eastbound Platform at 8:10pm and arrive at Spadina Station - Eastbound Platform at 8:29pm. (10.2 km in 19 mins)
6. Walk to Spadina Station - Southbound Platform (19 m in 1 min)
7. TTC Transit 1: Subway towards Line 1 (Yonge-University) (7 stops). Depart Spadina Station - Southbound Platform at 8:33pm and arrive at UNION STATION - NORTHBOUND PLATFORM towards FINCH at 8:42pm. (3.9 km in 9 mins)
8. Head north on Bay St toward Front St W (36 m in 1 min)
9. Turn left onto Front St WDestination will be on the left (0.1 km in 2 mins)

-------------Alternative Route-------------

Transit directions from Square One GO Bus Terminal At Station, Mississauga, ON L5B, Canada to Union Station, 65 Front St W, Toronto, ON M5J 1E6, Canada. 
(37.0 km in 59 mins)
7:57pm - 8:55pm

1. Head southeast on Station Gate Rd toward Rathburn Rd W (47 m in 1 min)
2. Turn right onto Rathburn Rd W (0.2 km in 3 mins)
3. Turn right onto Duke of York Blvd (0.2 km in 3 mins)
4. Turn right onto Centre View DrDestination will be on the left (0.2 km in 2 mins)
5. GO Transit Transit 40: Bus towards 40 - Richmond Hill Centre (2 stops). Depart Square One at 8:05pm and arrive at Pearson Airport at 8:20pm. (11.6 km in 15 mins)
6. Walk to UP Express Pearson Airport (70 m in 1 min)
7. Walk to UP Express Pearson Airport (1 m in 1 min)
8. Walk to UP Express Pearson Airport (51 m in 1 min)
9. UP Express Transit UP: Train towards UP Express Union Station (3 stops). Depart UP Express Pearson Airport at 8:27pm and arrive at UP Express Union Station at 8:52pm. (24.3 km in 25 mins)
10. Walk to Union Station, 65 Front St W, Toronto, ON M5J 1E6, Canada (0.2 km in 3 mins)
11. Head east on Front St W toward Bay StDestination will be on the right (0.1 km in 1 min)
</pre>

## Search the web
Make arbitrary queries to google and get as many as 10 results at once (default 1)

### Usage
From your mobile device, send a text message to your configured twilio number in the following format:<br>
<b>arbitrary query </b>limit</b> n
<br>(if no limit given, defaults to 1. max 10).

#### Examples
<ul>
    <li>
    <b>define love</b><br>
    
    The response would be the following text:
<pre>
How to Define Love: 15 Steps (with Pictures) - wikiHow

Love is difficult to define. How do you avoid confusing it with infatuation or lust? 
Philosophers and psychologists both have attempted to define love, or at least its
 ...

http://www.wikihow.com/Define-Love
</pre>
  </li>
  <li>
 <b>computer science resources limit 3</b><br>
  
Results in following 3 texts:
<pre>
<ol><li>
50+ Killer Resources for Computer Science Students

50+ Killer Online Resources for Computer Science Students. Computer science 
students are lucky because the Internet is like a living textbook, full of ...

http://www.studyweb.com/50-killer-online-resources-for-computer-science-students/
</li>
<li>
Top ten computer science teaching resources | Teacher Network ...

Jan 24, 2012 ... Top ten computer science teaching resources. A pioneering head of ICT shares 
some fantastic routes into teaching children code and ...

http://www.theguardian.com/teacher-network/2012/jan/24/top-ten-computer-science-teaching-resources
</li>
<li>
CS Teaching Resources « Exploring Computer Science

Dr. Ron Eglash's homepage which includes links to relevant research and other 
educational resources www.rpi.edu/~eglash/eglash.htm; Teaching Math and ...

http://www.exploringcs.org/resources/cs-teaching-resources
</li>
<ol>
</pre>
  </li>
</ul>
