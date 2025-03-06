import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";

async function fetchTodos() {
    const supabase = createClient();

    const { data: user, error: sessionError } = await supabase.auth.getUser();

    if (!user || sessionError) throw new Error("Unauthorized", sessionError);

    const { data, error } = await supabase
        .from("todos")
        .select("*")
        .eq("user_id", user.user.id)
        .order("created_at", { ascending: true });

    if (!data || error) throw new Error("Error fetching todos", error);

    return data;
}

export default function useFetchTodos() {
    return useQuery({
        queryKey: ["todos"],
        queryFn: fetchTodos,
    });
}
