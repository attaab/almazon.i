var express = require('express');
var router = express.Router();
var passport = require("passport");
var Buyer = require("../models/users/buyers/buyer");
var Seller = require("../models/users/sellers/seller");
var Product = require("../models/products/product");
var mongodb = require("mongodb");
/* GET home page. */

function genrating(req, res, next) {
	Product.find().sort("-productDate").limit(40).exec(function (err, products) {
		if (err) {
			console.log(err);
		}
		Product.count().exec(function (err, count) {
			if (err) {
				console.log(err);
			}
			var random = Math.floor(Math.random() * count);
			Product.find().skip(random).limit(4).exec(function (err, product1) {
				if (err) {
					console.log(err);
				}
				Product.count().exec(function (err, count) {
					if (err) {
						console.log(err);
					}
					var random = Math.floor(Math.random() * count);
					Product.find().skip(random).limit(4).exec(function (err, product2) {
						if (err) {
							console.log(err);
						}
						Product.count().exec(function (err, count) {
							if (err) {
								console.log(err);
							}
							var random = Math.floor(Math.random() * count);
							Product.find().skip(random).limit(4).exec(function (err, product3) {
								if (err) {
									console.log(err);
								}
								Product.count().exec(function (err, count) {
									if (err) {
										console.log(err);
									}
									var random = Math.floor(Math.random() * count);
									Product.find().skip(random).limit(4).exec(function (err, product4) {
										if (err) {
											console.log(err);
										}
										var user = req.user;
										if (req.session.cookie.originalMaxAge !== null) {
											res.render('homepage', { title: 'Express', user: user, products: products, product1: product1, product2: product2, product3: product3, product4: product4});
										} else {
											res.render('homepage', { title: 'الصفحة الرئيسية', user: user, products: products, product1: product1, product2: product2, product3: product3, product4: product4});
										}
									});
								});	
							});
						});
					});
				});	
				
			});
		});
 	});
}
router.get('/', genrating, function(req, res, next) {
	// looping for latest products
});
// start rout for display the page of product
router.get("/product/:id", function (req, res, next) {
	res.render("product", {
		title: "product"
	});
});
module.exports = router;

