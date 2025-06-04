const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");

// 리스트 전체 삭제
document.getElementById("delete-all").addEventListener("click", async () => {
  const confirmDelete = confirm("정말 모든 할 일을 삭제하시겠습니까?");
  if (!confirmDelete) return;

  const res = await fetch("http://localhost:3000/todos", {
    method: "DELETE"
  });

  const result = await res.json();
  if (result.success) {
    const allItems = document.querySelectorAll("#todo-list li");
    allItems.forEach((li, index) => {
      li.classList.add("fade-out");
      setTimeout(() => {
        li.remove();
      }, 400); // transition 시간과 일치
    });
  }
});
document.getElementById("filters").addEventListener("click", (e) => {
  if (e.target.tagName !== "BUTTON") return;

  const filter = e.target.dataset.filter;
  let filtered = [];

  if (filter === "all") {
    filtered = currentTodos;
  } else if (filter === "active") {
    filtered = currentTodos.filter(todo => !todo.completed);
  } else if (filter === "completed") {
    filtered = currentTodos.filter(todo => todo.completed);
  }

  renderTodos(filtered);
});

// 할 일 목록 로딩
async function loadTodos() {
  const res = await fetch("http://localhost:3000/todos");
  const todos = await res.json();
  currentTodos = todos;        // 원본 데이터 저장
  renderTodos(currentTodos);  // 화면에 렌더링
  todos.forEach(todo => addTodoToList(todo));
}
function renderTodos(todos) {
  list.innerHTML = ""; // 기존 항목 지우기
  todos.forEach(todo => addTodoToList(todo));
}
function addTodoToList(todo) {
  const li = document.createElement("li");

  li.innerHTML = `
    <label style="cursor: pointer;">
      <input type="checkbox" ${todo.completed ? "checked" : ""} />
      <span style="${todo.completed ? 'text-decoration: line-through; color: gray;' : ''}">
        ${todo.text}
      </span>
    </label>
    <button class="delete-btn" style="margin-left: 10px;">❌</button>
  `;

  const checkbox = li.querySelector("input");
  const textSpan = li.querySelector("span");
  const deleteBtn = li.querySelector(".delete-btn");

  // 체크박스 변경 시 서버에 PATCH 요청
  checkbox.addEventListener("change", async () => {
    const res = await fetch(`http://localhost:3000/todos/${todo._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: checkbox.checked })
    });

    const updatedTodo = await res.json();
    if (updatedTodo.completed) {
      textSpan.style.textDecoration = "line-through";
      textSpan.style.color = "gray";
    } else {
      textSpan.style.textDecoration = "none";
      textSpan.style.color = "black";
    }
  // 예: PATCH 후
  todo.completed = updatedTodo.completed;
  // 예: PUT 후
  todo.text = updatedTodo.text;
  });

  // 삭제 버튼 클릭 시 서버에 DELETE 요청
  deleteBtn.addEventListener("click", async () => {
    const confirmDelete = confirm("정말 이 항목을 삭제하시겠습니까?");
    if (!confirmDelete) return;
    const res = await fetch(`http://localhost:3000/todos/${todo._id}`, {
      method: "DELETE",
    });

    const result = await res.json();
    if (result.success) {
      li.classList.add("fade-out");
      setTimeout(() => {
        li.remove();
      }, 400); // transition과 동일 시간
    }
  });

  list.appendChild(li);
}


// 할 일 서버에 추가 요청
form.addEventListener("submit", async function (e) {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  const res = await fetch("http://localhost:3000/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, date: selectedDate }) // ✅ 여기에 있어야 함
  }); // 할 일 추가 시 선택된 날짜로 저장되게 변경

  const newTodo = await res.json();
  addTodoToList(newTodo);
  input.value = "";
});

let currentTodos = []; // 서버에서 받아온 원본 데이터를 저장할 변수

//<-- 날짜별 관리
function getTodayKST() {
  const date = new Date();
  const offset = 9 * 60; // 한국은 UTC+9
  const local = new Date(date.getTime() + offset * 60 * 1000);
  return local.toISOString().split("T")[0]; // "YYYY-MM-DD"
} // 프론트에서 오늘 날짜 구하기 (한국 시간 기준)

let selectedDate = getTodayKST();

document.getElementById("date-picker").value = selectedDate;

document.getElementById("date-picker").addEventListener("change", (e) => {
  selectedDate = e.target.value;
  loadTodosByDate(selectedDate);
});

async function loadTodosByDate(date) {
  const res = await fetch(`http://localhost:3000/todos?date=${date}`);
  const todos = await res.json();
  currentTodos = todos;
  renderTodos(todos);
} // 날짜에 따라 할 일 불러오기
//

// 시작할 때 서버에서 할 일 목록 불러오기
loadTodosByDate(selectedDate);  // <-- 날짜별 로딩 함수



