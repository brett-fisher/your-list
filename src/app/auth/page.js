"use client";

import { createClient } from "@/utils/supabase/client";

export default function AuthPage() {
    const supabase = createClient();

    const handleGoogleSignIn = async () => {
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
                <h1 className="mb-6 text-2xl font-bold text-center">
                    Welcome to YourList.space
                </h1>
                <p className="mb-6 text-sm text-center text-gray-500">
                    A simple todo app that doesn't suck.
                </p>
                <button
                    onClick={handleGoogleSignIn}
                    className="w-full p-2 flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <img
                        src="https://www.google.com/favicon.ico"
                        alt="Google"
                        className="w-5 h-5"
                    />
                    <span>Sign in with Google</span>
                </button>
                <p className="mt-4 text-sm text-center text-gray-500">
                    Don't have an account? No problem! We'll create one
                    automatically when you sign in with Google.
                </p>
            </div>
        </div>
    );
}
