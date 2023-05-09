//return a func that accept a func & execute that func
module.exports=func=>{
    return (req, res, next)=>{
        func(req,res,next).catch(next) //pass it to next if ther's error
    }
}