import type { Request, Response } from "express";
import Product from "../model/Product.js";
import { isUuid, validateBody } from "./validation.js";

async function getAll(_req: Request, res: Response) {
    res.status(200).json(await Product.findAll());
}

async function getById(req: Request<{ id: string }>, res: Response) {
    if (!isUuid(req.params.id)) { res.status(400).json({ message: "ID deve ser um UUID válido." }); return; }
    const data = await Product.findById(req.params.id);
    if (!data) { res.status(404).json({ message: "Produto não encontrado." }); return; }
    res.status(200).json(data);
}

async function create(req: Request, res: Response) {
    const message = validateBody(req.body, "product");
    if (message) { res.status(400).json({ message }); return; }
    const data = await Product.create(req.body);
    res.location(`/products/${data.id}`).status(201).json(data);
}

async function update(req: Request<{ id: string }>, res: Response) {
    if (!isUuid(req.params.id)) { res.status(400).json({ message: "ID deve ser um UUID válido." }); return; }
    const message = validateBody(req.body, "product");
    if (message) { res.status(400).json({ message }); return; }
    const data = await Product.update(req.params.id, req.body);
    if (!data) { res.status(404).json({ message: "Produto não encontrado." }); return; }
    res.status(200).json(data);
}

async function remove(req: Request<{ id: string }>, res: Response) {
    if (!isUuid(req.params.id)) { res.status(400).json({ message: "ID deve ser um UUID válido." }); return; }
    const data = await Product.remove(req.params.id);
    if (!data) { res.status(404).json({ message: "Produto não encontrado." }); return; }
    res.status(200).json({ message: "Produto removido com sucesso." });
}

// Express 5 forwards rejected async handlers to the final error middleware.
export default { getAll, getById, create, update, remove };
