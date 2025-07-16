// app/page.tsx
"use client";
import TodoList from "./components/TodoList";
import { useState } from "react";

export default function Home() {
  const [task, setTask] = useState("");
  const [todos, setTodos] = useState<string[]>([]);

  const handleAdd = () => {
    if (task.trim()) {
      setTodos([...todos, task.trim()]);
      setTask("");
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-6">📝 할 일 추가하기</h1>

      <div className="w-full max-w-xl flex gap-2 mb-8">
        <input
          value={task}
          onChange={(e) => setTask(e.target.value)}
          className="flex-1 p-4 rounded-lg border border-gray-300 shadow-sm"
          placeholder="오늘 할 일을 입력하세요"
        />
        <button
          onClick={handleAdd}
          className="px-6 py-4 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
        >
          추가
        </button>
      </div>

      <section className="grid gap-4 w-full max-w-2xl">
        {todos.map((todo, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-xl shadow-md border border-gray-200"
          >
            {todo}
          </div>
        ))}
      </section>
    </main>
  );
}
