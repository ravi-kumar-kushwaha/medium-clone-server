import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const connectDB  = async () =>{
    try {
        const connect = await mongoose.connect(process.env.MONGO_URI,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Database connected successfully!");
        console.log("host:",connect.connection.host);
        // console.log("port",connect.connection.port);
        // console.log("database",connect.connection.db);
    } catch (error) {
        console.log("Error connecting to database",error);
    }
}
export default connectDB;