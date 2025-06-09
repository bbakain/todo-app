"use client";
import { useEffect, useState } from "react";

type Todo = {
  _id?: string;
  text: string;
  completed: boolean;
  date: string;
};

const getTodayKST = () => {
  const date = new Date();
  const offset = 9 * 60;
  const local = new Date(date.getTime() + offset * 60 * 1000);
  return local.toISOString().split("T")[0];
};

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [selectedDate, setSelectedDate] = useState(getTodayKST());
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  useEffect(() => {
    loadTodosByDate(selectedDate);
  }, [selectedDate]);

  const loadTodosByDate = async (date: string) => {
    const res = await fetch(`http://localhost:3000/todos?date=${date}`);
    const data = await res.json();
    setTodos(data);
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const res = await fetch("http://localhost:3000/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input, date: selectedDate }),
    });
    const newTodo = await res.json();
    setTodos((prev) => [...prev, newTodo]);
    setInput("");
  };

  const toggleComplete = async (todo: Todo) => {
    const res = await fetch(`http://localhost:3000/todos/${todo._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !todo.completed }),
    });
    const updated = await res.json();
    setTodos((prev) =>
      prev.map((t) => (t._id === updated._id ? updated : t))
    );
  };

  const deleteTodo = async (id?: string) => {
    if (!id || !confirm("정말 삭제하시겠습니까?")) return;
    const res = await fetch(`http://localhost:3000/todos/${id}`, {
      method: "DELETE",
    });
    const result = await res.json();
    if (result.success) {
      setTodos((prev) => prev.filter((t) => t._id !== id));
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4 text-center">📝 할 일 목록</h1>

      <form onSubmit={handleSubmit} className="flex mb-4 gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="할 일을 입력하세요"
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:bg-gray-100"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-gray-950 text-white rounded-md hover:bg-gray-800"
        >
          추가
        </button>
      </form>

      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        className="mb-4 w-full px-3 py-2 border rounded-md focus:outline-none focus:bg-gray-100"
      />

      <div className="flex gap-2 justify-center mt-4 text-sm">
        <button onClick={() => setFilter("all")} className="text-gray-600 hover:text-black">전체</button>
        <button onClick={() => setFilter("active")} className="text-gray-600 hover:text-black">진행중</button>
        <button onClick={() => setFilter("completed")} className="text-gray-600 hover:text-black">완료됨</button>
      </div>

      <ul className="space-y-2 mt-4">
        {filteredTodos.map((todo) => (
          <li
            key={todo._id}
            className="bg-gray-50 px-4 py-2 rounded-md flex justify-between items-center shadow-sm"
          >
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleComplete(todo)}
                className="form-checkbox w-5 h-5"
              />
              <span
                className={
                  todo.completed ? "line-through text-gray-400" : "text-gray-800"
                }
              >
                {todo.text}
              </span>
            </label>
            <button
              onClick={() => deleteTodo(todo._id)}
              className="text-red-400 hover:text-red-600 text-sm"
            >
              🗑️
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
