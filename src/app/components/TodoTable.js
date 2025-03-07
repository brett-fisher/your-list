"use client";

import useFetchTodos from "@/hooks/useFetchTodos";
import { useState } from "react";
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
import useCreateTodos from "@/hooks/useCreateTodos";
import useEditTodo from "@/hooks/useEditTodo";
import useDeleteTodo from "@/hooks/useDeleteTodo";
import useUpdateCheckbox from "@/hooks/useUpdateCheckbox";

export default function TodoTable() {
    const { data: todos, isPending } = useFetchTodos();
    const { mutate: createTodo } = useCreateTodos();
    const { mutate: editTodo } = useEditTodo();
    const { mutate: deleteTodo } = useDeleteTodo();
    const { mutate: updateCheckbox } = useUpdateCheckbox();
    const [isModelOpen, setIsModelOpen] = useState(false);

    // This holds the form data for the new todo
    const [newTodo, setNewTodo] = useState({
        title: "",
    });

    // This holds the form data for the edited todo
    const [editedTodo, setEditedTodo] = useState({
        id: null,
        title: "",
        completed: false,
    });

    // This holds the error state for the form
    const [errors, setErrors] = useState({
        title: "",
    });

    // Add a new state for form submission loading
    const [isSubmitting, setIsSubmitting] = useState(false);

    // adds a new todo optimistically
    // updates ui immediately and reverts on failure
    const addTodo = async () => {
        if (!validateForm(newTodo)) {
            return;
        }

        const tempTodo = {
            id: `temp_${crypto.randomUUID()}`,
            title: newTodo.title,
        };

        createTodo(tempTodo);

        setIsModelOpen(false);
        setNewTodo({ title: "" });
    };

    const saveEditedTodo = async () => {
        if (!validateForm(editedTodo)) {
            return;
        }

        editTodo({ todo: editedTodo, id: editedTodo.id });

        setIsModelOpen(false);
        setNewTodo({ title: "" });
    };

    const handleCheckboxChange = async (id, value) => {
        updateCheckbox({ id, completed: value });
    };

    const handleEditTodo = (id) => {
        const todoToEdit = todos.find((todo) => todo.id === id);

        setEditedTodo(todoToEdit);
        setIsModelOpen(true);
    };

    const handleDeleteTodo = async (id) => {
        deleteTodo(id);
    };

    const validateForm = (todo) => {
        if (!todo.title.trim()) {
            setErrors({
                title: "Title is required",
            });
            return false;
        }

        setErrors({ title: "" });
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
                                setErrors({ title: "" });
                                setNewTodo({ title: "" });
                                setEditedTodo({
                                    id: null,
                                    title: "",
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
                                </div>
                                {errors.title && (
                                    <div className="text-sm text-red-500 mb-4 text-center">
                                        Please fill in the title field
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
                            <TableHead className="w-[85%] font-bold">
                                Item
                            </TableHead>
                            <TableHead className="w-[10%] font-bold text-center">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isPending ? (
                            <TableRow>
                                <TableCell
                                    colSpan={3}
                                    className="text-center py-10"
                                >
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                                </TableCell>
                            </TableRow>
                        ) : todos.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={3}
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
                                                        todo.id,
                                                        !todo.completed
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
