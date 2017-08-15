var passport = require("passport");
var express = require("express");
var emailCheck = require("email-check");
var nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");
var async = require("async");
var crypto = require("crypto");
var path = require('path');
var formidable = require("formidable");
var fs = require("fs");
var Seller = require("../../../models/users/sellers/seller");
var Buyer = require("../../../models/users/buyers/buyer");
var secrets = require("../../../secrets/users/sellers/secret");
var Product = require("../../../models/products/product");
var router = express.Router();
var multer = require("multer");
// all functions
// login seller validation form
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
		res.render("users/sellers/login", {
			errors: errors
		});
	} else {
		next();
	}
}
function completeValidation(req, res ,next) {
	var email = req.body.email;
	var password = req.body.password;
	req.checkBody("companyname", "يجب دخال اسم الشركة").notEmpty();
	req.checkBody("sellerId", "من فضلك أدخل كلمة المرور").notEmpty();
	req.checkBody("sellerId", "أرقام فقط").isInt();
	req.checkBody("sellerId", "كلمة المرور يجب أن تحتوي على خمسة احرف على الأقل").isLength({min:14, max:14});
	var errors = req.validationErrors();
	if (errors) {
		if (req.file) {
			fs.unlink(req.file.path, function (err) {
				if (err) {
				console.log(err);
				}
			});
		}
		//end
		//res.redirect("/seller/compete");
		res.render("users/sellers/completeSign", {
			errors: errors
		});
	} else {
		next();
	}
}
// functions for authentication
function isloggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	} else {
		res.redirect("/");
	}
}
 function LoggedIn(req, res, next) {
	if (req.isAuthenticated() && req.user.role == "seller") {
		return next();
	} else {
		res.redirect("/");
	}
}
function isnotLoggedIn(req, res, next) {
	if (!req.isAuthenticated()) {
		return next();
	}
	res.redirect("/");
}
function checkSeller(req, res, next) {
	Seller.findOne({"email": req.body.email}, function (err, user) {
		if (err) {
			throw err;
		}
		if (user) {
			if (user.role !== "seller") {
				req.flash("error", "الإيميل غير موجود");
				res.redirect("/seller/login");
			} else {
				next();
			}
		}
	});
}
function sellerCheck(req, res,  next) {
	Seller.findOne({"role": req.user.role}, function (err, user) {
		if (err) {
			throw err;
		}
		if (user && user.role === "seller") {
			res.redirect("/");
		} else {
			next();
		}
	});
}
// end functions of authentication
// end functions
// start routing
// router for get becum a buyer page
router.get("/complete", isloggedIn, sellerCheck, function (req, res, next) {
	"use strict";
	var errors = req.flash("error");
	res.render("users/sellers/completeSign", {errors: errors, hasErrors: errors.length, title: "صبح بائع"});
});
// module for multer middleware for seller upload images
var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "uploads/users/sellers");
	},
	filename: function (req, file, cb) {
		cb(null, req.user.username + "-" + Date.now() + ".jpg");
	}
});
var upload = multer({
	storage: storage,
	 limits: {filesie: 100*100}
	});

// router for post becum a buyer
router.post("/complete", isloggedIn, upload.single("sellerimg"), completeValidation, function (req, res, next) {
	var newUser = new Seller();
	newUser.email = req.user.email;
	newUser.username = req.user.username;
	newUser.password = req.user.password;
	newUser.confirmpassword = req.user.confirmpassword;
	newUser.companyname = req.body.companyname;
	newUser.profileimage = req.user.profileimage;
	newUser.sellerId = req.body.sellerId;
	newUser.sellerimg = req.file.filename;
	newUser.role = "seller";
	newUser.save(function (err) {
		if (err) {
			console.log(err);
		} else {
			Buyer.findOne({"email": req.user.email}, function (err, user) {
				if (err) {
					console.log(err);
				}
				if (user) {
					user.remove(function (err) {
						if (err) {
							console.log(err);
						}
						req.flash("success", "يمكنك الأن تسجل الدخول");
						res.redirect("/seller/login");
					});
				}
			}); 
		}
	});
});

