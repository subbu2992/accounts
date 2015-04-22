
var User  = require('../models/user');
var configDB = require('../config/database.js');
var mongoose = require('mongoose');
var XlsxWriter = require('node-simple-xlsx');
// var excelParser = require('excel-parser');
var parseXlsx = require('excel');
var writer = new XlsxWriter();
writer.setHeaders(['email', 'id']);



module.exports = function(app, passport) {

    app.get('/', function(req, res) {
        console.log("/");
        res.render('index.ejs');
    });

     app.get('/login', function(req, res) {
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

    app.get('/signup', function(req, res) {
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    })

    app.get('/forget', function(req, res) {
        res.render('forget.ejs', { message: req.flash('message') });
    })

    app.get('/userList', function(req, res) {

        User.find({}, function(err, db) {
            console.log("hello");
            if (!err){ 
        res.render('userlist.ejs', { user:db} );

            } 
         });
    });

    app.get('/:id/editadmin', function(req, res) {

        User.findById(req.params.id,function(err,user){
            if(err){
                throw err;
            }else{
            // console.log("------------------------------" + user);
            user.update({
                "admin":true,
            },function(err){
                if(err){
                    console.log(err);
                }else{
                res.redirect("/userList")
                }
            })
          }
        })
    });

    app.get('/:id/delete',function(req,res){
        User.findById(req.params.id,function(err,user){
            if(err){
                throw err;
            }else{
                User.remove({
                   _id: req.params.id
                },function(err){
                if(err){
                 console.log(err);
                } else{
                res.redirect("/userList")
              }
            })
        }
    })
});

    app.get('/profile', isLoggedIn, function(req, res) {
        console.log("prof");
        res.render('profile.ejs', {
            user : req.user 
        });
    });

    app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

     app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

    app.get('/auth/google/callback',
            passport.authenticate('google', {
                    successRedirect : '/profile',
                    failureRedirect : '/'
            }));

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', 
        failureRedirect : '/signup', 
        failureFlash : true 
    }));

     app.post('/forget', passport.authenticate('local-forget', {
        successRedirect : '/profile', 
        failureRedirect : '/forget', 
        failureFlash : true 
    }));

    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', 
        failureRedirect : '/login',
        failureFlash : true 
    }));


    app.get('/logout',function(req, res) {
        req.logout();
        console.log("logout");
        res.redirect('/');
    });

 app.get('/:id/:email/excel',function(req,res){

       parseXlsx('test.xlsx', function(err, data) {
        if(err) throw err;
        else console.log("--------------"+data);
       });

        writer.addRow({
            'email': req.params.email,
            'id': req.params.id
        });

         
        writer.pack('test.xlsx', function (err) {
            if (err) {
                console.log(err);
            } else {
                res.redirect("/userList")
                
            }
        });

    })

};



function isLoggedIn(req, res, next) {
    console.log("islog");
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}