"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash, Trash2 } from "lucide-react";
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

const todoData = [
    {
        id: 1,
        title: "Buy groceries",
        description: "Get the ingredients for the recipe",
        completed: false,
    },
    {
        id: 2,
        title: "Clean the house",
        description: "Mop the floor, vacuum the carpet, and dust the shelves",
        completed: false,
    },
];

export default function TodoTable() {
    // This controls the open/close state of the modal
    const [isModelOpen, setIsModelOpen] = useState(false);

    // This holds the form data for the new todo
    const [newTodo, setNewTodo] = useState({
        title: "",
        description: "",
    });

    // This holds the list of todos in the table
    const [todos, setTodos] = useState(todoData);

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

    // This is the function that adds a new todo to the list
    const addTodo = () => {
        if (!validateForm(newTodo)) {
            return;
        }

        setTodos([
            ...todos,
            {
                id: todos.length + 1,
                title: newTodo.title,
                description: newTodo.description,
                completed: false,
            },
        ]);

        setNewTodo({
            title: "",
            description: "",
        });

        setIsModelOpen(false);
    };

    const saveEditedTodo = () => {
        if (!validateForm(editedTodo)) {
            return;
        }

        setTodos(
            todos.map((todo) => (todo.id === editedTodo.id ? editedTodo : todo))
        );

        setEditedTodo({
            id: null,
            title: "",
            description: "",
            completed: false,
        });

        setIsModelOpen(false);
    };

    const handleCheckboxChange = (id) => {
        setTodos(
            todos.map((todo) =>
                todo.id === id ? { ...todo, completed: !todo.completed } : todo
            )
        );
    };

    const handleEditTodo = (id) => {
        const todoToEdit = todos.find((todo) => todo.id === id);

        setEditedTodo(todoToEdit);

        setIsModelOpen(true);
    };

    const handleDeleteTodo = (id) => {
        setTodos(todos.filter((todo) => todo.id !== id));
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
                        {todos.map((todo) => (
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
                                                handleCheckboxChange(todo.id)
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
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
