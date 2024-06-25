import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import connectMongoDB from './db/connectMongoDB.js';

// Load environment variables from .env file
dotenv.config();

// Add logging to verify if dotenv.config() is executed
console.log("Dotenv configured");

// Log the environment variable to check if it's loaded correctly
console.log("MONGO_URI from .env:", process.env.MONGO_URI);

const app = express();
const PORT = process.env.PORT || 5000;

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectMongoDB();
});
