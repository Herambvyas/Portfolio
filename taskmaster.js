// DOM Elements
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const taskCount = document.getElementById('taskCount');
const clearCompletedBtn = document.getElementById('clearCompleted');
const filterButtons = document.querySelectorAll('.filter-btn');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('i');

// Theme Management
const THEME_KEY = 'taskmaster-theme';
const THEMES = {
    LIGHT: 'light',
    DARK: 'dark'
};

// Set theme based on user preference or saved preference
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    
    // Update icon
    if (theme === THEMES.DARK) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }
}

// Toggle between light and dark theme
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
    setTheme(newTheme);
}

// Initialize theme from localStorage or prefer-color-scheme
function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        setTheme(prefersDark ? THEMES.DARK : THEMES.LIGHT);
    }
}

// Event listener for theme toggle
if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
}

// State
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

// Initialize the app
function init() {
    // Load tasks from localStorage
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }

    // Set up event listeners
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    clearCompletedBtn.addEventListener('click', clearCompleted);
    themeToggle.addEventListener('click', toggleTheme);

    // Set up filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.filter;
            renderTasks();
        });
    });

    // Initialize theme
    initTheme();

    // Render initial tasks
    renderTasks();
    
    // Initialize progress bar
    updateTaskCount();
}

// Add a new task
function addTask() {
    const taskText = taskInput.value.trim();
    
    if (taskText) {
        const newTask = {
            id: Date.now().toString(),
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        tasks.unshift(newTask); // Add to beginning of array
        saveTasks();
        renderTasks();
        taskInput.value = ''; // Clear input
        taskInput.focus();
    }
}

// Toggle task completion
function toggleTask(id) {
    tasks = tasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveTasks();
    updateTaskCount();
    renderTasks();
}

// Edit task text
function editTask(id, newText) {
    if (newText.trim()) {
        tasks = tasks.map(task => 
            task.id === id ? { ...task, text: newText.trim() } : task
        );
        saveTasks();
    }
}

// Delete a task
function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
    }
}

// Clear all completed tasks
function clearCompleted() {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    updateTaskCount();
}

// Update the task counter and progress bar
function updateTaskCount() {
    const activeTasks = tasks.filter(task => !task.completed).length;
    const totalTasks = tasks.length;
    const taskWord = activeTasks === 1 ? 'task' : 'tasks';
    taskCount.textContent = `${activeTasks} ${taskWord} left`;
    
    // Update progress bar
    updateProgressBar(totalTasks, activeTasks);
}

// Update the progress bar
function updateProgressBar(totalTasks, activeTasks) {
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    if (totalTasks === 0) {
        progressBar.style.width = '0%';
        progressText.textContent = '0% Complete';
        return;
    }
    
    const completedTasks = totalTasks - activeTasks;
    const progress = Math.round((completedTasks / totalTasks) * 100);
    
    // Update progress bar width with animation
    progressBar.style.setProperty('--progress-width', `${progress}%`);
    progressBar.style.width = `${progress}%`;
    
    // Update progress text
    progressText.textContent = `${progress}% Complete`;
    
    // Change color based on progress
    if (progress < 25) {
        progressBar.style.backgroundColor = '#ff5252'; // Red
    } else if (progress < 50) {
        progressBar.style.backgroundColor = '#ff9800'; // Orange
    } else if (progress < 75) {
        progressBar.style.backgroundColor = '#4caf50'; // Light green
    } else {
        progressBar.style.backgroundColor = '#2e7d32'; // Dark green
    }
}

// Create task element
function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.dataset.id = task.id;
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTask(task.id));
    
    const taskText = document.createElement('span');
    taskText.className = `task-text ${task.completed ? 'completed' : ''}`;
    taskText.textContent = task.text;
    
    // Make task text editable
    taskText.addEventListener('dblclick', () => {
        const currentText = taskText.textContent;
        taskText.contentEditable = true;
        taskText.focus();
        
        // Select all text for easy editing
        const range = document.createRange();
        range.selectNodeContents(taskText);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        
        const saveEdit = () => {
            taskText.contentEditable = false;
            editTask(task.id, taskText.textContent);
            taskText.textContent = taskText.textContent.trim();
            taskText.blur();
            document.removeEventListener('click', handleClickOutside);
        };
        
        const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveEdit();
            } else if (e.key === 'Escape') {
                taskText.textContent = currentText;
                taskText.contentEditable = false;
                document.removeEventListener('keydown', handleKeyDown);
                document.removeEventListener('click', handleClickOutside);
            }
        };
        
        const handleClickOutside = (e) => {
            if (!li.contains(e.target)) {
                saveEdit();
            }
        };
        
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('click', handleClickOutside);
    });
    
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'task-actions';
    
    const editBtn = document.createElement('button');
    editBtn.className = 'task-btn edit-btn';
    editBtn.innerHTML = '<i class="fas fa-edit"></i>';
    editBtn.title = 'Edit task';
    editBtn.addEventListener('click', () => {
        taskText.dispatchEvent(new MouseEvent('dblclick'));
    });
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'task-btn delete-btn';
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.title = 'Delete task';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));
    
    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);
    
    li.appendChild(checkbox);
    li.appendChild(taskText);
    li.appendChild(actionsDiv);
    
    return li;
}

// Render tasks based on current filter
function renderTasks() {
    // Clear current tasks
    taskList.innerHTML = '';
    
    // Filter tasks based on current filter
    let filteredTasks = [];
    
    switch (currentFilter) {
        case 'active':
            filteredTasks = tasks.filter(task => !task.completed);
            break;
        case 'completed':
            filteredTasks = tasks.filter(task => task.completed);
            break;
        default: // 'all'
            filteredTasks = [...tasks];
    }
    
    // Add tasks to the list
    if (filteredTasks.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = currentFilter === 'all' 
            ? 'No tasks yet. Add one above!' 
            : currentFilter === 'active' 
                ? 'No active tasks. Great job!' 
                : 'No completed tasks yet.';
        taskList.appendChild(emptyMessage);
    } else {
        filteredTasks.forEach(task => {
            taskList.appendChild(createTaskElement(task));
        });
    }
    
    updateTaskCount();
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);
