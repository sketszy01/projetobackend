// Validation shared by the two controllers; no additional dependency.
export function isUuid(value: unknown): value is string {
    return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function validateBody(body: unknown, entity: "category" | "product"): string | null {
    if (!body || typeof body !== "object" || Array.isArray(body)) return "Envie um objeto JSON no body.";
    const data = body as Record<string, unknown>;
    const strings = entity === "category" ? ["name", "description", "icon"] : ["name", "description", "image"];
    const booleans = entity === "category" ? ["active"] : ["available", "active"];
    const fields = [...strings, ...booleans, ...(entity === "category" ? ["display_order"] : ["categoryId", "price"])];
    if (Object.keys(data).some(key => !fields.includes(key))) return "Body contém campos não permitidos (não envie id).";
    // POST and PUT require all fields. PUT replaces the editable representation.
    for (const key of strings) {
        if (typeof data[key] !== "string") return `${key} deve ser uma string.`;
        if ((key === "name" || key === "description") && !(data[key] as string).trim()) return `${key} é obrigatório.`;
    }
    for (const key of booleans) if (typeof data[key] !== "boolean") return `${key} deve ser boolean.`;
    if (entity === "category") {
        if (typeof data.display_order !== "number" || !Number.isInteger(data.display_order) || data.display_order < 0 || data.display_order > 2147483647) return "display_order deve ser inteiro entre 0 e 2147483647.";
    } else {
        if (!isUuid(data.categoryId)) return "categoryId deve ser um UUID válido.";
        if (typeof data.price !== "number" || !Number.isFinite(data.price) || data.price <= 0) return "price deve ser numérico e maior que zero.";
    }
    return null;
}
