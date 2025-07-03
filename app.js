const express = require('express');
const app = express();
const mongoose = require('mongoose');   

const Listing = require('./models/listing.js');
const path = require('path');
const methodOverride = require('method-override');
const wrapAsync = require("./utils/wrapasync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema , reviewSchema } = require('./schema.js');
const Review = require('./models/review.js');

const ejsMate = require('ejs-mate');

const MONGO_URL = 'mongodb://127.0.0.1:27017/AirBnB';


main()
    .then(() => {
        console.log('Connected to MongoDB successfully!');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    })
async function main() {
    await mongoose.connect(MONGO_URL);  
}



app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public')));


// --------------  Home Route ----------------
app.get('/', (req, res) => {
    res.send('Hello! , I am Root');
});

const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body); // Validate the request body against the schema
        if(error) {
            let errMsg = error.details.map((el) => el.message).join(', ');
            throw new ExpressError(400, errMsg); 
        }else{
            next(); // If validation passes, proceed to the next middleware
        }
}

const validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body); // Validate the request body against the schema
        if(error) {
            let errMsg = error.details.map((el) => el.message).join(', ');
            throw new ExpressError(400, errMsg); 
        }else{
            next(); // If validation passes, proceed to the next middleware
        }
}

// --------------  NEW CreAte Listing Route ----------------
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

// --------------  InDex Route ----------------
app.get("/listings", wrapAsync (async (req,res) => {
    const allListing = await Listing.find({});
    res.render("listings/index.ejs", {allListing});
}));

// --------------  Edit Listing Route ----------------
app.get("/listings/:id/edit", wrapAsync (async (req, res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}));

// --------------  Update Listing Route ----------------
app.put("/listings/:id",validateListing, wrapAsync (async (req, res) => {
    
    let {id} =  req.params;
    await Listing.findByIdAndUpdate( id , {...req.body.listing});
    res.redirect(`/listings/${id}`);
}));

// --------------  Delete Listing Route ----------------
app.delete("/listings/:id", wrapAsync (async (req, res) => {
    const {id} = req.params;
    const DeletedListings = await Listing.findByIdAndDelete(id);
    console.log(DeletedListings);
    res.redirect("/listings");
}));

// --------------  ShOW Route ----------------
app.get("/listings/:id",wrapAsync (async (req,res)=>{
    const {id} = req.params;
    const listing = await Listing.findById(id).populate('reviews');
    res.render("listings/show.ejs", {listing});
}));

// --------------  Create Listing Route ----------------
app.post("/listings", validateListing,
    wrapAsync (async (req, res, next) => {
        
        //  let {title, description, image, price, location, country} = req.body;
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
    })
);

// --------------  Reviews Route ----------------
app.post("/listings/:id/reviews", validateReview, wrapAsync( async (req, res) => {
    let listing = await Listing.findById(req.params.id)
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
}));

// --------------  Delete review rout  ----------------
app.delete("/listings/:id/reviews/:reviewId", wrapAsync( async (req, res) => {
    const {id, reviewId} = req.params;

    // Trim whitespace from reviewId to prevent CastError
    const trimmedReviewId = reviewId.trim();

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: trimmedReviewId } });
    await Review.findByIdAndDelete(trimmedReviewId);

    res.redirect(`/listings/${id}`);
    console.log("Review Deleted Successfully");
}));

// --------------  Error Handling ----------------
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    // Use error.ejs for styled error display
    res.status(statusCode).render("error.ejs", { err: { message } });
});

app.listen(8000, () => {
    console.log('Server is running on port 8000');
});
