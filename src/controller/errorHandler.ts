import type { ErrorRequestHandler } from "express";

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
    const code = typeof error?.code === "string" ? error.code : "";
    if (error?.type === "entity.parse.failed") {
        res.status(400).json({ message: "JSON inválido." });
        return;
    }
    if (error?.type === "entity.too.large") {
        res.status(413).json({ message: "Body excede o limite de 100 KB." });
        return;
    }
    if (code === "23503") {
        res.status(409).json({ message: "Relacionamento inválido: a categoria não existe ou ainda possui produtos." });
        return;
    }
    if (["23502", "23514", "22P02", "22003"].includes(code)) {
        res.status(400).json({ message: "Dados incompatíveis com as regras do banco." });
        return;
    }
    if (code === "23505") {
        res.status(409).json({ message: "Registro em conflito com outro existente." });
        return;
    }
    // Never return/log raw database messages, credentials or request bodies.
    console.error("Falha interna ao processar requisição.");
    res.status(500).json({ message: "Erro interno. Verifique a configuração e a disponibilidade do banco." });
};
export default errorHandler;