// router of seller profile page
router.get("/profile", LoggedIn, function (req, res, next) {
	var user = req.user;
	var cuser = req.session;
	var error = req.flash("error");
	var success = req.flash("success");
	// loop the products that published with the seller
	Product.find({"productPuplisher": req.user.username}).sort("-productDate").exec(function (err, product) {
		if (err) {
			console.log(err);
		}
		res.render("users/sellers/profile", {user: user, cuser: cuser, title: user.username, error: error, hasErrors: error.length, success: success, hasSuccess: success.length, product: product});
	});
});
// router for loguot seller
router.get("/logout", LoggedIn, function (req, res, next) {
	req.logout();
	req.session.destroy();
	res.redirect("/");
});
//router for post a new product
// multer for upload product image
var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "uploads/products");
	},
	filename: function (req, file, cb) {
		cb(null, req.body.productTitle + "-" + Date.now() + ".jpg");
	}
});
var upload = multer({
	storage: storage,
	 limits: {filesie: 100*100}
	});
router.get("/post", LoggedIn, function (req, res, next) {
	req.flash("error", "لم يتم نشر المنتج");
	res.redirect("/seller/profile");
});
router.post("/post", LoggedIn, upload.single("productImage"), function (req, res, next) {
		var newProduct = new Product();
		newProduct.productTitle = req.body.productTitle;
		newProduct.productDescription = req.body.productDescription;
		newProduct.productPuplisher = req.user.username;
		newProduct.productCategoryName = req.body.productCategoryName;
		newProduct.productImage = req.file.filename;
		newProduct.productDate = new Date();
		newProduct.productPrice = req.body.productPrice;
		newProduct.productCount = 0;
		newProduct.save(function (err, product) {
			if (err) {
				console.log(err);
				fs.unlink(req.file.path, function (err) {
					if (err) {
						throw err;
					}
				});
				req.flash("error", err);
				res.redirect("/seller/profile");
			}
			console.log(product);
			req.flash("success", "تم نشر المنتج بنجاح");
			res.redirect("/seller/profile");
		});
});
//routes for edit a product
//router for get edit a product
// multer for upload product image
var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "uploads/products");
	},
	filename: function (req, file, cb) {
		cb(null, req.body.productTitle + "-" + Date.now() + ".jpg");
	}
});
var upload = multer({
	storage: storage,
	 limits: {filesie: 100*100}
	});
