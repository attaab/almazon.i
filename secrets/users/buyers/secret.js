module.exports = {
	auth: {
		user: "tareksleem71@gmail.com",
		pass: "kolokedb"
	},
	facebook: {
		clientID: "1578048005603298",
		clientSecret: "71a0927144e6cc69dae7f954fc18212b",
		profileFields: ["email", "displayName", "id"],
		callbackURL: "http://localhost:3000/buyer/sign/facebook/callback",
		passReqToCallback: true,
	}
}
