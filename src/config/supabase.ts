import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
if (!supabaseUrl || !supabaseSecretKey || supabaseSecretKey === "substitua-pela-chave-do-backend") {
    throw new Error("Configure SUPABASE_URL e SUPABASE_SECRET_KEY no ambiente ou no .env.");
}
try {
    const url = new URL(supabaseUrl);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error();
} catch {
    throw new Error("SUPABASE_URL deve ser uma URL HTTP(S) válida.");
}
const supabase = createClient(supabaseUrl, supabaseSecretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});
export default supabase;
