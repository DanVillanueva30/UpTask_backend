import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { corsConfig } from "./config/cors";
import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import projectRoutes from "./routes/projectRoutes";

dotenv.config();

connectDB();
const app = express();
//Habilitar conexiones.
app.use(cors(corsConfig));
//Habilitar lectura formato json.
app.use(express.json());

//Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

export default app;