var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var facebookStrategy = require("passport-facebook").Strategy;
var Seller = require("../../../models/users/sellers/seller");
var Buyer = require("../../../models/users/buyers/buyer");
var secrets = require("../../../secrets/users/sellers/secret");
// start config of signup passport
passport.serializeUser(function (user, done) {
	"use strict";
	done(null, user.id);
});
passport.deserializeUser(function (id, done) {
	"use strict";
	Seller.findById(id, function (err, user) {
		done(err, user);
	});
});
/*passport.use("local.complete", new LocalStrategy({
	usernameField: "email",
	passwordField: "password",
	passReqToCallback: true
}, function (req, email, password, done) {
	Seller.findOne({"email": email}, function (err, user) {
		if (err) {
			return done(err);
		}
		if (user) {
			return done(null, false, {message: "الإيميل مستخدم بالفعل"});
		}
		newUser = new Seller();
		newUser.username = req.user.username;
		newUser.email = req.user.email;
		newUser.password = req.user.password;
		newUser.confirmpassword = req.user.confirmpassword;
		newUser.profileimage = req.user.profileimage;
		newUser.save(function (err, result) {
			if (err) {return done(err);}
			if (result) {
				return done(null, newUser);
			}
		
		});
	});
}));*/
// strat config of login passport-local
passport.serializeUser(function (user, done) {
	"use strict";
	done(null, user.id);
});
passport.deserializeUser(function (id, done) {
	"use strict";
	Seller.findById(id, function (err, user) {
		done(err, user);
	});
});
passport.use("local-s.login", new LocalStrategy({
	usernameField: "email",
	passwordField: "password",
	passReqToCallback: true
}, function (req, email, password, done) {
	"use strict";
	Seller.findOne({"email": email}, function (err, user) {
		if (err) {
			return done(err);
		}
		if (!user || !user.validPassword(password) || user.role !== "seller") {
			return done(null, false, {message: "خطأ في كلمة المرور أو اسم المستخدم"});
		}
		return done(null, user);
	});
}));
// start strategy for sign with facebook
passport.use("facebook", new facebookStrategy(secrets.facebook, function (req, token, refreshToken, profile, done) {
	Seller.findOne({facebook: profile.id}, function (err, user) {
		if (err) {
			return done(err);
		}
		if (user) {
			return done(null, user);
		} else {
			var newUser = new Seller();
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