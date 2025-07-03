const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const listingSchema = new Schema({
    title: { 
        type: String, 
    },

    description: String,
    
    image: {
        filename: {
            type: String,
        },
        url: {
            type: String,
            default: "https://images.unsplash.com/photo-1701500096456-28186c4a306d?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        }
    },
    
    
    price: {
        type: Number,
        
    },
    
    location: String,
    
    country: String,

    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
});

listingSchema.post('findOneAndDelete', async (listing) => {
    if (listing) {
        const Review = require('./review'); // Import the Review model
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
 }); 

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;