import type { Request, Response } from "express";
import Category from "../model/Category.js";
import { isUuid, validateBody } from "./validation.js";

async function getAll(_req: Request, res: Response) {
    res.status(200).json(await Category.findAll());
}

async function getByKeyword(req: Request, res: Response) {
    const keyword = req.query.keyword;
    // Keep PostgREST filter syntax out of the interpolated search expression.
    if (typeof keyword !== "string" || !keyword.trim() || keyword.length > 100 || !/^[\p{L}\p{N} _-]+$/u.test(keyword)) {
        res.status(400).json({ message: "Informe keyword com até 100 caracteres: letras, números, espaços, hífen ou sublinhado." });
        return;
    }
    res.status(200).json(await Category.searchByKeyword(keyword.trim().replace(/_/g, "\\_")));
}

async function getById(req: Request<{ id: string }>, res: Response) {
    if (!isUuid(req.params.id)) { res.status(400).json({ message: "ID deve ser um UUID válido." }); return; }
    const data = await Category.findById(req.params.id);
    if (!data) { res.status(404).json({ message: "Categoria não encontrada." }); return; }
    res.status(200).json(data);
}

async function create(req: Request, res: Response) {
    const message = validateBody(req.body, "category");
    if (message) { res.status(400).json({ message }); return; }
    const data = await Category.create(req.body);
    res.location(`/categories/${data.id}`).status(201).json(data);
}

async function update(req: Request<{ id: string }>, res: Response) {
    if (!isUuid(req.params.id)) { res.status(400).json({ message: "ID deve ser um UUID válido." }); return; }
    const message = validateBody(req.body, "category");
    if (message) { res.status(400).json({ message }); return; }
    const data = await Category.update(req.params.id, req.body);
    if (!data) { res.status(404).json({ message: "Categoria não encontrada." }); return; }
    res.status(200).json(data);
}

async function remove(req: Request<{ id: string }>, res: Response) {
    if (!isUuid(req.params.id)) { res.status(400).json({ message: "ID deve ser um UUID válido." }); return; }
    const data = await Category.remove(req.params.id);
    if (!data) { res.status(404).json({ message: "Categoria não encontrada." }); return; }
    res.status(200).json({ message: "Categoria removida com sucesso." });
}

// Express 5 forwards rejected async handlers to the final error middleware.
export default { getAll, getById, create, update, remove, getByKeyword };
