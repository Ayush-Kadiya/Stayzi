const mongoose = require('mongoose');
const IniData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/AirBnB";

main()
    .then(() => {
        console.log("Connected to MongoDB successfully!");
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
    });
async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});
    await Listing.insertMany(IniData.data);
    console.log("Data was inserted");
}

initDB();