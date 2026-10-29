import "dotenv/config";
import express from "express";
import connectDb from "./config/db.js";
import agentRouter from "./routes/agent.route.js";

const PORT = process.env.PORT;
 
const app = express();

app.use(express.json());
app.use("/", agentRouter);

app.get("/", (req, res) => {
  res.json({ message: "Hello from agent" });
});

app.listen(PORT, () => {
  console.log(`Agent started on port ${PORT}`);
  connectDb();
});  
