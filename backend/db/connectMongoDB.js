import mongoose from 'mongoose';

const connectMongoDB = async () => {
    try {
        console.log("Connecting to MongoDB with URI:", process.env.MONGO_URI); // Log the URI before connecting
        const connect = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to MongoDB");
    } catch (error) {
        console.log("Error connecting to MongoDB:", error.message);
        process.exit(1);
    }
};

export default connectMongoDB;
