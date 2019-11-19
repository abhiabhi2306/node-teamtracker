const express = require("express");
const webapp = express();
const MongoClient = require('mongodb').MongoClient
const passport=require('passport');
const session=require('express-session');
const crypto = require('crypto');
var bodyParser = require('body-parser');
const bcrypt=require('bcrypt');
webapp.use(bodyParser.urlencoded({extended: true}))
webapp.set('view engine', 'ejs')
var db

webapp.use(express.static('public'))


var user=null;
var date=new Date();

MongoClient.connect('mongodb+srv://webapp1:webapp1@cluster0-mwxmu.mongodb.net/test?retryWrites=true&w=majority',(err,database) => {

})

MongoClient.connect('mongodb+srv://webapp1:webapp1@cluster0-mwxmu.mongodb.net/test?retryWrites=true&w=majority', (err, client) => {
  if (err) return console.log(err)
  db = client.db('webappdb') // whatever your database name is
  webapp.listen(3000, () => {
    console.log('listening on 3000')
  })
})

webapp.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

webapp.use(passport.initialize());
webapp.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});


const GitHubStrategy = require('passport-github').Strategy;

const GITHUB_CLIENT_ID = "CLIENT_ID_HERE"
const GITHUB_CLIENT_SECRET = "CLIENT_SECRET_HERE";

passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: "/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
      process.nextTick(function () {
        test(profile);
      return cb(null, profile);
    });
  }
));

var isAuth = function(req,res,next) {
   if (req.isAuthenticated()) {

     return next();
   }
     res.redirect('/fail')
   }



webapp.get('/auth/github',
passport.authenticate('github'));

function test(block) {


   user=block.displayName;
   console.log(user);
}


webapp.get('/auth/github/callback',
passport.authenticate('github', { failureRedirect: '/fail' }),
  function(req, res) {
    res.redirect('/todo');
  });

webapp.post('/signup', function(req,res){
      var username = req.body.username;
      var pass = req.body.password;
      var email =req.body.email;

      //hashing pass with hmac and sha
      var password = getHash(pass);

      var data = {
          "username": username,
          "email":email,
          "password":password,
      }
  db.collection('account').insertOne(data,function(err, collection){
          if (err) throw err;
          console.log("Record inserted Successfully");

          res.redirect('/success')

      }) })


webapp.get('/signup', function(req,res) {
      res.render('signup.ejs')
})


var getHash = (pass) => {
        var key = "blablabla@gmail.com"
				var hmac = crypto.createHmac('sha512',key);
				//passing the data to be hashed
				data = hmac.update(pass);
				//Creating the hmac in the required format
				gen_hmac= data.digest('hex');
				console.log("hmac : " + gen_hmac);

        return gen_hmac;

      }


webapp.get('/success', function(req,res) {
      res.send("Registration success")
    })

webapp.get('/logout', function(req, res){
    req.logout();
    //delete req.session.authenticated;
    res.redirect('/home');

  })


webapp.get('/', function(req, res) {
  res.redirect('/home')
})

webapp.get('/home',function(req,res) {
  res.render('home.ejs')
})

webapp.get('/todo', isAuth, (req, res) => {
        res.render('todo.ejs',{user: user,date: date})
})

webapp.get('/mylist',isAuth, (req, res) => {
  db.collection('todo').find().toArray((err, result) => {
   if (err) return console.log(err)
   // renders index.ejs
   res.render('list.ejs', {todo: result,user: user,date: date})
 })
})

webapp.get('/users',isAuth, (req, res) => {
  db.collection('account').find().toArray((err, result) => {
   if (err) return console.log(err)
   // renders index.ejs
   res.render('members.ejs', {users: result,user: user,date: date})
 })
})

webapp.post('/todo', (req, res) => {
  db.collection('todo').save(req.body, (err, result) => {
    if (err) return console.log(err)

    console.log('added to db')
    res.redirect('/auth/github')
  })
})

webapp.get('/login', function(req,res) {
  res.send('Login Demo')
})

webapp.get('/fail', function(req,res) {
  res.render('fail.ejs')
})
