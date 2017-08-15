var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require("express-session");
var flash = require("connect-flash");
var momnet = require("helper-moment");
var hbs = require("express-handlebars");
var handlebars = require("handlebars");
handlebars.registerHelper("moment", require("helper-moment"));
var expressValidator = require("express-validator");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var facebookStrategy = require("passport-facebook").Strategy;
var multer = require("multer");
var mongodb = require("mongodb");
var emailCheck = require("email-check");
var MongoStore = require("connect-mongo")(session);
var mongoose = require("mongoose");
mongoose.connect("mongodb://<almazon>:<alamzon1>@ds145183.mlab.com:45183/almazon");
var db = mongoose.connection;

var mongooseDelete = require("mongoose-delete");
var index = require('./routes/index');
var buyer = require('./routes/users/buyers/buyer');
var seller = require("./routes/users/sellers/seller");
require("./config/users/buyers/passport");
require("./config/users/sellers/passportS");
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine("hbs", hbs({defaultLayout: "layout", extname: "hbs"}));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// sesstion aqnd passport middleware
app.use(session({
  secret: "max",
   saveUninitialized: true,
    resave: true,
    store: new MongoStore({mongooseConnection: mongoose.connection}),
    cookie: {maxAge: 10*24*60*60*1000}
  }));
app.use(passport.initialize());
app.use(passport.session());
//express validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));
// start cookie parser middleware
app.use(cookieParser());
// static folders
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, "uploads/users")));
app.use(express.static(path.join(__dirname, "uploads/products")));
app.use(function (req, res, next) {
  if (req.isAuthenticated() && req.user.role === "buyer") {
    res.locals.buyerLogged = req.isAuthenticated();
  }
  if (req.isAuthenticated() && req.user.role === "seller") {
    res.locals.sellerLogged = req.isAuthenticated();
  }
  next();
});
// flash middleware
app.use(flash());
app.use(function (req, res, next) {
	res.locals.message = require("express-messages")(req, res);
	next();
});
app.use('/', index);
app.use('/buyer', buyer);
app.use("/seller", seller);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
