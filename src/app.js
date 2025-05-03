import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./confige/db.js";

const app = express();
//middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.use(cors());

//database connection

connectDB();

//user routes
import userRoutes from './routes/user.routes.js'
app.use("/api/v1/users/",userRoutes)

//post routes
import postRoutes from './routes/post.routes.js'
app.use("/api/v1/users/",postRoutes);
//likes route
import likeRoutes from './routes/like.routes.js'
app.use("/api/v1/users/",likeRoutes);

//comment routes
import commentRoutes from './routes/comment.routes.js'
app.use("/api/v1/users/",commentRoutes);

//category routes
import categoryRoutes from'./routes/category.routes.js'
app.use("/api/v1/users/",categoryRoutes);

//saved post routes
import savedPostRoutes from './routes/savedPost.routes.js'
app.use("/api/v1/users/",savedPostRoutes);

//follow routes
import followRoutes from './routes/follow.routes.js';
app.use("/api/v1/users/",followRoutes);

export default app;