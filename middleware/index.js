//all middleware
var middlewareObj = {};
var Campground = require("../models/campground");
var Comment = require("../models/comment");

middlewareObj.checkCampgroundOwnership = function(req, res, next){
	if(req.isAuthenticated())
		{
			//does user own the camp
			Campground.findById(req.params.id, function(err, foundCampground){
			if(err || !foundCampground){
				req.flash("error", "Campground not found");
				res.redirect("back");
			}
			else{
				if(foundCampground.author.id.equals(req.user.id) || req.user.isAdmin)
					next();
				else{
						req.flash("error", "You don't have permission to do that. ")
						res.redirect("back");
					}
				}
			})
		}else{
			req.flash("error", "You need to be logged in to do that!");
			res.redirect("back");
		}

};

middlewareObj.isLoggedIn = function(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}else{
		req.flash("error", "You need to be logged in to do that!")
		res.redirect("/login");
	}
}

middlewareObj.checkCommentOwnership = function(req, res, next){
	if(req.isAuthenticated()){

		Comment.findById(req.params.comment_id, function(err, foundComment){
			if(err || !foundComment)
				res.redirect("back");
			else{
				if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
					
					next();
				}else{
					req.flash("error", "You don't have permission to do that!")
					res.redirect("back");
				}
			}
		})

	}else{
		req.flash("error", "You need to be logged in to do that!")
		res.redirect("back");
	}

}


module.exports = middlewareObj;