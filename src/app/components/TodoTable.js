"use client";

import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle,
    DialogHeader,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

export default function TodoTable() {
    // This controls the loading state
    const [isLoading, setIsLoading] = useState(true);
    const [todos, setTodos] = useState([]);
    const [isModelOpen, setIsModelOpen] = useState(false);

    // This holds the form data for the new todo
    const [newTodo, setNewTodo] = useState({
        title: "",
        description: "",
    });

    // This holds the form data for the edited todo
    const [editedTodo, setEditedTodo] = useState({
        id: null,
        title: "",
        description: "",
        completed: false,
    });

    // This holds the error state for the form
    const [errors, setErrors] = useState({
        title: "",
        description: "",
    });

    // Add a new state for form submission loading
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Add fetch function
    const fetchTodos = async () => {
        try {
            const response = await fetch("/api/todos");
            const data = await response.json();
            if (response.ok) {
                setTodos(data);
            } else {
                console.error("Error fetching todos:", data.error);
            }
        } catch (error) {
            console.error("Error fetching todos:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Add useEffect to fetch todos on mount
    useEffect(() => {
        fetchTodos();
    }, []);

    // adds a new todo optimistically
    // updates ui immediately and reverts on failure
    const addTodo = async () => {
        if (!validateForm(newTodo)) {
            return;
        }

        const tempTodo = {
            id: `temp_${crypto.randomUUID()}`,
            title: newTodo.title,
            description: newTodo.description,
            completed: false,
        };

        setTodos([...todos, tempTodo]);
        setIsModelOpen(false);
        setNewTodo({ title: "", description: "" });

        try {
            const response = await fetch("/api/todos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newTodo),
            });

            if (!response.ok) {
                setTodos((currentTodos) =>
                    currentTodos.filter((t) => t.id !== tempTodo.id)
                );
                toast.error(
                    "We were unable to add the todo. Please try again."
                );
                console.log("Error adding todo: server error");
                return;
            }

            const data = await response.json();
            setTodos((currentTodos) =>
                currentTodos.map((t) => (t.id === tempTodo.id ? data : t))
            );
        } catch (error) {
            setTodos((currentTodos) =>
                currentTodos.filter((t) => t.id !== tempTodo.id)
            );
            toast.error("Network error. Check your connection and try again.");
            console.error("Error adding todo:", error);
        }
    };

    const saveEditedTodo = async () => {
        if (!validateForm(editedTodo)) {
            return;
        }

        const originalTodo = todos.find((t) => t.id === editedTodo.id);
        if (!originalTodo) return;

        setTodos((currentTodos) =>
            currentTodos.map((t) => (t.id === editedTodo.id ? editedTodo : t))
        );
        setIsModelOpen(false);

        try {
            const response = await fetch(`/api/todos/${editedTodo.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: editedTodo.title,
                    description: editedTodo.description,
                    completed: editedTodo.completed,
                }),
            });

            if (!response.ok) {
                // Revert to original if failed
                setTodos((currentTodos) =>
                    currentTodos.map((t) =>
                        t.id === editedTodo.id ? originalTodo : t
                    )
                );
                toast.error("Unable to update todo. Please try again.");
                return;
            }

            setEditedTodo({
                id: null,
                title: "",
                description: "",
                completed: false,
            });
        } catch (error) {
            // Revert to original on network error
            setTodos((currentTodos) =>
                currentTodos.map((t) =>
                    t.id === editedTodo.id ? originalTodo : t
                )
            );
            toast.error("Network error. Check your connection and try again.");
            console.error("Error updating todo:", error);
        }
    };

    // handles checkbox change with optimistic update
    // updates ui immediately and reverts on failure
    const handleCheckboxChange = async (id) => {
        const todo = todos.find((t) => t.id === id);
        if (!todo) return;

        setTodos(
            todos.map((t) =>
                t.id === id ? { ...t, completed: !t.completed } : t
            )
        );

        try {
            const response = await fetch(`/api/todos/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    completed: !todo.completed,
                }),
            });

            if (!response.ok) {
                setTodos(
                    todos.map((t) =>
                        t.id === id ? { ...t, completed: todo.completed } : t
                    )
                );
                toast.error(
                    "We were unable to update the todo status. Please try again."
                );
                console.error(
                    "We were unable to update the todo status. Please try again."
                );
            }
        } catch (error) {
            setTodos(
                todos.map((t) =>
                    t.id === id ? { ...t, completed: todo.completed } : t
                )
            );
            toast.error(
                "Hmm, looks like there was a network error. Check your connection and try again."
            );
            console.error(
                "Hmm, looks like there was a network error. Check your connection and try again.",
                error
            );
        }
    };

    const handleEditTodo = (id) => {
        const todoToEdit = todos.find((todo) => todo.id === id);

        setEditedTodo(todoToEdit);

        setIsModelOpen(true);
    };

    const handleDeleteTodo = async (id) => {
        const todoToDelete = todos.find((t) => t.id === id);
        if (!todoToDelete) return;

        setTodos((currentTodos) => currentTodos.filter((t) => t.id !== id));

        try {
            const response = await fetch(`/api/todos/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                setTodos((currentTodos) => [...currentTodos, todoToDelete]);
                toast.error("Unable to delete todo. Please try again.");
                return;
            }

            toast.success("Todo deleted successfully!");
        } catch (error) {
            setTodos((currentTodos) => [...currentTodos, todoToDelete]);
            toast.error("Network error. Check your connection and try again.");
            console.error("Error deleting todo:", error);
        }
    };

    const validateForm = (todo) => {
        if (!todo.title.trim() || !todo.description.trim()) {
            setErrors({
                title: "Title is required",
                description: "Description is required",
            });
            return false;
        }

        setErrors({ title: "", description: "" });
        return true;
    };

    return (
        <div className="p-20">
            <Toaster
                position="bottom-center"
                toastOptions={{
                    duration: 5000,
                    style: {
                        background: "#333",
                        color: "#fff",
                    },
                }}
            />
            <div className="mx-auto max-w-4xl w-full">
                <div className="flex items-center justify-between pb-6">
                    <h1 className="text-2xl font-bold">
                        What do you need to do?
                    </h1>
                    <Dialog
                        open={isModelOpen}
                        onOpenChange={(open) => {
                            setIsModelOpen(open);
                            if (!open) {
                                setErrors({ title: "", description: "" });
                                setNewTodo({ title: "", description: "" });
                                setEditedTodo({
                                    id: null,
                                    title: "",
                                    description: "",
                                    completed: false,
                                });
                            }
                        }}
                    >
                        <DialogTrigger asChild>
                            <Button size="sm">Add</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    editedTodo.id
                                        ? saveEditedTodo()
                                        : addTodo();
                                }}
                            >
                                <DialogHeader>
                                    <DialogTitle>
                                        {editedTodo.id
                                            ? "Edit Todo"
                                            : "Add Todo"}
                                    </DialogTitle>
                                    <DialogDescription>
                                        {editedTodo.id
                                            ? "Edit your todo item below"
                                            : "Add any items you want to remember and click save when you're done."}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">
                                            Item
                                        </Label>
                                        <Input
                                            value={
                                                editedTodo.id
                                                    ? editedTodo.title
                                                    : newTodo.title
                                            }
                                            onChange={(e) =>
                                                editedTodo.id
                                                    ? setEditedTodo({
                                                          ...editedTodo,
                                                          title: e.target.value,
                                                      })
                                                    : setNewTodo({
                                                          ...newTodo,
                                                          title: e.target.value,
                                                      })
                                            }
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-start gap-4">
                                        <Label className="text-right pt-2">
                                            Description
                                        </Label>
                                        <Textarea
                                            value={
                                                editedTodo.id
                                                    ? editedTodo.description
                                                    : newTodo.description
                                            }
                                            onChange={(e) =>
                                                editedTodo.id
                                                    ? setEditedTodo({
                                                          ...editedTodo,
                                                          description:
                                                              e.target.value,
                                                      })
                                                    : setNewTodo({
                                                          ...newTodo,
                                                          description:
                                                              e.target.value,
                                                      })
                                            }
                                            className="col-span-3"
                                            rows={4}
                                        />
                                    </div>
                                </div>
                                {(errors.title || errors.description) && (
                                    <div className="text-sm text-red-500 mb-4 text-center">
                                        Please fill in all required fields
                                    </div>
                                )}
                                <DialogFooter>
                                    <Button type="submit">Save</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Table className="table-fixed">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[5%]"></TableHead>
                            <TableHead className="w-[25%] font-bold">
                                Item
                            </TableHead>
                            <TableHead className="w-[60%] font-bold">
                                Description
                            </TableHead>
                            <TableHead className="w-[10%] font-bold text-center">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="text-center py-10"
                                >
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                                </TableCell>
                            </TableRow>
                        ) : todos.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="text-center py-10 text-gray-500"
                                >
                                    No todos yet. Add one to get started!
                                </TableCell>
                            </TableRow>
                        ) : (
                            todos.map((todo) => (
                                <TableRow
                                    key={todo.id}
                                    className={`group ${
                                        todo.completed ? "bg-gray-50" : ""
                                    }`}
                                >
                                    <TableCell>
                                        <div className="flex items-center justify-center">
                                            <Checkbox
                                                checked={todo.completed}
                                                onCheckedChange={() =>
                                                    handleCheckboxChange(
                                                        todo.id
                                                    )
                                                }
                                                className="rounded-full h-4 w-4 border data-[state=checked]:border-none data-[state=checked]:bg-primary"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell
                                        className={`align-top whitespace-normal py-4 break-words ${
                                            todo.completed
                                                ? "line-through text-gray-400"
                                                : "font-bold"
                                        }`}
                                    >
                                        {todo.title}
                                    </TableCell>
                                    <TableCell
                                        className={`align-top whitespace-normal py-4 leading-normal break-words
                                        ${
                                            todo.completed
                                                ? "line-through text-gray-400"
                                                : ""
                                        }`}
                                    >
                                        {todo.description}
                                    </TableCell>
                                    <TableCell className="align-top">
                                        <div className="flex items-center justify-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    handleEditTodo(todo.id)
                                                }
                                                className="hover:bg-[#0466c8] hover:text-white"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    handleDeleteTodo(todo.id)
                                                }
                                                className="hover:bg-[#e5383b] hover:text-white"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
