import { createClient } from "@/utils/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function createTodo(todo) {
    const supabase = createClient();

    const { data: user, error: sessionError } = await supabase.auth.getUser();

    if (!user || sessionError) throw new Error("Unauthorized", sessionError);

    const { data, error } = await supabase
        .from("todos")
        .insert({
            title: todo.title,
            description: todo.description,
            user_id: user.user.id,
            completed: false,
        })
        .select()
        .single();

    if (!data || error) throw new Error("Error fetching todos", error);

    return data;
}

export default function useCreateTodos() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createTodo,
        onMutate: async (newTodo) => {
            await queryClient.cancelQueries({ queryKey: ["todos"] });

            const previousTodos = queryClient.getQueryData(["todos"]);

            if (!previousTodos) return;

            queryClient.setQueryData(["todos"], (old) => [...old, newTodo]);

            return { previousTodos };
        },
        onError: (error, newTodo, context) => {
            queryClient.setQueryData(["todos"], context.previousTodos);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["todos"] });
        },
    });
}
