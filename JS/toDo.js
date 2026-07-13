const toDoInput = document.querySelector(".todo-input");
const toDoBtn = document.querySelector(".toDO-btn");
const toDoList = document.querySelector(".todo-list");

toDoBtn.addEventListener("click", addToDo);
document.addEventListener("DOMContentLoaded", getTodos);

function addToDo(event) {
    event.preventDefault();
    const todoText = toDoInput.value.trim();
    if (!todoText) return;

    const todoItem = { text: todoText, done: false, id: Date.now() };
    saveLocal(todoItem);
    renderToDo(todoItem);
    toDoInput.value = "";
}

function saveLocal(todoItem) {
    chrome.storage.local.get(['todos'], (result) => {
        const todos = result.todos || [];
        todos.push(todoItem);
        chrome.storage.local.set({ todos });
    });
}

function getTodos() {
    chrome.storage.local.get(['todos'], (result) => {
        const todos = result.todos || [];
        todos.forEach(renderToDo);
    });
}

function renderToDo(todoItem) {
    const li = document.createElement("li");
    li.dataset.id = todoItem.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todoItem.done;
    checkbox.addEventListener("change", () => {
        li.classList.toggle("completed", checkbox.checked);
        toggleDone(todoItem.id, checkbox.checked);
    });
    const span = document.createElement("span");
    span.textContent = todoItem.text;
    if (todoItem.done) span.style.textDecoration = "line-through";

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "✕";
    deleteBtn.addEventListener("click", () => deleteToDo(todoItem.id, li));

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);

    // insert before the reset button so new tasks don't push it around unexpectedly
    const resetBtn = document.querySelector(".refreshlist");
    toDoList.insertBefore(li, resetBtn);
}

function toggleDone(id, done) {
    chrome.storage.local.get(['todos'], (result) => {
        const todos = result.todos || [];
        const updated = todos.map(t => t.id === id ? { ...t, done } : t);
        chrome.storage.local.set({ todos: updated });
    });
}

function deleteToDo(id, liElement) {
    chrome.storage.local.get(['todos'], (result) => {
        const todos = result.todos || [];
        const filtered = todos.filter(t => t.id !== id);
        chrome.storage.local.set({ todos: filtered }, () => {
            liElement.remove();
        });
    });
}

document.querySelector(".refreshlist").addEventListener("click", () => {
    chrome.storage.local.set({ todos: [] }, () => {
        document.querySelectorAll(".todo-list li").forEach(li => li.remove());
    });
});

// ---- Dynamic rotating placeholders ----
const placeholderOptions = [
    "Walk the dog",
    "Reply to work email",
    "Finish report",
    "Workout",
    "Book appointment",
    "Finish Assignment"
];

function rotatePlaceholder() {
    const random = placeholderOptions[Math.floor(Math.random() * placeholderOptions.length)];
    toDoInput.placeholder = random;
}

rotatePlaceholder();
setInterval(rotatePlaceholder, 4000);