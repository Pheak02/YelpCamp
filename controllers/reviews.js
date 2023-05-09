const Campground=require('../models/campground');
const Review = require('../models/review');
module.exports.createReview= async(req,res)=>{
    //res.send('YOU MADE IT!! ')
    const campground= await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author=req.user._id;
    campground.reviews.push(review); //it's null
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!!!')
    res.redirect(`/campgrounds/${campground._id}`);
}
module.exports.deleteReviews=async(req,res)=>{
    const {id,reviewId}=req.params;
    // req.params.reviewID
    await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}}) //pull operator pull from the reviews array of reviewID
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/campgrounds/${id}`);

}