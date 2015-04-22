var LocalStrategy    = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var LocalStrategy   = require('passport-local').Strategy;


var User  = require('../models/user');

var configAuth = require('../config/auth');

module.exports = function(passport) {

passport.serializeUser(function(user, done) {
    // console.log('serializeUser: ' + user.id)
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user){
        // console.log(user)
        if(!err) done(null, user);
        else done(err, null)  
    })
});



    passport.use(new FacebookStrategy({

        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL

    },

    function(token, refreshToken, profile, done) {

        process.nextTick(function() {


            User.findOne({ 'email' : profile.emails[0].value }, function(err, user) {

                if (err)
                    return done(err);

                if (user) {
                    console.log("old");
                    return done(null, user);
                } else {
                    console.log("new");
                    var newUser    = new User();

                    newUser.name  = profile.name.givenName + ' ' + profile.name.familyName; 
                    newUser.email = profile.emails[0].value; 

                    newUser.save(function(err) {
                        if (err)
                            throw err;

                        return done(null, newUser);
                    });
                }

            });
        });

    }));

passport.use(new GoogleStrategy({

        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,

    },
    function(token, refreshToken, profile, done) {

        process.nextTick(function() {

            User.findOne({ 'email' : profile.emails[0].value }, function(err, user) {
                if (err)
                    return done(err);

                if (user) {
                    console.log("old");
                    return done(null, user);

                } else {
                    console.log("new");
                    var newUser    = new User();

                    newUser.name  = profile.displayName;
                    newUser.email = profile.emails[0].value; 

                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }
            });
        });
    }));

 passport.use('local-signup', new LocalStrategy({

        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true 
    },
    function(req, email, password, done) {

        process.nextTick(function() {

        User.findOne({ 'email' :  email }, function(err, user) {
            if (err)
                return done(err);

            if (user) {
                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            } else {

                var newUser    = new User();

                newUser.email    = email;
                newUser.password = newUser.generateHash(password);


                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
            }

        });    

        });

    }));

 passport.use('local-login', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true 
    },
    function(req, email, password, done) { 

        // console.log(req.body);
        User.findOne({ 'email' :  email }, function(err, user) {
            if (err)
                return done(err);

            if (!user)
                return done(null, false, req.flash('loginMessage', 'No user found.')); 

            if (!user.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Wrong password.')); 
            return done(null, user);
        });

    }));

 passport.use('local-forget', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true 
    },
    function(req, email, password, done) {

        process.nextTick(function() {

        User.findOne({ 'email' :  email }, function(err, user) {
            // if (err)
            //     // return done(err);
            //     return done(null, false, req.flash('message', 'email not found'));
              if (err)
                return done(err);

            if (!user)
                return done(null, false, req.flash('message', 'No user found.'));

            if(user)
             {

                user.update({
                    "password" : user.generateHash(password)

                   },function(err){
                    if (err)
                        throw err;
                    return done(null, user);
                });
            }

        });    

        });

    }));



};

