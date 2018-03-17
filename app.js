var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var Comment = require("./models/comment");
var Campground = require("./models/campground");
var seedDB = require("./seeds.js");
var passport = require("passport");
var User = require("./models/User");
var LocalStrategy = require("passport-local");
var commentRoutes = require("./routes/comments");
var campgroundRoutes = require("./routes/campgrounds");
var authRoutes = require("./routes/auth");
var methodOverride = require("method-override");
var flash = require("connect-flash");
app.locals.moment = require('moment');


app.use(methodOverride("_method"));


//seedDB();

//mongoose.connect("mongodb://localhost/yelp_camp");
//mongodb://test:test123@ds259768.mlab.com:59768/yelp_camp

mongoose.connect(process.env.DATABASEURL);


app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine","ejs");

app.use("/bootstrap",express.static("lib/bootstrap/"));

app.use(express.static(__dirname+"/public"));

//----Passport----
app.use(require("express-session")({
	secret: "Once again Rusty wins cutest dog",
	resave: false,
	saveUninitalized: false
}))
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use(flash());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

app.use(authRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds", campgroundRoutes);




app.listen(process.env.PORT,process.env.IP, function(){
	console.log("Server Started!!");
})


// app.listen(3000, function(){
// 	console.log("Server Started!!");
// })