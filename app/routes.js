var map = require('./models/map.js');

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
    
    /*app.get('*', function (req, res){
       res.redirect('/pagenotfound'); 
    });
    */
    
    
    //================================================================================================================================
    //Map Routes=====================================================================================================================
    //================================================================================================================================
    
    
    app.get('/map', /*isLoggedIn,*/ function (req, res) {
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

    // create map and send back all nodes after creation
    app.post('/api/map', function (req, res) {

		linkArray = [{}];
	
		req.body.prerequisites.split(',').forEach(function(element, index, array){
			linkArray[index] = {source: req.body.title, target: element};
		});
	console.log(req.body);
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
    app.delete('/api/map/:node_id', function (req, res) {
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