// script.js
// Client-side logic: fetches tasks from the backend, renders them into the DOM,
// and wires up form submission / delete / toggle-complete actions — all without
// a single page reload (classic AJAX pattern using the Fetch API).

// When the frontend is served BY the same Express app (production), relative
// paths work. When opened directly as a file or via a separate dev server,
// point this at your local backend instead.
const API_BASE = window.location.origin.includes('null') || window.location.protocol === 'file:'
  ? 'http://localhost:5000/api/tasks'
  : '/api/tasks';

// ---- DOM references ----
const taskForm     = document.getElementById('taskForm');
const titleInput   = document.getElementById('titleInput');
const descInput    = document.getElementById('descInput');
const priorityInput = document.getElementById('priorityInput');
const dueInput     = document.getElementById('dueInput');
const formError    = document.getElementById('formError');

const taskGrid   = document.getElementById('taskGrid');
const emptyState = document.getElementById('emptyState');

const statTotal   = document.getElementById('statTotal');
const statPending = document.getElementById('statPending');
const statDone    = document.getElementById('statDone');
const gaugeProgress = document.getElementById('gaugeProgress');
const gaugePct = document.getElementById('gaugePct');

const connStatus = document.getElementById('connStatus');
const connText   = document.getElementById('connText');

const filterBtns = document.querySelectorAll('.filter-btn');
const dateLine = document.getElementById('dateLine');

let tasks = [];          // in-memory cache of the last fetched task list
let currentFilter = 'all';

// ---- Helpers ----
function setConnection(isOnline) {
  connStatus.classList.toggle('online', isOnline);
  connStatus.classList.toggle('offline', !isOnline);
  connText.textContent = isOnline ? 'API connected' : 'API unreachable';
}

function showFormError(msg) {
  formError.textContent = msg;
  if (msg) setTimeout(() => { formError.textContent = ''; }, 3500);
}

function formatDue(dateStr) {
  if (!dateStr) return 'No due date';
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// ---- Rendering ----
function renderStats() {
  const total = tasks.length;
  const done = tasks.filter(t => t.completed).length;
  const pending = total - done;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  statTotal.textContent = total;
  statPending.textContent = pending;
  statDone.textContent = done;
  gaugePct.textContent = `${pct}%`;

  const circumference = 364.4; // 2 * PI * r(58)
  gaugeProgress.style.strokeDashoffset = circumference - (pct / 100) * circumference;
}

function renderTasks() {
  taskGrid.innerHTML = '';

  const visible = tasks.filter(t => {
    if (currentFilter === 'pending') return !t.completed;
    if (currentFilter === 'completed') return t.completed;
    return true;
  });

  emptyState.classList.toggle('show', visible.length === 0);

  visible.forEach(task => {
    const card = document.createElement('article');
    card.className = `task-card priority-${task.priority}${task.completed ? ' completed' : ''}`;
    card.dataset.id = task._id;

    card.innerHTML = `
      <div class="task-card-top">
        <h3 class="task-title"></h3>
        <div class="task-actions">
          <button class="icon-btn toggle${task.completed ? ' is-done' : ''}" title="Toggle complete">✓</button>
          <button class="icon-btn delete" title="Delete task">✕</button>
        </div>
      </div>
      <p class="task-desc"></p>
      <div class="task-meta">
        <span class="priority-tag ${task.priority}">${task.priority}</span>
        <span>${formatDue(task.dueDate)}</span>
      </div>
    `;

    // set text content via DOM (not innerHTML) to avoid any markup injection
    card.querySelector('.task-title').textContent = task.title;
    card.querySelector('.task-desc').textContent = task.description || '';

    card.querySelector('.toggle').addEventListener('click', () => toggleComplete(task));
    card.querySelector('.delete').addEventListener('click', () => deleteTask(task._id));

    taskGrid.appendChild(card);
  });

  renderStats();
}

// ---- API calls (Fetch) ----
async function loadTasks() {
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    tasks = json.data || [];
    setConnection(true);
    renderTasks();
  } catch (err) {
    console.error('Failed to load tasks:', err);
    setConnection(false);
  }
}

async function createTask(payload) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to create task');
  return json.data;
}

async function toggleComplete(task) {
  try {
    const res = await fetch(`${API_BASE}/${task._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !task.completed })
    });
    if (!res.ok) throw new Error('Failed to update task');
    const json = await res.json();
    const idx = tasks.findIndex(t => t._id === task._id);
    if (idx !== -1) tasks[idx] = json.data;
    renderTasks();
  } catch (err) {
    console.error(err);
    showFormError('Could not update task — check the server.');
  }
}

async function deleteTask(id) {
  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete task');
    tasks = tasks.filter(t => t._id !== id);
    renderTasks();
  } catch (err) {
    console.error(err);
    showFormError('Could not delete task — check the server.');
  }
}

// ---- Event listeners ----
taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  if (!title) {
    showFormError('Title is required.');
    return;
  }

  const payload = {
    title,
    description: descInput.value.trim(),
    priority: priorityInput.value,
    dueDate: dueInput.value || null
  };

  try {
    const newTask = await createTask(payload);
    tasks.unshift(newTask);
    renderTasks();
    taskForm.reset();
    priorityInput.value = 'medium';
    titleInput.focus();
  } catch (err) {
    showFormError(err.message);
  }
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

// ---- Init ----
dateLine.textContent = new Date().toLocaleDateString(undefined, {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});

loadTasks();
