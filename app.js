if(process.env.NODE_ENV !=="production"){
    require('dotenv').config();
}
// require('dotenv').config();

const express=require('express');
const path=require('path');
const mongoose = require('mongoose');
const ejsMate=require('ejs-mate');

const flash= require('connect-flash');
const ExpressError= require('./utils/ExpressError');
const methodOverride=require('method-override');

const passport=require('passport');
const LocalStrategy= require('passport-local');
const User=require('./models/user');
const helmet=require('helmet');

const mongoSanitize = require('express-mongo-sanitize');

const userRoutes = require('./routes/users')
const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');





// mongoose.connect('mongodb://localhost:27017/yelp-camp'); - NOT WORK IN MY MACHINE
// mongoose.connect('mongodb://127.0.0.1/yelp-camp',{ // - WORK IN MY MACHINE
//     useFindAndModify: false 
// })

// CONNECTION TO DB
//'mongodb://127.0.0.1/yelp-camp'


const session= require('express-session');
const MongoStore = require('connect-mongo');
const dbUrl='mongodb://127.0.0.1/yelp-camp';


mongoose.connect(dbUrl
    ); 

const db= mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", ()=>{
    console.log("Database Connected");
})

const app=express();

// CONFIGURATION FOR APP
app.engine('ejs',ejsMate)
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'))

// MIDDLEWARE
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize())
// app.use(express.urlencoded({extended: true}))


const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60, //limiting period of time, do update onces every 24hr only
    crypto: {
        secret: 'thisisabettersecret!'
    }
});
store.on("error", function(e){
    console.log("SESSION STORE ERROR",e)
})

// SESSION STUFF
const sessionConfig={
    store,
    name: 'session',
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie:{
        httpOnlyy: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //configure how many milisecond is in a week, 
                                                    //60sec in 1 mn, 60 mn in 1 hr, 24 hr in a day, 7 days in a week
                                                    //in milisecond
        maxAge: 1000 * 60 * 60 * 24 * 7 
        //which will expired a week from now
    }
}
app.use(session(sessionConfig))
app.use(flash());
app.use(helmet({contentSecurityPolicy:false}))

app.use(passport.initialize());
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req,res,next)=>{
    console.log(req.query);
    res.locals.currentUser=req.user; //for HIDE or SHOW REGISTER, LOGIN, OR LOGOUT
    res.locals.success= req.flash('success');
    res.locals.error= req.flash('error');
    next();
})


app.get('/fakeUser', async(req,res)=>{
    const user = new User({email: 'pheak@gmail.com', username: 'pheak'})
    const newUser=await User.register(user,'chicken');
    res.send(newUser);
})


app.use('/',userRoutes);
app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes)

app.get('/',(req,res)=>{
    // res.send('HELLO FROM YELP CAMP!')
    res.render('home');
})
// app.get('/makecampground',async (req,res)=>{
//     const camp= new Campground({title: 'My Backyard', description: 'cheap camping!'});
//     await camp.save();
//     res.send(camp)
// })
//FOR REVIEWS

//campID is ID of campground, id is ID of reviews
// FOR EVERY SINGLE REQUEST
app.all('*',(req,res,next)=>{
    next(new ExpressError('Page Not Found',404))
})

app.use((err,req,res,next)=>{
    const{statusCode=500}=err;
    if(!err.message) err.message= 'Oh No, sth Went Wrong!'
    res.status(statusCode).render('error',{err});
    //res.send('Oh boy, sth went wrong')

})

// app.listen(3000,()=>{
//     console.log('Serving on port 3000')
// })
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})