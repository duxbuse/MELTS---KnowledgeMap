// set up ======================================================================
var express  = require('express');
var app      = express(); 								// create our app w/ express

var mongoose = require('mongoose'); 					// mongoose for mongodb
var port  	 = process.env.PORT || 8000; 				// set the port
var database = require('./config/database.js'); 		// load the database config

var passport = require('passport');

// configuration ===============================================================
mongoose.connect(database.url); 	// connect to mongoDB database 
mongoose.connection.on('open', function (err) {
 if(err){ 
	console.log("Could not connect to Mongoose DB");
 }else{
	console.log("Connected to Mongoose DB");
 }
});

require('./config/passport')(passport); // pass passport for configuration


app.configure(function() {
	app.use(express.static(__dirname + '/public')); 		// set the static files location /public/img will be /img for users
	app.use(express.logger('dev')); 						// log every request to the console
    app.use(express.cookieParser());                        // read cookies (needed for auth)
	app.use(express.json());
    app.use(express.urlencoded()); 							// pull information from html in POST
	app.use(express.methodOverride()); 						// simulate DELETE and PUT
    
    // required for passport
    app.use(express.session({ secret: 'sean' })); // session secret
    app.use(passport.initialize());
    app.use(passport.session()); // persistent login sessions
});

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport



// listen (start app with "node server.js") ======================================
var server = app.listen(port, '130.194.20.158', function(){//130.194.20.158
	console.log("App listening on " + server.address().address + ":" + port);
});

//try to figure out how to use forever and nodemon to make dev easier.
//http://stackoverflow.com/questions/16369018/forever-nodemon-running-together
