import supabase from "../config/supabase.js";

async function findAll() {
    const { data, error } = await supabase
        .from("products")
        .select("*");

    if (error) {
        throw error;
    }

    return data;
}

async function findById(id: string) {
    const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
}

async function create(product: {
    "categoryId": string,
    "name": string,
    "description": string,
    "price": number,
    "image": string,
    "available": boolean,
    "active": boolean,
}) {
    const { data, error } = await supabase
        .from("products")
        .insert(product)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

async function update(
    id: string,
    product: {
        "categoryId": string,
        "name": string,
        "description": string,
        "price": number,
        "image": string,
        "available": boolean,
        "active": boolean,
    }) {
    const { data, error } = await supabase
        .from("products")
        .update(product)
        .eq("id", id)
        .select()
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
}

async function remove(id: string) {
    const { data, error } = await supabase
        .from("products")
        .delete()
        .eq("id", id)
        .select("id")
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
}

export default {
    findAll,
    findById,
    create,
    update,
    remove
}