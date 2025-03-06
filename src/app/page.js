import TodoTable from "./components/TodoTable";
import SignOut from "./components/SignOut";

export default function Home() {
    return (
        <div className="min-h-screen">
            <header className="border-b p-4 flex justify-between items-center">
                <h1 className="text-xl font-semibold">YourList.space</h1>
                <SignOut />
            </header>
            <main className="container mx-auto p-4">
                <TodoTable />
            </main>
        </div>
    );
}
