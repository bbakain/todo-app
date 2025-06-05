// app/page.tsx
import TodoList from "@/app/components/TodoList";

export default function Home() {
  return (
    <main className="flex justify-center items-center min-h-screen bg-gray-100">
      <TodoList />
    </main>
  );
}