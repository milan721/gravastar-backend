const mongoose = require("mongoose")
// Prefer bookstore-style env name for local dev, with fallbacks
const connectionString = process.env.DATABASE || process.env.DBSTRING || process.env.MONGODB_URI || process.env.MONGO_URL || process.env.DATABASE_URL

mongoose.connect(connectionString).then(() => {
    console.log('MongoDB Connected');
}).catch(err => {
    console.log('MongoDB Connection failed, due to', err)
    // Do not exit; allow server to run for local dev similar to bookstore
})
