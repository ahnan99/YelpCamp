var express = require("express");
var router = express.Router();
var User = require("../models/User");
var passport = require("passport");



router.get("/", function(req,res){
	res.render("landing");
})


router.get("/register", function(req,res){

	res.render("register", {page: 'register'});

})

router.post("/register", function(req,res){

	var newUser = new User({username:req.body.username});
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			return res.render("register", {error: err.message});
		}

			passport.authenticate("local")(req,res,function(){
				req.flash("success", "Welcome to YelpCamp "+ user.username);
				res.redirect("/campgrounds");
		});
	});

})

router.get("/login", function(req, res){
	res.render("login", {page: 'login'});
});


//log out 

router.get("/logout", function(req,res){
	req.logout();
	req.flash("success", "Logged you out!")
	res.redirect("/campgrounds");

});

router.post("/login", passport.authenticate("local", {
	successRedirect:"/campgrounds",
	failureRedirect: "/login"
}),function(req,res){

});


module.exports = router;