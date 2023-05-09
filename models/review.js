const mongoose = require('mongoose');
const Schema = mongoose.Schema; //for the use when define type of reviews
const reviewSchema = new Schema({
    body: String,
    rating: Number,
    author:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})
module.exports=mongoose.model("Review", reviewSchema);