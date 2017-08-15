var passport = require("passport");
var express = require("express");
var emailCheck = require("email-check");
var nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");
var async = require("async");
var crypto = require("crypto");
var Buyer = require("../../../models/users/buyers/buyer");
var Seller = require("../../../models/users/sellers/seller");
var secrets = require("../../../secrets/users/buyers/secret");
var router = express.Router();
var multer = require("multer");
// functions of file
//fucntions for authentication
function loggedIn(req, res, next) {
	if (req.isAuthenticated() && req.user.role === "buyer") {
		return next();
	} else {
		res.redirect("/");
	}
		
}
function notLoggedIn(req, res, next) {
	if (!req.isAuthenticated()) {
		return next();
	} else {
		res.redirect("/");
	}
}
// end functions if authentication
// fucntion for check the user inside a buyer model
function checkBuyer(req, res, next) {
	Buyer.findOne({"email": req.body.email}, function (err, user) {
		if (err) {
			console.log(err);
		}
		if (user) {
			if (user.role !== "buyer") {
				req.flash("error", "الإيميل غير موجود");
				res.redirect("/buyer/login");
			} else {
				next();
			}
		}
	});
}
// singup validation form
function signupValidation(req, res ,next) {
	var username = req.body.username;
	var email = req.body.email;
	var password = req.body.password;
	var confirmpassword = req.body.confirmpassword;
	req.checkBody("username", "من فضلك أخدل اسم المستخدم").notEmpty();
	req.checkBody("email", "من فضلك أدخل الإيميل").notEmpty();
	req.checkBody("email", "الإيميل خطأ").isEmail();
	req.checkBody("password", "من فضلك أدخل كلمة المرور").notEmpty();
	req.checkBody("password", "كلمة المرور يجب أن تحتوي على خمسة احرف على الأقل").isLength({min:5});
	req.checkBody("confirmpassword", "من فضلك أدخل تأكيد كلمة المرور").notEmpty();
	req.checkBody("confirmpassword", "كلمتي المرور غير متطابقتان").equals(req.body.password);
	
	req.checkBody("password", "يجب أن تحتوي كلمة المرور على رقم واحد على الأقل").matches(/^(?=.*\d)(?=.*[a-z])[0-9a-z]{5,}$/, "i");
	var errors = req.validationErrors();
	if (errors) {
		res.render("users/buyers/signup", {
			errors: errors
		});
	} else {
		next();
	}
}
function loginValidation(req, res ,next) {
	var email = req.body.email;
	var password = req.body.password;
	req.checkBody("email", "من فضلك أدخل الإيميل").notEmpty();
	req.checkBody("email", "الإيميل خطأ").isEmail();
	req.checkBody("password", "من فضلك أدخل كلمة المرور").notEmpty();
	req.checkBody("password", "كلمة المرور يجب أن تحتوي على خمسة احرف على الأقل").isLength({min:5});
	req.checkBody("password", "يجب أن تحتوي كلمة المرور على رقم واحد على الأقل").matches(/^(?=.*\d)(?=.*[a-z])[0-9a-z]{5,}$/, "i");
	var errors = req.validationErrors();
	if (errors) {
		res.render("users/buyers/login", {
			errors: errors
		});
	} else {
		next();
	}
}

//end fucntions of buyer routes file

// router of buyer profile page
router.get("/profile", loggedIn, function (req, res, next) {
	var user = req.user;
	var cuser = req.session;
	res.render("users/buyers/profile", {user: user, cuser: cuser});
});
// router for loguot user
router.get("/logout", loggedIn, function (req, res, next) {
	req.logout();
	req.session.destroy();
	res.redirect("/");
});
// middleware to prevent user to access to sign pages
router.use("/", notLoggedIn, function (req, res, next) {
	next();
});
// router for get signup page
router.get("/signup", function (req, res, next) {
	"use strict";
	var error = req.flash("error");
	res.render("users/buyers/signup", {error: error, hasErrors: error.length, title: "تسجيل في الموقع"});
});

// module for multer middleware
var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "uploads");
	},
	filename: function (req, file, cb) {
		cb(null, file.fieldname + "-" + Date.now() + ".jpg");
	}
});
var upload = multer({storage: storage});

