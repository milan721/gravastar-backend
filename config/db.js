const mongoose = require("mongoose");

// Support multiple env var names commonly used for Mongo URIs
const connectionString =
    process.env.DBSTRING ||
    process.env.MONGODB_URI ||
    process.env.MONGO_URL ||
    process.env.DATABASE_URL;

if (!connectionString || typeof connectionString !== "string") {
    console.error(
        "db connection failed",
        new Error(
            "Missing MongoDB connection string. Set one of: DBSTRING, MONGODB_URI, MONGO_URL, or DATABASE_URL"
        )
    );
    // Exit so platform health checks reflect failure clearly
    process.exit(1);
}

mongoose
    .connect(connectionString)
    .then(() => {
        console.log("db connected");
    })
    .catch((err) => {
        console.log("db connection failed");
        console.error(err);
        process.exit(1);
    });
