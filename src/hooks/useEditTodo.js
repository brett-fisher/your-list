import { createClient } from "@/utils/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function editTodo({ todo, id }) {
    const supabase = createClient();

    const { data: user, error: sessionError } = await supabase.auth.getUser();

    if (!user || sessionError) throw new Error("Unauthorized", sessionError);

    const { data, error } = await supabase
        .from("todos")
        .update({
            title: todo.title,
        })
        .eq("id", id)
        .select()
        .single();

    if (!data || error) throw new Error("Error fetching todos", error);

    return data;
}

export default function useEditTodo() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: editTodo,
        onMutate: async ({ todo: editedTodo, id }) => {
            await queryClient.cancelQueries({ queryKey: ["todos"] });

            const previousTodos = queryClient.getQueryData(["todos"]);

            if (!previousTodos) return;

            queryClient.setQueryData(["todos"], (todosBeforeEdit) =>
                todosBeforeEdit.map((todo) =>
                    todo.id === id ? { ...todo, ...editedTodo } : todo
                )
            );

            return { previousTodos };
        },
        onError: (context) => {
            queryClient.setQueryData(["todos"], context.previousTodos);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["todos"] });
        },
    });
}
