"use client";

import { Button } from "@/components/ui/button";
import { logout } from "./actions";
import { startTransition } from "react";

export default function SignOut() {
    return (
        <Button
            variant="destructive"
            onClick={() => startTransition(() => logout())}
        >
            Sign Out
        </Button>
    );
}
