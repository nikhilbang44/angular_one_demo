var FacebookStrategy = require('passport-facebook').Strategy; 
var TwitterStrategy = require('passport-twitter').Strategy; 
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy; 
var User = require('../models/user'); 
var session = require('express-session'); 
var jwt = require('jsonwebtoken'); 
var secret = 'kapil'; 
module.exports = function(app,passport) {
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: true, cookie: { secure: false } }));
    passport.serializeUser(function (user, done) {
        if (user.active) {
            if (user.error) {
                token = 'unconfirmed/error'; 
            } else {
                token = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h' }); 
            }
        } else {
            token = 'inactive/error'; 
        }
        done(null, user.id); 
    });
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user); 
        });
    });


    passport.use(new FacebookStrategy({
        clientID: 'dccddddsa', 
        clientSecret: 'asdasdas',
        callbackURL: "http://localhost:8000/auth/facebook/callback",
        profileFields: ['id', 'displayName', 'photos', 'email']
    },
        function (accessToken, refreshToken, profile, done) {
            User.findOne({ email: profile._json.email }).select('username active password email').exec(function (err, user) {
                if (err) done(err);

                if (user && user !== null) {
                    done(null, user);
                } else {
                    done(err);
                }
            });
        }
    ));
    
    app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/facebookerror' }), function (req, res) {
        res.redirect('/facebook/' + token); 
    });

    app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));




    passport.use(new TwitterStrategy({
        consumerKey: 'asdsdas', // Replace with your Twitter Developer App consumer key
        consumerSecret: 'asdsd', // Replace with your Twitter Developer App consumer secret
        callbackURL: "asdasd", // Replace with your Twitter Developer App callback URL
        userProfileURL: ""
    },
        function (token, tokenSecret, profile, done) {
            if (profile.emails) {
                User.findOne({ email: profile.emails[0].value }).select('username active password email').exec(function (err, user) {
                    if (err) {
                        done(err);
                    } else {
                        if (user && user !== null) {
                            done(null, user);
                        } else {
                            done(err);
                        }
                    }
                });
            } else {
                user = {}; // Since no user object exists, create a temporary one in order to return an error
                user.id = 'null'; // Temporary id
                user.active = true; // Temporary status
                user.error = true; // Ensure error is known to exist
                done(null, user); // Serialize and catch error
            }
        }
    ));

    app.get('/auth/twitter', passport.authenticate('twitter'));
    app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/twittererror' }), function (req, res) {
        res.redirect('/twitter/' + token)
    });


    passport.use(new GoogleStrategy({
        clientID: 'fdgfdgdfg', // Replace with your Google Developer App client ID
        clientSecret: 'dgfdgd', // Replace with your Google Developer App client ID
        callbackURL: "" // Replace with your Google Developer App callback URL
    },
        function (accessToken, refreshToken, profile, done) {
            User.findOne({ email: profile.emails[0].value }).select('username active password email').exec(function (err, user) {
                if (err) done(err);

                if (user && user !== null) {
                    done(null, user);
                } else {
                    done(err);
                }
            });
        }
    ));

    // Google Routes    
    app.get('/auth/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login', 'profile', 'email'] }));
    app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/googleerror' }), function (req, res) {
        res.redirect('/google/' + token); 
    });
    
    return passport;
}