var express = require('express');
var mongodb = require('mongodb');
var url = require('url');
//var User = require('./models/user');
var router = express.Router();
var utils = require('./routeUtils');
//var passport = require('passport');
//var setUpPassport = require('./setuppassport');
var app = express();
var MongoClient = mongodb.MongoClient;


var mongoConnector = 'mongodb://localhost:27017/facts';

/*
router.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.errors = req.flash('error');
  res.locals.infos = req.flash('info');
  next();
});
*/

function mongoCount(conn, coll, query, callback) {
  MongoClient.connect(conn, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      //We are connected. :)
      console.log('Connection established to', conn);
      var collection = db.collection(coll);

      collection.count(query, function (err, result) {
        if (err) {
          console.log('Error in query', err);
        } else {
          console.log('mongoCount.result = ' + result + '\n');
          callback(result, db);
          
        }
      });
    }
  });
};

function mongoFind(conn, coll, query, proj, callback) {
  MongoClient.connect(conn, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      //We are connected. :)
      console.log('Connection established to', conn);
      var collection = db.collection(coll);
      var cursor = collection.find(query, proj);
      var results = [];
      cursor.each(function(err, doc) {
        if (err) {
          console.log('mongoFind error: ', err);
        } else if (doc != null) {
          results.push(doc);
        } else {
          callback(results, db);
        }
      });
    }
  });
};

router.get('/api1/count', function(req, res) {
  var queryObject = url.parse(req.url, true).query;
  var validQuery = utils.validateQuery(queryObject);

  mongoCount(mongoConnector, 'allFacts', validQuery, function(count, db) {
    res.send('Result = ' + count + '\n');
    db.close;
  });
});


router.get('/api1/find', function(req, res) {
  var queryObject = url.parse(req.url, true).query;
  var validQuery = utils.validateQuery(queryObject);
  var query = utils.stringToObj(validQuery.query);
  var proj = utils.stringToObj(validQuery.proj);
  console.log('query = ', query);
  console.log('projection = ', proj);
  console.log('find.query.typeof = ', typeof query);
  console.log('find.proj.typeof = ', typeof proj);
  
  mongoFind(mongoConnector, 'allFacts', query, proj, function(found, db) {
    // Construct a rudimentary HTTP response
    var foundLen = found.length;
    var send = '';
    for (var i = 0; foundLen > i; i++) {
      var docOut = 'Found #' + i + ': ';
      for (var key in proj) {
        if (key != '_id') {
          docOut += found[i][key] + ', ';
        }
      }
      send += docOut + '<br>';
    }
    res.send(send);
    db.close();
  });
}); 

app.get('/api1/users', function (res, req) {
  var user = res.param('user');
  res.send('user = ' + user);
});

  /*
  User.find()
  .sort({ createdAt: 'descending' })
  .exec(function(err, users) {
    if (err) { return next(err); }
    res.render('index', { users: users });
  }); 
  */  

/*
router.get('/login', function(req, res) {
  res.render('login');
});

router.post('/login', passport.authenticate("login", {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

router.get('/signup', function(req, res) {
  res.render('signup');
});

router.post('/signup', function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({ username: username }, function(err, user) {
    if (err) { return next(err); }
    if (user) {
      req.flash('error', 'User already exists');
      return res.redirect('/signup');
    }

    var newUser = new User({
      username: username,
      password: password
    });
    newUser.save(next);
  });
}, passport.authenticate("local", {
  successRedirect: '/',
  failureRedirect: '/signup',
  failureFlash: true
}));

router.get('/users/:username', function(req, res, next) {
  User.findOne({ username: req.params.username }, function(err, user) {
    if (err) { return next(err); }
    if(!user) { return next(404); }
    res.render('profile', { user: user });
  });
});
*/

module.exports = router;

