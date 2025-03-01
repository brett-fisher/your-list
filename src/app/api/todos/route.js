import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// GET /api/todos - Fetch all todos
export async function GET() {
    try {
        const { data, error } = await supabase
            .from("todos")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: "Error fetching todos" },
            { status: 500 }
        );
    }
}

// POST /api/todos - Create a new todo
export async function POST(request) {
    try {
        const { title, description } = await request.json();

        if (!title || !description) {
            return NextResponse.json(
                { error: "Title and description are required" },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("todos")
            .insert([{ title, description }])
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: "Error creating todo" },
            { status: 500 }
        );
    }
}
