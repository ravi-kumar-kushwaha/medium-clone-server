import app from "./app.js";
import dotenv from "dotenv";
dotenv.config();

const port = process.env.PORT || 8000;

app.get("/",(req,res)=>{
    res.send("<h1>Hey You Welcome to Blogging Website.Here you can create your blog and share it with your friends</h1>");
})

app.listen(port,()=>{
    console.log(`Server is running on port http://localhost:${port} in ${process.env.NODE_ENV} mode`);
})