/* Magic Mirror
 * Module: MMM-WetterOnline
 *
 * By bog
 *
 */
Module.register("MMM-WetterOnline", {
	
	defaults: {
		useHeader: true,
		header: "",
		city: "new-york",
		width: "400px",
		daysTrend: 4,
		updateIntervalMins: 5,
		userAgent: "Mozilla/5.0 (Linux; Android 9; Pixel Build/PQ3A.190705.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/75.0.3770.101 Mobile Safari/537.36"
	},
	
	weatherData: {},
	
	getStyles: function() {
		return ["MMM-WetterOnline.css"];
	},
	
	getScripts: function() {
		return [];
	},
	
	requiresVersion: '2.2.0',
	
	start: function() {
		var self = this;
		var payload = {city: this.config.city, userAgent: this.config.userAgent};
		setInterval(function() {
			self.sendSocketNotification("WETTERONLINE_REFRESH", payload); // no speed defined, so it updates instantly.
		}, this.config.updateIntervalMins * 60 * 1000);
		self.sendSocketNotification("WETTERONLINE_REFRESH", payload);
	},
	
	getDom: function() {
		var wrapper = document.createElement("div");
		wrapper.classList.add("small");
		
		if(Object.keys(this.weatherData).length > 0) {
			var currentWrapper = document.createElement("div");
			currentWrapper.classList.add("weather");
			currentWrapper.insertAdjacentHTML("beforeend", '<span class="logo-container"><img src="' + this.weatherData.symbolUrls.hourlies + this.weatherData.hourlies[0].symbol + '.svg" class="blacknwhite" /> <span class="currentTemp">' + this.weatherData.currentTemp + '&deg;C</span></span>');
			currentWrapper.insertAdjacentHTML("beforeend", '<br />');
			currentWrapper.insertAdjacentHTML("beforeend", this.weatherData.currConditions.symbol_text);
			currentWrapper.insertAdjacentHTML("beforeend", '<br />');
			currentWrapper.insertAdjacentHTML("beforeend", this.weatherData.currConditions.wind_speed_text + ', ' + this.weatherData.currConditions.wind_speed_kmh + 'km/h');
			
			wrapper.appendChild(currentWrapper);
			
			if(parseInt(this.config.daysTrend) > 0) {
				wrapper.insertAdjacentHTML("beforeend", '<br />');
				
				var ft = document.createElement("table");
				
				var headerHtml = '<tr>';
				for(var i = 0; i < this.weatherData.dailies.length && i < this.config.daysTrend; i++) {
					headerHtml += '<th class="trendcell">' + this.weatherData.dailies[i].day_time_label.replace(/ - .*/, '').substring(0, 2) + '</th>';
				}
				ft.insertAdjacentHTML("beforeend", headerHtml + '</tr>');
				
				var dailyEntriesHtml = '<tr>';
				for(var i = 0; i < this.weatherData.dailies.length && i < this.config.daysTrend; i++) {
					dailyEntriesHtml += '<td class="trendcell">';
					dailyEntriesHtml += '<img src="' + this.weatherData.symbolUrls.dailies + this.weatherData.dailies[i].symbol + '.svg" class="blacknwhite" width="32" />';
					dailyEntriesHtml += '<br />';
					dailyEntriesHtml += '<span class="temp-' + this.weatherData.dailies[i].high + ' logo-container"><img class="legend-logo inverted" src="' + this.file('assets/high-temperature.svg') + '" /> ' + this.weatherData.dailies[i].high + '</span>';
					dailyEntriesHtml += '<br />';
					dailyEntriesHtml += '<span class="temp-' + this.weatherData.dailies[i].low + ' logo-container"><img class="legend-logo inverted" src="' + this.file('assets/low-temperature.svg') + '" />' + this.weatherData.dailies[i].low + '</span>';
					dailyEntriesHtml += '<br />';
					dailyEntriesHtml += '<span class="precipitation logo-container"><img class="legend-logo" src="' + this.file('assets/umbrella.svg') + '" /> ' + this.weatherData.dailies[i].pop +'%</span>';
					dailyEntriesHtml += '</td>';
				}
				ft.insertAdjacentHTML("beforeend", dailyEntriesHtml + '</tr>');
				
				wrapper.appendChild(ft);
			}
		}
		
		return wrapper;
	},
	
	socketNotificationReceived: function(notification, payload) {
		if(notification  == "WETTERONLINE_RESULTS") {
			this.weatherData = payload;
			this.updateDom();
		}
	}
});