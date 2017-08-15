var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var facebookStrategy = require("passport-facebook").Strategy;
var Buyer = require("../../../models/users/buyers/buyer");
var secrets = require("../../../secrets/users/buyers/secret");
// start config of signup passport
passport.serializeUser(function (user, done) {
	"use strict";
	done(null, user.id);
});
passport.deserializeUser(function (id, done) {
	"use strict";
	Buyer.findById(id, function (err, user) {
		done(err, user);
	});
});
passport.use("local.singup", new LocalStrategy({
	usernameField: "email",
	passwordField: "password",
	passReqToCallback: true
}, function (req, email, password, done) {
	Buyer.findOne({"email": email}, function (err, user) {
		if (err) {
			return done(err);
		}
		if (user) {
			return done(null, false, {message: "الإيميل مستخدم بالفعل"});
		}
		newUser = new Buyer();
		newUser.username = req.body.username;
		newUser.email = req.body.email;
		newUser.password = newUser.encryptPassword(req.body.password);
		newUser.confirmpassword = newUser.encryptPassword(req.body.confirmpassword);
		newUser.profileimage = "default.png";
		newUser.role = "buyer";
		newUser.save(function (err, result) {
			if (err) {return done(err);}
			if (result) {
				return done(null, newUser);
			}
		});
	});
}));
// strat config of login passport-local
passport.serializeUser(function (user, done) {
	"use strict";
	done(null, user.id);
});
passport.deserializeUser(function (id, done) {
	"use strict";
	Buyer.findById(id, function (err, user) {
		done(err, user);
	});
});
passport.use("local.login", new LocalStrategy({
	usernameField: "email",
	passwordField: "password",
	passReqToCallback: true
}, function (req, email, password, done) {
	"use strict";
	Buyer.findOne({"email": email}, function (err, user) {
		if (err) {
			return done(err);
		}
		if (!user || !user.validPassword(password) || user.role !== "buyer") {
			return done(null, false, {message: "خطأ في كلمة المرور أو اسم المستخدم"});
		} else {
			return done(null, user);
		}
	});
}));
// start strategy for sign with facebook
passport.use("facebook", new facebookStrategy(secrets.facebook, function (req, token, refreshToken, profile, done) {
	Buyer.findOne({facebook: profile.id}, function (err, user) {
		if (err) {
			return done(err);
		}
		if (user) {
			return done(null, user);
		} else {
			var newUser = new Buyer();
			newUser.facebook = profile.id;
			newUser.username = profile.displayName;
			newUser.email = profile._json.email;
			newUser.password = profile._json.password;
			newUser.profileimage = "default.png";
			newUser.token.push({token: token});
			newUser.save(function (err) {
				if (err) {
					return done(err);
				}
				return done(null, newUser);
			});
		}
	});
}));