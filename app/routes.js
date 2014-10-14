var map = require('./models/map.js');

Array.prototype.unique = function() {
    var a = [];
    for (var i=0, l=this.length; i<l; i++)
        if (a.indexOf(this[i]) === -1)
            a.push(this[i]);
    return a;
}



// app/routes.js
module.exports = function (app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function (req, res) {
        res.sendfile('./public/views/index.html'); // load the index.html file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function (req, res) {
		
		if(req.isAuthenticated()){
			res.redirect('/smdux1/profile');
		}else{		
        // render the page and pass in any flash data if it exists
        res.sendfile('./public/views/login.html');
		}
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/smdux1/profile', // redirect to the secure profile section
        failureRedirect: '/smdux1/login', // redirect back to the signup page if there is an error
        }));

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function (req, res) {

        // render the page and pass in any flash data if it exists
        res.sendfile('./public/views/signup.html');
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/smdux1/profile', // redirect to the secure profile section
        failureRedirect: '/smdux1/signup', // redirect back to the signup page if there is an error
        }));

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function (req, res) {
        res.sendfile('./public/views/profile.html');
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/smdux1/');
    });


    // =====================================
    // 404 =================================
    // =====================================
    app.get('/pagenotfound', function(req, res) {
        res.sendfile('./public/views/404.html');
    })
	
	
    // =====================================
    // Send template =========================
    // =====================================
    app.get('/template.csv', function (req, res) {
        res.sendfile('./public/files/template.csv'); 
    });
    
    //================================================================================================================================
    //Map Routes=====================================================================================================================
    //================================================================================================================================
      app.get('/mod', /*isLoggedIn,*/ function (req, res) {
        res.sendfile('./public/views/mod.html');
    });
    
    app.get('/map',  function (req, res) {
        res.sendfile('./public/views/map.html');
    });

    // get all nodes
    app.get('/api/map', function (req, res) {

        // use mongoose to get all nodes in the database
        map.find(function (err, nodes) {

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)

            res.json(nodes); // return all nodes in JSON format

        });
    });

	// find specific nodes
    app.post('/api/map/search', function (req, res) {

		 var msg = req.body.queryMessage.toUpperCase().split("+"); 
		 
		 for(var k = 0; k<msg.length; k++){
			msg[k] = msg[k].trim();
		 }
		 
		 console.log("Searched for: '" + msg + "'");

        // use mongoose to get all nodes in the database
		if (msg[0]==""){//return all nodes
				map.find(function(err, nodes){
				if (err){
					res.send(err)
				}
					
				//console.log(nodes);
				res.json(nodes); // return all nodes in JSON format

				});
		}else if(msg[0][0] == "`"){ //double click
			msg = msg[0].slice(1);//remove tidla 
			
			
			
			map.find({"data.title":msg}, function(err, nodeData){
				
				var links = [];
				
				nodeData[0].links.forEach(function(e,i,a){
					links.push(e.target);
				});
				
				map.find({ $or: [ {"data.title": { $in: links} }, {"links.target":msg}, {"data.title":msg} ] }, function(err, nodes){
				
				// if there is an error retrieving, send the error. nothing after res.send(err) will execute
				if (err){
					res.send(err)
				}
					
				//console.log(nodes);
				res.json(nodes); // return all nodes in JSON format
			
			});
			});
			
			
			
		
		
		}else {//return specific nodes
			map.find( { $or: [ {"data.title": {$in: msg} }, {"data.unit": {$in: msg} }]}, function (err, nodes) {

				// if there is an error retrieving, send the error. nothing after res.send(err) will execute
				if (err){
					res.send(err)
				}
					
				//console.log(nodes);
				res.json(nodes); // return all nodes in JSON format

				});
		}
	});
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	app.post('/api/csv',function(req, res){
		
		var data = req.body.data;
		
		for(var i=2; i<data.length; i++){//
		
			var linkArray = [];
			data[i].slice(2).forEach(function(e,index,a){// slice(2) will grab everything to the end of the array
				if(e != ''){
					linkArray.push( {source: data[i][0].toUpperCase(), target: e.toUpperCase()} );
				}
			});
		
			var query = { data: { title: data[i][0].toUpperCase(), unit: data[i][1].toUpperCase() }	}
		
			map.find(query, function(error, doc) {
				if (error){
					//Do nothing if  you failed to find the element
				}else{				
					if(doc.length > 0){
						var tmp = doc.links;
						tmp.push(linkArray);//save all the links from a pre existing node into tmp
						linkArray = tmp.unique();//ensure that the new list of links from inserted node only contains unique elements
					}
				}
			}).exists(query, true);
		
			map.findOneAndUpdate( query, {links: linkArray}, {upsert: true},
			function(error, doc){
				if (error){
					console.log(error);
					res.send(error);
				}
			});
		}
		
		res.send("uploaded");
		
	});
	
    // create map and send back all nodes after creation
    app.post('/api/mod', function (req, res) {

		linkArray = [{}];
	
		if(req.body.prerequisites !== undefined){
			req.body.prerequisites.split(',').forEach(function(element, index, array){
				linkArray[index] = {source: req.body.title, target: element};
			});
		}
	
        // create a node, information comes from AJAX request from Angular
        map.create({
            data: {title: req.body.title, unit: req.body.unit},
            links: linkArray,
            done: false
        }, function (err, node) {
            if (err){
				console.log(err);
                res.send(err);
			}

            // get and return all the nodes after you create another
            map.find(function (err, nodes) {
                if (err){
                    res.send(err)
				}
                    res.json(nodes);
            });
        });

    });

    // delete a node
    app.delete('/api/mod/:node_id', function (req, res) {
	console.log( req.params.node_id)
	
        map.remove({
            _id: req.params.node_id
        }, function (err, node) {
            if (err)
                res.send(err);

            // get and return all the nodes after you create another
            map.find(function (err, nodes) {
                if (err)
                    res.send(err)
                    res.json(nodes);
            });
        });
    });
    
    
    
};


// route middle ware to make sure
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the login page
    res.redirect('/smdux1/login');
}