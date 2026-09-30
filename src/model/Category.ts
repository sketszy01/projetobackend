import supabase from "../config/supabase.js";

async function findAll() {
    const { data, error } = await supabase
        .from("categories")
        .select("*");

    if (error) {
        throw error;
    }

    return data;
}

async function findById(id: string) {
    const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
}

async function create(category: {
    name: string;
    description: string;
    icon: string;
    display_order: number;
    active: boolean;
}) {
    const { data, error } = await supabase
        .from("categories")
        .insert(category)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

async function update(
    id: string,
    category: {
        name: string;
        description: string;
        icon: string;
        display_order: number;
        active: boolean;
    }) {
    const { data, error } = await supabase
        .from("categories")
        .update(category)
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
        .from("categories")
        .delete()
        .eq("id", id)
        .select("id")
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
}

async function searchByKeyword(keyword: string) {
    const { data, error } = await supabase
        .from("categories")
        .select("*")
        .or(`name.ilike.%${keyword}%,description.ilike.%${keyword}%`)
        .order("display_order", { ascending: true });

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
    remove,
    searchByKeyword,
}