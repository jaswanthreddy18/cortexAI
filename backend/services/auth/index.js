import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import router from "./routes/auth.route.js";

dotenv.config();

const PORT = process.env.PORT;

const app = express();
app.use(express.json());
app.use("/", router)
app.get("/", (req, res) =>{
    res.json({message: "hello from auth"});
})

app.listen(PORT, () => {
    console.log(`auth as been started ${PORT}`);
    connectDb();
})

