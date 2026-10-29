import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import router from "./routes/chat.route.js";

dotenv.config();

const PORT = process.env.PORT;

const app = express();
app.use(express.json({ limit: "12mb" }));
app.use("/", router)
app.get("/", (req, res) =>{
    res.json({message: "hello from chat"});
})

app.listen(PORT, () => {
    console.log(`chat as been started ${PORT}`);
    connectDb();
})

