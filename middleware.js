const { CampgroundSchema, reviewSchema } = require('./schemas.js');
const ExpressError=require('./utils/ExpressError');
const Campground= require('./models/campground');
const Review = require('./models/review');

module.exports.isLoggedIn = (req,res,next)=>{ //when we export so that we can use it in any other place
    //console.log("REQ.USER...", req.user); //will fill in with dserialize with the session
    if(!req.isAuthenticated()){
        // store the url they are requesting
        // console.log(req.path, req.originalUrl);
        req.session.returnTo= req.originalUrl;
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    } 
    next();
};


module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

module.exports.validateCampground = (req, res, next) => {
    const { error } = CampgroundSchema.validate(req.body);
    console.log(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

// VERY AUTHOR
module.exports.isAuthor= async(req, res, next) =>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)){
        req.flash('error', 'you do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.isReviewAuthor= async(req, res, next) =>{
    const {id,reviewId} = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)){
        req.flash('error', 'you do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.validateReview = (req,res, next)=>{
    const {error}= reviewSchema.validate(req.body);
    if(error){
        const msg= error.details.map(el=>el.message).join(',') 
        throw new ExpressError(msg,400)
    }else{
        next();
    }
}