var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);



router.get("/", function(req,res){
  var noMatch;
  if(req.query.search){
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    var campgrounds = Campground.find({name: regex},function(err,cgs){
          if(err)
            console.log(err);
          else{
            
            if(cgs.length < 1){
              noMatch = "No reults.";
            }
            res.render("campgrounds/index",{campgrounds: cgs, page:'campgrounds', noMatch: noMatch});
          }
        });


  }else{
      var campgrounds = Campground.find({},function(err,cgs){
      if(err)
        console.log(err);
      else
        res.render("campgrounds/index",{campgrounds: cgs, page:'campgrounds', noMatch: noMatch});
    });
  }

	

	
});



router.get("/new", middleware.isLoggedIn, function(req,res){
	
	res.render("campgrounds/new");
})




//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
  // get data from form and add to campgrounds array
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var author = {
      id: req.user._id,
      username: req.user.username
  }
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newCampground = {name: name, image: image, description: desc, author:author, location: location, lat: lat, lng: lng};
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            console.log(newlyCreated);
            res.redirect("/campgrounds");
        }
    });
  });
});

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

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newData = {name: req.body.campground.name, image: req.body.campground.image, description: req.body.campground.description, price: req.body.campground.price, location: location, lat: lat, lng: lng};

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
});


//--destroy---

router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndRemove(req.params.id, function(err){
		if(err)
			res.redirect("/campgrounds");
		else
			res.redirect("/campgrounds");

	})
})

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;