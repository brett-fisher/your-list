import { createClient } from "@/utils/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function deleteTodo(id) {
    const supabase = createClient();

    const { data: user, error: sessionError } = await supabase.auth.getUser();

    if (!user || sessionError) throw new Error("Unauthorized", sessionError);

    const { error, data } = await supabase.from("todos").delete().eq("id", id);

    if (!data || error) throw new Error("Error fetching updated todos", error);

    return data;
}

export default function useDeleteTodo() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteTodo,
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ["todos"] });

            const previousTodos = queryClient.getQueryData(["todos"]);

            if (!previousTodos) return;
            queryClient.setQueryData(["todos"], (todosBeforeDelete) =>
                todosBeforeDelete.filter((todo) => todo.id !== id)
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
