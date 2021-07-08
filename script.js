/*
 * This demo illustrates real-time data updates from a websocket by 
 * writing and listening to data events from a websocket echo server.
 */

var interval;
var websocket;

var websocketEchoServerUri = "wss://echo.websocket.org/";
var chartData = []; //will be updated by our simulated server
var serverLog = document.getElementById("server-log");
var startButton = document.getElementById('start-demo');
var endButton = document.getElementById('end-demo');
var chart = AmCharts.makeChart("chartdiv", {
  "type": "serial",
  "theme": "light",
  "dataDateFormat": "YYYY-MM-DD",
  "valueAxes": [{
    "id": "v1",
    "position": "left"
  }],
  "allLabels": [
	],
  "titles": [
		{
			"color": "#0000FF",
			"id": "Title-1",
			"size": 20,
			"text": "ONLINE CHECK WEIGHT BAGGING PPE LINE C"
		}
	],
  "graphs": [{
    "id": "g1",
    "bullet": "round",
    "valueField": "weight",
    "balloonText": "[[category]]: [[weight]]"
  }],
  "categoryField": "date",
  "categoryAxis": {
    "parseDates": true,
    "equalSpacing": true,
    "dashLength": 1,
    "minorGridEnabled": true
  },
  "dataProvider": chartData
});

startButton.addEventListener('click', startDemo);
endButton.addEventListener('click', endDemo);

function startDemo() {
  startButton.disabled = "disabled";
  endButton.disabled = "";
  websocket = initWebSocket(websocketEchoServerUri);
}

function endDemo() {
  startButton.disabled = "";
  endButton.disabled = "disabled";
  websocket.close();
}

function initWebSocket(wsUri) {
  var ws = new WebSocket(wsUri);
  ws.onopen = onConnect;
  ws.onclose = onClose;
  ws.onerror = onError;
  ws.onmessage = updateChart;
  return ws;
}

/*  
 * Called during the onmessage event. Your application will need 
 * to parse  your websocket server's response into a data object 
 * or array of dataObjects your chart expects
 */
function updateChart(wsEvent) {
  var newData = JSON.parse(wsEvent.data);
  chartData.push.apply(chartData, newData);
  // keep only 50 datapoints on screen for the demo
  if (chartData.length > 50) {
    chartData.splice(0, chartData.length - 50);
  }
  writeToScreen("<span style='color: blue'>Received: " + wsEvent.data + "</span>");
  chart.validateData(); //call to redraw the chart with new data
}

function onConnect(wsEvent) {
  writeToScreen("Server connection successful. Listening for data now.");
  interval = setInterval(getDataFromServer, 2000); //we're simulating a datafeed by calling our getDataFromServer method every 2 seconds
}

function onError(wsEvent) {
  writeToScreen("<span style='color: red'>ERROR:" + wsEvent + "</span>");
}

function onClose(wsEvent) {
  writeToScreen("Server connection closed");
  clearInterval(interval);
}

//For debug messaging
function writeToScreen(message) {
  var pre = document.createElement("p");
  pre.style.wordWrap = "break-word";
  pre.innerHTML = message;
  serverLog.appendChild(pre);
  serverLog.scrollTop = serverLog.scrollHeight;
}

/*
 * This simulates a data response from the server 
 * using websocket.org's echo server. The method generates 
 * a random sized array of values and writes it to 
 * the server in the form of a JSON string, 
 * which will be echoed back to the client
 */
function getDataFromServer() {
  var newDate;
  var newValue;
  var netweight;
  var unit_line="PPE LINE C";
  var dt;
  var t;
  var newData = [];
  var newDataSize = Math.round(Math.random() + 3) + 1;

  if (chartData.length) {
    newDate = new Date(chartData[chartData.length - 1].date);
  } else {
    newDate = new Date();
  }
  console.log("newDataSize ="+newDataSize)
  for (var i = 0; i < newDataSize; ++i) {
    //newValue = Math.round(Math.random() * (40 + i)) + 10 + i;
    //newDate.setDate(newDate.getDate() + 1);
    newDate.setDate(newDate.getDate() );
    dt=newDate.getFullYear()+'-'+newDate.getMonth()+'-'+newDate.getDay()+' '+newDate.getHours()+':'+newDate.getMinutes()+':'+newDate.getSeconds()+4;
    t=newDate.getHours()+':'+newDate.getMinutes()+':'+newDate.getSeconds()+4;
    netweight=genRand(25.100,25.130,3);

    newData.push({
      date: newDate,
     // value: newValue,
      unit_line:unit_line,
      weight:netweight,
      time:t,
      datetime:dt
    });
  }
 // var ws = new WebSocket("ws://127.0.0.1:88");
 // อ่านเพิ่ม https://www.html5gamedevs.com/topic/21416-websocket-delaying-the-message/
  websocket.send(JSON.stringify(newData));
}
//setInterval(getDataFromServer, 4000);
function genRand(min, max, decimalPlaces) {  
  var rand = Math.random() < 0.5 ? ((1-Math.random()) * (max-min) + min) : (Math.random() * (max-min) + min);  // could be min or max or anything in between
  var power = Math.pow(10, decimalPlaces);
  return Math.floor(rand*power) / power;
}