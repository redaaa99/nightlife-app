const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const config = require('./config');
const  Yelp = require('yelpv3');
const jwt = require('jsonwebtoken');
const User = require('./server/models/user');

const yelp = new Yelp({
    app_id: config.app_id,
    app_secret: config.app_secret
});



// connect to the database and load models
require('./server/models').connect(config.dbUri);

const app = express();
// tell the app to look for static files in these directories
app.use(express.static('./server/static/'));
app.use(express.static('./client/dist/'));
// tell the app to parse HTTP body messages
app.use(bodyParser.urlencoded({ extended: false }));
// pass the passport middleware
app.use(passport.initialize());

// load passport strategies
const localSignupStrategy = require('./server/passport/local-signup');
const localLoginStrategy = require('./server/passport/local-login');
passport.use('local-signup', localSignupStrategy);
passport.use('local-login', localLoginStrategy);

// pass the authenticaion checker middleware
const authCheckMiddleware = require('./server/middleware/auth-check');
app.use('/api', authCheckMiddleware);

// routes
const authRoutes = require('./server/routes/auth');
const apiRoutes = require('./server/routes/api');
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

let numberOfPplGoingTo = {};


app.get('/search/:term', (req, res) => {
    console.log(req.params.term);
    yelp.search({location: req.params.term.trim().toString(),limit : 50})
        .then(function (data) {
            User.find({goingTo: {$exists: true}}, function(err, docs) {
            var obj = {};
            docs.map((user)=>{
                user.goingTo.map((place) => {
                    if(obj[place]){
                        obj[place] += 1;
                    }
                    else
                    {
                        obj[place] = 1;
                    }
                })
            });
            var helperarr = JSON.parse(data).businesses;
            JSON.parse(data).businesses.map((element,index) => {
                helperarr[index].numberOfPpl = obj[element.id];
            });
            res.status(200).send(JSON.stringify(helperarr));
        });
            
        })
        .catch(function (err) {
            res.status(401).json({error : err});
        });

});


app.get('/add', (req, res) => {
    const token = req.query.userToken;
    jwt.verify(token, config.jwtSecret, (err, decoded) => {
        // the 401 code is for unauthorized status
        if (err) { return res.status(401); }
        const userId = decoded.sub;
        User.findById(userId,function(err,user){
            if(user.goingTo.indexOf(req.query.ind)>=0)
            {
                User.findOneAndUpdate({_id : userId}, {$pull: {goingTo: req.query.ind}}, function(err, data){
                    if(err) {
                      return res.status(500).json({'error' : 'error in deleting address'});
                    }
                    else
                    {
                        yelp.search({location: req.query.term.trim().toString(),limit : 50})
                    .then(function (data) {
                        User.find({goingTo: {$exists: true}}, function(err, docs) {
                        var obj = {};
                        docs.map((user)=>{
                            user.goingTo.map((place) => {
                                if(obj[place]){
                                    obj[place] += 1;
                                }
                                else
                                {
                                    obj[place] = 1;
                                }
                            })
                        });
                        var helperarr = JSON.parse(data).businesses;
                        JSON.parse(data).businesses.map((element,index) => {
                            helperarr[index].numberOfPpl = obj[element.id];
                        });
                        console.log(helperarr);
                        res.status(200).send(JSON.stringify(helperarr));
                    });
                        
                    })
                    .catch(function (err) {
                        res.status(401).json({error : err});
                    });
                    }
                });
            }
            else
            {
            User.findByIdAndUpdate(
            userId,
            {$addToSet: {goingTo: req.query.ind}},
            {safe: true, upsert: true},
            function(err, model) {
                if(err) {throw err;}
                else
                {
                    yelp.search({location: req.query.term.trim().toString(),limit : 50})
                    .then(function (data) {
                        User.find({goingTo: {$exists: true}}, function(err, docs) {
                        var obj = {};
                        docs.map((user)=>{
                            user.goingTo.map((place) => {
                                if(obj[place]){
                                    obj[place] += 1;
                                }
                                else
                                {
                                    obj[place] = 1;
                                }
                            })
                        });
                        var helperarr = JSON.parse(data).businesses;
                        JSON.parse(data).businesses.map((element,index) => {
                            helperarr[index].numberOfPpl = obj[element.id];
                        });
                        console.log(helperarr);
                        res.status(200).send(JSON.stringify(helperarr));
                    });
                        
                    })
                    .catch(function (err) {
                        res.status(401).json({error : err});
                    });
                }
            }
        );
            }
        })
       
        res.status(401);
    });
});


var port = process.env.PORT || 3000;
// start the server
app.listen(port, () => {
    console.log('Server is running on http://localhost:3000 or http://127.0.0.1:3000');
});