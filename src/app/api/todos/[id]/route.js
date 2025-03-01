import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// PUT /api/todos/[id] - Update a todo
export async function PUT(request, { params }) {
    try {
        const id = await params.id;
        const { title, description, completed } = await request.json();

        const { data, error } = await supabase
            .from("todos")
            .update({ title, description, completed })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!data) {
            return NextResponse.json(
                { error: "Todo not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: "Error updating todo" },
            { status: 500 }
        );
    }
}

// DELETE /api/todos/[id] - Delete a todo
export async function DELETE(request, { params }) {
    try {
        const id = await params.id;

        const { error } = await supabase.from("todos").delete().eq("id", id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: "Todo deleted successfully" });
    } catch (error) {
        return NextResponse.json(
            { error: "Error deleting todo" },
            { status: 500 }
        );
    }
}
