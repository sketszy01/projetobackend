console.log("1. script iniciou");

import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;

console.log("2. URL:", url);
console.log("3. Chave começa com:", key?.slice(0, 10));

try {
  const supabase = createClient(url, key);
  console.log("4. consultando o banco...");
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .abortSignal(AbortSignal.timeout(10000));
  console.log("5. Erro:", error);
  console.log("6. Dados:", data);
} catch (e) {
  console.log("FALHOU:", e.message, e.cause?.code ?? "");
}