router.post("/product/edit/:id", LoggedIn, upload.single("productImage"), function (req, res, next) {
	Product.findById(req.params.id, function (err, product) {
		if (err) {
			console.log(err);
		} else {
			var product = product;
			product.productTitle = req.body.productTitle;
			product.productDescription = req.body.productDescription;
			product.productPrice = req.body.productPrice;
			product.productPuplisher = req.user.username;
			product.productCategoryName = req.body.productCategoryName;
			if (req.file) {
				product.productImage = req.file.filename;
			} else {
				product.productImage = product.productImage;
			}
			product.save(function (err) {
				if (err) {
					console.log(err);
				} else {
					req.flash("success", "تم تعديل المنتج بنجاح");
					res.redirect("/seller/profile");
				}
			});
		}
	});
});
// end routes for edit the product
// router for delete the product
router.post("/product/delete/:id", function (req, res, next) {
	Product.findById(req.params.id, function (err, product) {
		if (err) {
			console.log(err);
		} else {
			product.remove(function (err) {
				if (err) {
					console.log(err);
				} else {
					req.flash("success", "تم حذف المنتج بنجاح");
					res.redirect("/seller/profile");
				}
			});
		}
	});
});
//end router for delete the product
// middleware to prevent selelr to access to sign pages
router.use("/", isnotLoggedIn, function (req, res, next) {
	next();
});
// router for get login page
router.get("/login", function (req, res, next) {
	var error = req.flash("error");
	var success = req.flash("success");
	res.render("users/sellers/login", {error: error, hasErrors: error.length, title: "تسجيل الدخول", success: success, hasSuccess: success.length});
});
//router for login post route for seller
router.post("/login", loginValidation, passport.authenticate("local-s.login", {
	failureRedirect: "/seller/login",
	failureFlash: true
}), function (req, res) {
	if (req.body.rememberme) {
		req.session.cookie.maxAge = 10*24*60*60*1000;
	} else {
		req.session.cookie.expires = null;
	}
	req.flash("success", "أهلا " + req.user.username);
	res.redirect("/");
});
router.get("/sign/facebook", passport.authenticate("facebook", {scope: "email"}));
router.get("/sign/facebook/callback", passport.authenticate("facebook", {
	successRedirect: "/",
	failureRedirect: "/seller/signup",
	failureFlash: true
}));
// router for get forgot password of user
router.get("/forgot", function (req, res) {
	var info = req.flash("info");
	var errors = req.flash("error");
	res.render("users/sellers/forgot", {info: info, hasInfo: info.length, errors: errors, hasErrors: errors.length});
});
// router for post the forgot password form
router.post("/forgot", function (req, res, next) {
	async.waterfall([
			function (callback) {
				crypto.randomBytes(20, function (err, buf) {
					var random = buf.toString("hex");
					callback(err, random);
				});
			},
			function (random, callback) {
				Seller.findOne({"email": req.body.email}, function (err, user) {
					if (err) {
						throw err;
					}
					if (!user) {
						req.flash("error", "الإيميل غير موجود");
						return res.redirect("/seller/forgot");
					} if (user) {
						if (user.role !== "seller") {
							req.flash("error", "الإيميل غير موجود");
							res.redirect("/seller/forgot");
						} else {
							user.passwordResetToken = random;
							user.passwordResetExpires = Date.now() + 30*60*1000;
							user.save(function (err) {
							if (err) {
							throw err;
							}
							callback(err, random, user);
							});
						}
					}
					
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
					text: "لقد طلبت الأن تغيير كلمة المرور الخاصة بك من فضلك اضغط على الرابط التالي حتى يتم تحويلك لصفحة تغيير كلمة المرور الخاصة بك وإذا لم تكن طلبت ذلك فأخبرنا حتى يتم تأمين حسابك" + "\n\n" + "http://localhost:3000/seller/reset/" + random + "\n\n"
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
			res.redirect("/seller/forgot");
		});
});
// router for reset password
router.get("/reset/:token", function (req, res) {
	Seller.findOne({"passwordResetToken": req.params.token, "passwordResetExpires": {$gt: Date.now()}}, function (err, user) {
		if (err) {
			throw err;
		}
		if (!user) {
			req.flash("error", "للأسف المدة انتهت أو الرابط غير صحيح من فضلك أعد ادخال الإيميل ثانية");
			return res.redirect("/seller/forgot");
		}
		var errors = req.flash("error");
		res.render("users/sellers/reset", {title: "تعيين كلمة السر", errors: errors, hasErrors: errors.length});
	});
});
router.post("/reset/:token", function (req,  res,  next) {
	async.waterfall([
			function (callback) {
				Seller.findOne({passwordResetToken: req.params.token, passwordResetExpires: {$gt: Date.now()}}, function (err, user) {
					if (err) {
						throw err;
					}
					if (!user) {
						req.flash("error", "للأسف المدة انتهت أو الرابط غير صحيح من فضلك أعد ادخال الإيميل ثانية");
						return res.redirect("/seller/forgot");		
					}
					req.checkBody("password", "كلمة السر مطلوبة").notEmpty();
				req.checkBody("password", "كلمة السر لا يمكن أن تكون أقل من خمسة أحرف").isLength({min: 5});
				req.checkBody("confirmpassword", "كلمتى المرور غير متطابقتان").equals(req.body.password);
				req.checkBody("password", "يجب أن تحتوي كلمة المرور على رقم واحد على الأقل").matches(/^(?=.*\d)(?=.*[a-z])[0-9a-z]{5,}$/, "i");
				var errors = req.validationErrors();
				if (errors) {
					return res.render("users/sellers/reset", {errors: errors});
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
					text: "تم إعادة تعيين كلمة السر بنجاح يمكنك الأن تسجيل الدخول من خلال هذا الرابط\n\n" + "http:localhost:3000/seller/login" + "\n\n"
				};
				smtpTransport.sendMail(mailOptions, function (err, response) {
					if (err) {
						throw err;
					}
					callback(err, user);
					var success = req.flash("success");
					var errors = req.flash("error");
					res.render("users/sellers/reset", {title: "تعيين كلمة السر", errors: errors, hasErrors: errors.length, success: success, hasSuccess: success.length});
				});
			}
		]);
});
//end

module.exports = router;