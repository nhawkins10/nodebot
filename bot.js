var config = {
	channels: ["#irctest"],
	server: "irc.genesis.cerner.corp",
	botName: "compassbot"
};

var irc = require("irc");

var bot = new irc.Client(config.server, config.botName, {
	channels: config.channels,
	port: 7000,
	debug: true
});

//respond to messages
bot.addListener("message", function(from, to, text, message) {
	var command = {
		target: text.split(" ")[0],
		text: text.split(" ")[1],
		args: text.split(" ").length > 2 ? text.substring(text.indexOf(" ", text.indexOf(" ")+1)+1).split(" ") : ""
	};
	
	//determine if message was sent privately or in channel
	var responseTarget = "";
	if (to.indexOf("#") > -1) {
		responseTarget = to;
	} else {
		responseTarget = from;
	}
	
	//if message was sent to bot specifically
	if (command.target === config.botName) {
		switch(command.text) {
			case "weather":
				showWeather(responseTarget, command.args);
				break;
            case "traffic":
                showTraffic(responseTarget, command.args);
                break;
            case "stock":
                showStock(responseTarget, command.args);
                break;
            case "ascii":
                showAscii(responseTarget, command.args);
                break;
            case "help":
                showHelp(responseTarget, command.args);
                break;
			default:
				bot.say(responseTarget, "I don't recognize that command. Use '" + config.botName + " help' for a list of commands.");
		}
	}
});

//join any channel invited to join
bot.addListener("invite", function(channel, from, message) {
    bot.join(channel, function() {
        console.log("joined " + channel);
    });
});

//log out uncaught errors
bot.addListener("error", function(message) {
        console.log("error caught: " + message);
});

function showWeather(responseTarget, args) {
    //default to Kansas City location if none is given
    var location = "64137";
    if (args) {
        location = args[0];
    }
    
	var promise = new Promise(function(resolve, reject) {		
		var http = require('http');
		http.get({
			host: 'api.openweathermap.org',
			path: '/data/2.5/weather?zip=' + location + '&units=imperial&appid=d956d44527792caf9576d00b8d470514'
		}, function(response) {
			// Continuously update stream with data
			var body = '';
			response.on('data', function(d) {
				body += d;
			});
			response.on('end', function() {
				resolve(JSON.parse(body));
			});
		});
	});
	
	promise.then(function(data) {
        bot.say(responseTarget, data.weather[0].description + " and " + Math.round(data.main.temp) + "° F");
    }).catch(function(error) {
       console.log("weather request failed: " + error); 
       bot.say(responseTarget, "Sorry, I can't retrieve weather data for that location right now.");
    });
}

function showTraffic(responseTarget, args) {
    var addressString = encodeURI(args.join(" "));
    var promise = new Promise(function(resolve, reject) {		
		var http = require('https');
		http.get({
			host: 'maps.googleapis.com',
			path: '/maps/api/directions/json?origin=10236%20Marion%20Park%20Dr%20Kansas%20City%20Mo&destination=' + addressString + '&departure_time=now&key=AIzaSyA2iwXxzCBv4uWurUclCAxrKRTE5_3KKtc'
		}, function(response) {
			// Continuously update stream with data
			var body = '';
			response.on('data', function(d) {
				body += d;
			});
			response.on('end', function() {
				resolve(JSON.parse(body));
			});
		});
	});
	
	promise.then(function(data) {
        data = JSON.parse(data.routes[0].legs[0].duration_in_traffic.value);
        bot.say(responseTarget, "It will take " + Math.round(data / 60) + " minutes to get there.");
    }).catch(function(error) {
       console.log("traffic request failed: " + error); 
       bot.say(responseTarget, "Sorry, I can't retrieve traffic data for that location right now.");
    });
}

function showStock(responseTarget, args) {
    var symbol = args[0];
    var promise = new Promise(function(resolve, reject) {		
		var http = require('http');
		http.get({
			host: 'finance.yahoo.com',
			path: '/webservice/v1/symbols/' + symbol + '/quote?format=json'
		}, function(response) {
			// Continuously update stream with data
			var body = '';
			response.on('data', function(d) {
				body += d;
			});
			response.on('end', function() {
				resolve(JSON.parse(body));
			});
		});
	});
	
	promise.then(function(data) {
        bot.say(responseTarget, data.list.resources[0].resource.fields.name + ' is at $' + parseFloat(data.list.resources[0].resource.fields.price).toFixed(2));
    }).catch(function(error) {
       console.log("stock request failed: " + error); 
       bot.say(responseTarget, "Sorry, I can't retrieve data for that symbol right now.");
    });
}

function showAscii(responseTarget, args) {
    var ascii = require('asciify');
    ascii(args.join(" "), function(err, res){ 
        console.log(res); 
        bot.say(responseTarget, res);
    });
}

function showHelp(responseTarget, args) {
    if (args) {
        switch(args[0]) {
            case "weather":
                bot.say(responseTarget, "Usage: " + config.botName + " weather <zip code>, gets the weather for the given location, defaults to Kansas City");
                break;
            case "traffic":
                bot.say(responseTarget, "Usage: " + config.botName + " traffic <address>, gets time to given address in current traffic");
                break;
            case "stock":
                bot.say(responseTarget, "Usage: " + config.botName + " stock <symbol>, gets current price for the given stock");
                break;
            case "ascii":
                bot.say(responseTarget, "Usage: " + config.botName + " ascii <text>, print the given text as ascii art");
                break;
            default:
                bot.say(responseTarget, "No help available on that command.");
        }
    } else {
        bot.say(responseTarget, "Available Commands:\n\tweather\n\ttraffic\n\tstock\n\tascii\n\thelp");
    }
}
