import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routes/auth.js";
import notesRouter from "./routes/notes.js"
import connectDB from "./db.js";

dotenv.config();

const app = express();
app.use(express.json());
connectDB();

app.use(
  cors({
    origin: process.env.FRONTEND, 
    credentials: true,        
  })
);

// Routes
app.use("/api/auth", authRouter);
app.use("/api/notes",notesRouter)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
