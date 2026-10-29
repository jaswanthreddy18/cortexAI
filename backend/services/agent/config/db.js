import mongoose from "mongoose";

const connectDb = async () => {
     try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDb connected") 
     } catch (error) {
        console.log("Error in connecting mongodb ", {error});
     }
}

export default connectDb;