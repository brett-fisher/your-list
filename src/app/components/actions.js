"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function logout() {
    const supabase = await createClient();

    if (!supabase || !supabase.auth) {
        throw new Error("Supabase client is not initialized correctly.");
    }

    await supabase.auth.signOut();
    redirect("/auth");
}
