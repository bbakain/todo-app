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
    const allItems = document.querySelectorAll("#todo-list .todo-card");
    allItems.forEach((card, index) => {
      card.classList.add("fade-out");
      setTimeout(() => {
        card.remove();
      }, 400); // transition 시간과 일치
    });
  }
});

// 필터 버튼 활성 상태 관리
let currentFilter = 'all';

document.getElementById("filters").addEventListener("click", (e) => {
  if (e.target.tagName !== "BUTTON") return;

  // 이전 활성 버튼 비활성화
  document.querySelectorAll("#filters button").forEach(btn => {
    btn.classList.remove("bg-blue-100", "text-blue-700");
    btn.classList.add("text-gray-600");
  });

  // 현재 클릭된 버튼 활성화
  e.target.classList.remove("text-gray-600");
  e.target.classList.add("bg-blue-100", "text-blue-700");

  const filter = e.target.dataset.filter;
  currentFilter = filter;
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
}

function renderTodos(todos) {
  list.innerHTML = ""; // 기존 항목 지우기
  todos.forEach(todo => addTodoToList(todo));
}

function addTodoToList(todo) {
  const card = document.createElement("div");
  card.className = "todo-card bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1";

  // 날짜 포맷팅
  const todoDate = new Date(todo.date);
  const formattedDate = todoDate.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  card.innerHTML = `
    <div class="flex items-start justify-between mb-4">
      <div class="flex-1">
        <div class="flex items-center gap-3 mb-2">
          <label class="cursor-pointer">
            <input type="checkbox" ${todo.completed ? "checked" : ""} 
                   class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
          </label>
          <h3 class="text-lg font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}">
            ${todo.text}
          </h3>
        </div>
        <p class="text-sm text-gray-500 ml-8">${formattedDate}</p>
      </div>
      <button class="delete-btn text-gray-400 hover:text-red-500 transition-colors p-1">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
        </svg>
      </button>
    </div>
    <div class="flex items-center justify-between pt-4 border-t border-gray-100">
      <span class="text-xs text-gray-400">
        ${todo.completed ? '완료됨' : '진행중'}
      </span>
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          todo.completed 
            ? 'bg-green-100 text-green-800' 
            : 'bg-blue-100 text-blue-800'
        }">
          ${todo.completed ? '✓ 완료' : '● 진행중'}
        </span>
      </div>
    </div>
  `;

  const checkbox = card.querySelector("input");
  const textElement = card.querySelector("h3");
  const deleteBtn = card.querySelector(".delete-btn");
  const statusBadge = card.querySelector(".inline-flex");

  // 체크박스 변경 시 서버에 PATCH 요청
  checkbox.addEventListener("change", async () => {
    const res = await fetch(`http://localhost:3000/todos/${todo._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: checkbox.checked })
    });

    const updatedTodo = await res.json();
    if (updatedTodo.completed) {
      textElement.classList.add("line-through", "text-gray-500");
      textElement.classList.remove("text-gray-800");
      statusBadge.className = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800";
      statusBadge.textContent = "✓ 완료";
    } else {
      textElement.classList.remove("line-through", "text-gray-500");
      textElement.classList.add("text-gray-800");
      statusBadge.className = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800";
      statusBadge.textContent = "● 진행중";
    }
    
    todo.completed = updatedTodo.completed;
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
      card.classList.add("fade-out");
      setTimeout(() => {
        card.remove();
      }, 400); // transition과 동일 시간
    }
  });

  list.appendChild(card);
}

// 할 일 서버에 추가 요청
form.addEventListener("submit", async function (e) {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  const res = await fetch("http://localhost:3000/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, date: selectedDate })
  });

  const newTodo = await res.json();
  addTodoToList(newTodo);
  input.value = "";
  
  // 입력 후 필터 상태에 따라 다시 렌더링
  if (currentFilter !== 'all') {
    const filtered = currentTodos.filter(todo => {
      if (currentFilter === 'active') return !todo.completed;
      if (currentFilter === 'completed') return todo.completed;
      return true;
    });
    renderTodos(filtered);
  }
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

// 시작할 때 서버에서 할 일 목록 불러오기
loadTodosByDate(selectedDate);

// 초기 필터 버튼 활성화
document.querySelector('[data-filter="all"]').classList.add("bg-blue-100", "text-blue-700");
document.querySelector('[data-filter="all"]').classList.remove("text-gray-600");



