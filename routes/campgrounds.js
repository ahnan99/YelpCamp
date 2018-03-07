var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: 'AIzaSyDu51s_qPqh6AEsmE8YAGZ6M8qJ55XZErw',
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

router.get("/", function(req,res){

	var campgrounds = Campground.find({},function(err,cgs){
		if(err)
			console.log(err);
		else
			res.render("campgrounds/index",{campgrounds: cgs, page:'campgrounds'});
	});

	
});



router.get("/new", middleware.isLoggedIn, function(req,res){
	
	res.render("campgrounds/new");
})




router.post("/", middleware.isLoggedIn, function(req,res){
	//get data from form and push to campgrounds
	//redirect back to campgrounds
	var name = req.body.name;
	var image = req.body.image;
	var description = req.body.description;
	var price = req.body.price;
	// geocoder.geocode(req.body.location, function (err, data) {
 //    if (err || !data.length) {
 //      req.flash('error', 'Invalid address');
 //      return res.redirect('back');
 //    }
 //    var lat = data[0].latitude;
 //    var lng = data[0].longitude;
 //    var location = data[0].formattedAddress;

    var lat = 0;
    var lng = 0;
    var location = "ab";
	var author = {
		id: req.user._id,
		username: req.user.username
	};
	var newcampground ={name: name, price: price,image: image, description: description, author: author, location: location, lat: lat, lng: lng};
	//create a new campground and save to db
	Campground.create(newcampground,function(err,cg){
		if(err)
			console.log(err);
		else
			res.redirect("/campgrounds");
	})


})
//})

router.get("/:id",function(req,res){
	var id = req.params.id;
	Campground.findById(id).populate("comments").exec(function(err,foundcg){
		if(err || !foundcg){
			req.flash('error', 'Sorry, that campground does not exist!');
			console.log(err);
		}
		else{
			res.render("campgrounds/show", {campground: foundcg});
		}
	});
	
});

//----edit-----

router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req,res){

		//is user logged in

			Campground.findById(req.params.id, function(err, foundCampground){

			if(err)
				console.log(err);
			else{
					res.render("campgrounds/edit", {campground: foundCampground});
				}
			})

})
//---update----

router.put("/:id", middleware.checkCampgroundOwnership, function(req,res){
	//geocoder.geocode(req.body.location, function (err, data) {
    // if (err || !data.length) {
    //   req.flash('error', 'Invalid address');
    //   return res.redirect('back');
    // }
    // var lat = data[0].latitude;
    // var lng = data[0].longitude;
    // var location = data[0].formattedAddress;
    var lat = 0;
    var lng = 0;
    var location = "ab";
    var newData = {name: req.body.name, image: req.body.image, description: req.body.description, price: req.body.price,location: location, lat: lat, lng: lng};
    Campground.findByIdAndUpdate(req.params.id, newData, function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
  });
//})


//--destroy---

router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndRemove(req.params.id, function(err){
		if(err)
			res.redirect("/campgrounds");
		else
			res.redirect("/campgrounds");

	})
})

module.exports = router;