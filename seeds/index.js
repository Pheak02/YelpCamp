const mongoose = require('mongoose');
const cities= require('./cities')
const {places,descriptors}=require('./seedHelpers');
const Campground=require('../models/campground'); // one '.' means back out

// mongoose.connect('mongodb://localhost:27017/yelp-camp'); - NOT WORK IN MY MACHINE
// mongoose.connect('mongodb://127.0.0.1/yelp-camp',{// - WORK IN MY MACHINE
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useUnifiedTopology: true
// }) ;
mongoose.connect('mongodb://127.0.0.1/yelp-camp') ;

const db= mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", ()=>{
    console.log("Database Connected");
});



const sample=array=> array[Math.floor(Math.random()*array.length)]; //to return array & element from the array

const seedDB=async () =>{
    //delete previous dbs
    await Campground.deleteMany({});
    // const c= new Campground({title: 'purple field'});
    // await c.save();
    for(let i=0; i<200; i++){
        const random1000= Math.floor(Math.random()*1000);
        const price= Math.floor(Math.random()*20)+10;
        const camp=new Campground({
          // YOUR USER ID
            author: '6443c9c789fc60fc69e1fc01',
            location: `${cities[random1000].city},${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            // image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque, sequi. Earum molestias, quod modi nobis ad ab eaque beatae dolorum provident veniam corrupti reiciendis, est quisquam quis ipsum, quia explicabo!',
            price,
            geometry: {
              type: "Point",
              coordinates: [
                cities[random1000].longitude,
                cities[random1000].latitude
            ]
          },
            images: [
                {
                  url: 'https://res.cloudinary.com/dbuzmmqyh/image/upload/v1682666754/YelpCamp/el5tp3t089urpxaqqy1g.jpg',
                  filename: 'YelpCamp/el5tp3t089urpxaqqy1g'
                },
                {
                  url: 'https://res.cloudinary.com/dbuzmmqyh/image/upload/v1682666754/YelpCamp/ck3w18om5vp0t7j1uraz.jpg',
                  filename: 'YelpCamp/ck3w18om5vp0t7j1uraz'
                }
              ]
        })
        await camp.save();
        
    }
}
seedDB().then(() => {
  mongoose.connection.close();
})
