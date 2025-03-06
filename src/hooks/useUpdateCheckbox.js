import { createClient } from "@/utils/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function editUpdateCheckbox({ id, completed }) {
    const supabase = createClient();

    const { data: user, error: sessionError } = await supabase.auth.getUser();

    if (!user || sessionError) throw new Error("Unauthorized", sessionError);

    const { data, error } = await supabase
        .from("todos")
        .update({
            completed,
        })
        .eq("id", id)
        .select()
        .single();

    if (!data || error) throw new Error("Error updating todo checkbox", error);

    return data;
}

export default function useUpdateCheckbox() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: editUpdateCheckbox,
        onMutate: async ({ id, completed }) => {
            await queryClient.cancelQueries({ queryKey: ["todos"] });

            const previousTodos = queryClient.getQueryData(["todos"]);

            if (!previousTodos) return;

            queryClient.setQueryData(["todos"], (todosBeforeEdit) =>
                todosBeforeEdit.map((todo) =>
                    todo.id === id ? { ...todo, completed } : todo
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
