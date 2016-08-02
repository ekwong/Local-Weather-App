$(document).ready(function(){
	getLocation();
});

function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(showPosition, errorCallback);
	} else {
		var handle = "Geolocation is not supported by this browser.";
		console.log(handle);
	}
}

function showPosition(position) {
	var lat = position.coords.latitude;
	var lon = position.coords.longitude;
	console.log(lat + " " + lon);
	getData(lat, lon);
	console.log("test");
}

function getData(lat, lon){
	var key = "c40d7e8a27a99ff6";
	console.log("in getData");
	$.ajax({
		url : "https://api.wunderground.com/api/" + key + "/forecast/geolookup/conditions/q/" + lat + "," + lon + ".json",
		dataType: "jsonp",
		success: parseData,
		error: function(xhr, error){
			console.debug(xhr); console.debug(error);
		}
	});
}

function parseData(data){
	//map Skycons
	var icons = {
		"partlycloudy": Skycons.PARTLY_CLOUDY_DAY,
		"nt_partlycloudy": Skycons.PARTLY_CLOUDY_NIGHT,
		"clear": Skycons.CLEAR_DAY,
		"nt_clear": Skycons.CLEAR_NIGHT,
		"tstorms": Skycons.RAIN,
		"nt_tstorms": Skycons.RAIN,
		"mostlycloudy": Skycons.PARTLY_CLOUDY_DAY,
		"cloudy": Skycons.CLOUDY,
		"fog": Skycons.FOG,
		"mostlysunny": Skycons.PARTLY_CLOUDY_DAY,
		"partlysunny": Skycons.PARTLY_CLOUDY_DAY,
		"sleet": Skycons.SLEET,
		"snow": Skycons.SNOW,
		"sunny": Skycons.CLEAR_DAY,
		"chancerain": Skycons.RAIN,
		"chanceflurries": Skycons.SNOW,
		"chancesleet": Skycons.SLEET,
		"chancesnow": Skycons.SNOW,
		"chancetstorms": Skycons.RAIN,
		"flurries": Skycons.SNOW,
		"hazy": Skycons.PARTLY_CLOUDY_DAY
	}
	var skycons = new Skycons({"color": "black"});

	var city = data['location']['city'];
	var state = data['location']['state'];
	var country = data['location']['country'];
	var zip = data['location']['zip'];

	var location = city + ', ' + state + ', ' + country;
	$("#location").html(location);

	//set current conditions
	var cur = data['current_observation'];

	var fTemp = cur['temp_f'];
	var cTemp = cur['temp_c'];
	var weather = cur['weather'];
	var fFeels = cur['feels_like_f'];
	var cFeels = cur['feels_like_c'];
	var timeUpdated = cur['observation_time'];
	var curIcon = icons[cur['icon']];
	var curIconUrl = cur['icon_url'];

	//displlay current conditions
	$("#cur-temp").html(fTemp);
	$("#cur-weather").html(weather);
	$("#feels-like").html(fFeels);

	//forecastday has 8 periods
	var txtForecasts = data['forecast']['txt_forecast']['forecastday'];
	var simple = data['forecast']['simpleforecast']['forecastday'];

	//set the forecast
	for(var period = 0; period < txtForecasts.length; period++){
		var day = txtForecasts[period];
		var icon = icons[day['icon']];
		var dayName = day['title'];
		var dayPrecip = day['pop'];
		var forecast = day['fcttext'];
		var mForecast = day['fcttext_metric'];
		console.log("Period: " + (period +  1) + "; Forecast: " + forecast);
		$("#day-weather td:nth-child(" + (period + 1) + ")").html(forecast);
		$("#day-names th:nth-child(" + (period + 1) + ")").html(dayName);
		skycons.add("icon" + (period + 1), icon);
		console.log(day['icon']);
	}
	//play the skycons
	skycons.play();
	
	for(var period = 0; period < simple.length; period++){
		var fHigh = simple[period]['high']['fahrenheit'];
		var fLow = simple[period]['low']['fahrenheit'];
		var cHigh = simple[period]['high']['celsius'];
		var cLow = simple[period]['low']['celsius'];
		console.log("Period: " + period + "; high: " + fHigh);
		$("#day-ranges td:nth-child(" + ((period * 2) + 1) + ")").html("<p>High: " + simple[period]['high']['fahrenheit'] + "</p>");
		$("#day-ranges td:nth-child(" + ((period * 2) + 1) + ")").append("<p>Low: " + simple[period]['low']['fahrenheit'] + "</p>");
	}

}

function errorCallback(err){
	console.log("ERROR: " + err.code + " " +  err.message);
}

// $('table').stacktable();