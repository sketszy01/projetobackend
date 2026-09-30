import express from "express";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import errorHandler from "./controller/errorHandler.js";

const app = express();
app.use(express.json({ limit: "100kb" }));
app.get("/", (_req, res) => {
    res.status(200).json({ message: "Restaurant Ordering System - API", version: "1.0.0" });
});
app.use("/categories", categoryRoutes);
app.use("/products", productRoutes);
app.use((_req, res) => { res.status(404).json({ message: "Rota não encontrada." }); });
app.use(errorHandler);
export default app;