var div =  upload.single("profileimage");
// check if the email adress is exist or not
// router post fir signup
router.post("/signup", signupValidation, passport.authenticate("local.singup", {
	successRedirect: "/",
	failureRedirect: "/buyer/signup",
	failureFlash: true
}));
// router for login page
router.get("/login", function (req, res, next) {
	var error = req.flash("error");
	var success = req.flash("success");
	res.render("users/buyers/login", {error: error, hasErrors: error.length > 0, title: "تسجيل الدخول", success: success, hasSuccess: success.length});
});
//router for login post route
router.post("/login", loginValidation, passport.authenticate("local.login", {
	failureRedirect: "/buyer/login",
	failureFlash: true
}), function (req, res) {
	if (req.body.rememberme) {
		req.session.cookie.maxAge = 10*24*60*60*1000;
	} else {
		req.session.cookie.expires = null;
	}
	res.redirect("/");
});
router.get("/sign/facebook", passport.authenticate("facebook", {scope: "email"}));
router.get("/sign/facebook/callback", passport.authenticate("facebook", {
	successRedirect: "/",
	failureRedirect: "/buyer/signup",
	failureFlash: true
}));
// router for get forgot password of user
router.get("/forgot", function (req, res) {
	var info = req.flash("info");
	var errors = req.flash("error");
	res.render("users/buyers/forgot", {info: info, hasInfo: info.length, errors: errors, hasErrors: errors.length});
});
// router for post the forgot password form
router.post("/forgot", checkBuyer, function (req, res, next) {
	async.waterfall([
			function (callback) {
				crypto.randomBytes(20, function (err, buf) {
					var random = buf.toString("hex");
					callback(err, random);
				});
			},
			function (random, callback) {
				Buyer.findOne({"email": req.body.email}, function (err, user) {
					if (err) {
						throw err;
					}
					if (!user) {
						req.flash("error", "الإيميل غير موجود");
						return res.redirect("/buyer/forgot");
					}
					user.passwordResetToken = random;
					user.passwordResetExpires = Date.now() + 30*60*1000;
					user.save(function (err) {
						if (err) {
							throw err;
						}
						callback(err, random, user);
					});
				});
			},
			function (random, user, callback) {
				var smtpTransport = nodemailer.createTransport({
					service: "Gmail",
					host: "smtp.gmail.com",
					port: 465,
					secure: true,
					auth: {
						user: secrets.auth.user,
						pass: secrets.auth.pass
					}
				});
				var mailOptions = {
					from: "المازون",
					to: user.email,
					subject: "أهلا " + user.username + "\n",
					text: "لقد طلبت الأن تغيير كلمة المرور الخاصة بك من فضلك اضغط على الرابط التالي حتى يتم تحويلك لصفحة تغيير كلمة المرور الخاصة بك وإذا لم تكن طلبت ذلك فأخبرنا حتى يتم تأمين حسابك" + "\n\n" + "http://localhost:3000/buyer/reset/" + random + "\n\n"
				};
				smtpTransport.sendMail(mailOptions, function (err, response) {
					req.flash("info", "لقد تم ارسال رابط تغيير كلمة المرور إلى الإيميل الذي أدخلته من فضلك راجع البريد");
					return callback(err, user);
				});
			}
		], function (err) {
			if (err) {
				return next(err);
			}
			res.redirect("/buyer/forgot");
		});
});
// router for reset password
router.get("/reset/:token", function (req, res) {
	Buyer.findOne({"passwordResetToken": req.params.token, "passwordResetExpires": {$gt: Date.now()}}, function (err, user) {
		if (err) {
			throw err;
		}
		if (!user) {
			req.flash("error", "للأسف المدة انتهت أو الرابط غير صحيح من فضلك أعد ادخال الإيميل ثانية");
			return res.redirect("/buyer/forgot");
		}
		var errors = req.flash("error");
		res.render("users/buyers/reset", {title: "تعيين كلمة السر", errors: errors, hasErrors: errors.length});
	});
});
router.post("/reset/:token", function (req,  res,  next) {
	async.waterfall([
			function (callback) {
				Buyer.findOne({passwordResetToken: req.params.token, passwordResetExpires: {$gt: Date.now()}}, function (err, user) {
					if (err) {
						throw err;
					}
					if (!user) {
						req.flash("error", "للأسف المدة انتهت أو الرابط غير صحيح من فضلك أعد ادخال الإيميل ثانية");
						return res.redirect("/buyer/forgot");		
					}
					req.checkBody("password", "كلمة السر مطلوبة").notEmpty();
				req.checkBody("password", "كلمة السر لا يمكن أن تكون أقل من خمسة أحرف").isLength({min: 5});
				req.checkBody("confirmpassword", "كلمتى المرور غير متطابقتان").equals(req.body.password);
				req.checkBody("password", "يجب أن تحتوي كلمة المرور على رقم واحد على الأقل").matches(/^(?=.*\d)(?=.*[a-z])[0-9a-z]{5,}$/, "i");
				var errors = req.validationErrors();
				if (errors) {
					return res.render("users/buyers/reset", {errors: errors});
				}
				user.password = user.encryptPassword(req.body.password);
				user.confirmpassword = user.encryptPassword(req.body.confirmpassword);
				user.passwordResetToken = undefined;
				user.passwordResetExpires = undefined;
				user.save(function (err) {
					if (err) {
						throw err;
					}
					req.flash("success", "لقد تم تغيير كلمة السر بنجاح يمكنك الأن تسجيل الدخول");
					
					callback(err, user);
				});
				});
			},
			function (user, callback) {
				var smtpTransport = nodemailer.createTransport({
					service: "Gmail",
					host: "smtp.gmail.com",
					port: 465,
					secure: true,
					auth: {
						user: secrets.auth.user,
						pass: secrets.auth.pass
					}
				});
				var mailOptions = {
					to: user.email,
					from: "المازون",
					subject: "تغيير كلمة السر",
					text: "تم إعادة تعيين كلمة السر بنجاح يمكنك الأن تسجيل الدخول من خلال هذا الرابط\n\n" + "http:localhost:3000/buyer/login" + "\n\n"
				};
				smtpTransport.sendMail(mailOptions, function (err, response) {
					if (err) {
						throw err;
					}
					callback(err, user);
					var success = req.flash("success");
					var errors = req.flash("error");
					res.render("users/buyers/reset", {title: "تعيين كلمة السر", errors: errors, hasErrors: errors.length, success: success, hasSuccess: success.length});
				});
			}
		]);
});


module.exports = router;