$(document).ready(function(){
	getLocation();
	// updateTemp();

});
$("#temp-toggle :radio").change(function () {
	console.log("clicked");
	if($('#f').is(':checked')){
		console.log("f is checked");
		$(".cDeg").hide();
		$(".fDeg").show();
	}
	else if($('#c').is(':checked')){
		console.log("c is checked");
		$(".fDeg").hide();
		$(".cDeg").show();
	}
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
		"nt_mostlycloudy": Skycons.PARTLY_CLOUDY_NIGHT,
		"cloudy": Skycons.CLOUDY,
		"fog": Skycons.FOG,
		"mostlysunny": Skycons.PARTLY_CLOUDY_DAY,
		"partlysunny": Skycons.PARTLY_CLOUDY_DAY,
		"sleet": Skycons.SLEET,
		"nt_sleet": Skycons.SLEET,
		"snow": Skycons.SNOW,
		"nt_snow": Skycons.SNOW,
		"sunny": Skycons.CLEAR_DAY,
		"chancerain": Skycons.RAIN,
		"chanceflurries": Skycons.SNOW,
		"chancesleet": Skycons.SLEET,
		"chancesnow": Skycons.SNOW,
		"chancetstorms": Skycons.RAIN,
		"nt_chancerain": Skycons.RAIN,
		"nt_chanceflurries": Skycons.SNOW,
		"nt_chancesleet": Skycons.SLEET,
		"nt_chancesnow": Skycons.SNOW,
		"nt_chancetstorms": Skycons.RAIN,
		"nt_chancetstorms": Skycons.RAIN,
		"flurries": Skycons.SNOW,
		"nt_flurries": Skycons.SNOW,
		"hazy": Skycons.PARTLY_CLOUDY_DAY
	}
	var skycons = new Skycons({"color": "black"});

	var city = data['location']['city'];
	var state = data['location']['state'];
	var country = data['location']['country'];
	var zip = data['location']['zip'];

	var location = city + ', ' + state + ', ' + country;
	$("#location").html('<p>' + location + '</p>');


	var $fDegrees = $('<p class="fDeg">&deg;F</p>');
	var $cDegrees = $('<p class="cDeg">&deg;C</p>');

	//set current conditions
	var cur = data['current_observation'];

	var $fTemp = $fDegrees.clone().prepend("Current Temperature: " + cur['temp_f']);
	var $cTemp = $cDegrees.clone().prepend("Current Temperature: " + cur['temp_c']);
	var weather = cur['weather'];
	var $fFeels = $fDegrees.clone().prepend("Feels Like: " + cur['feelslike_f']);
	var $cFeels = $cDegrees.clone().prepend("Feels Like: " + cur['feelslike_c']);
	var timeUpdated = cur['observation_time'];
	var curIcon = icons[cur['icon']];
	var curIconUrl = cur['icon_url'];
	var relHumidity = cur['relative_humidity'];
	var wind = cur['wind_string'];

	//displlay current conditions
	$("#cur-temp").append($fTemp);
	$("#cur-temp").append($cTemp);
	$("#cur-temp").append('<p>Relative Humidity: ' + relHumidity + '</p>');
	$("#cur-weather").append("<p>" + weather + "</p>");
	$("#feels-like").append($fFeels);
	$("#feels-like").append($cFeels);
	skycons.add("cur-icon", curIcon);

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
		$("#forecast div:nth-child(" + (period + 1) + ") > div.weather").append('<p class="fDeg">' + forecast + "</p>");
		$("#forecast div:nth-child(" + (period + 1) + ") > div.weather").append('<p class="cDeg">' + mForecast + "</p>");
		$("#forecast div:nth-child(" + (period + 1) + ") > div.title").html("<h2>" + dayName + "</h2>");
		$("#forecast div:nth-child(" + (period + 1) + ") > div.day_data").append("<p>Probability of Precipitation: " + dayPrecip + "%</p>");
		skycons.add("icon" + (period + 1), icon);
		console.log(day['icon']);
	}
	//play the skycons
	skycons.play();

	
	//set the high/low for each day
	for(var period = 0; period < simple.length; period++){
		var $fHigh = $fDegrees.clone().prepend("High: " + simple[period]['high']['fahrenheit']);
		var $fLow = $fDegrees.clone().prepend("Low: " + simple[period]['low']['fahrenheit']);
		var $cHigh = $cDegrees.clone().prepend("High: " + simple[period]['high']['celsius']);
		var $cLow = $cDegrees.clone().prepend("Low: " + simple[period]['low']['celsius']);
		var humidity = simple[period]['avehumidity'];
		var $day = $("#forecast div:nth-child(" + (period * 2 + 1) + ") > div.day_data");
		var $day_night = $("#forecast div:nth-child(" + (period * 2 + 2) + ") > div.day_data");
		$day.append($fHigh);
		$day_night.append($fHigh.clone());
		$day.append($fLow);
		$day_night.append($fLow.clone());
		$day.append($cHigh);
		$day_night.append($cHigh.clone());
		$day.append($cLow);
		$day_night.append($cLow.clone());
		console.log($day[0]);
		$($day.find('p.humidity')).prepend("Average Humidity: " + humidity);
		$($day_night.find(' p.humidity')).prepend("Average Humidity: " + humidity);
	}
}

function errorCallback(err){
	console.log("ERROR: " + err.code + " " +  err.message);
}

function updateTemp(){
	$("input[name=units]:radio").change(function () {
		if(document.getElementById('f').checked){
			$(".cDeg").hide();
			$(".fDeg").show();
		}
		else if(document.getElementById('c').checked){
			$(".fDeg").hide();
			$(".cDeg").show();
		}
	});
}