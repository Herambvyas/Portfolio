// DOM Elements
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const taskCount = document.getElementById('taskCount');
const clearCompletedBtn = document.getElementById('clearCompleted');
const filterButtons = document.querySelectorAll('.filter-btn');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;

// Login elements
const loginModal = document.getElementById('loginModal');
const usernameInput = document.getElementById('usernameInput');
const startBtn = document.getElementById('startBtn');
const userGreeting = document.getElementById('userGreeting');
const coinCount = document.getElementById('coinCount');
const leaderboardBtn = document.getElementById('leaderboardBtn');
const leaderboardContainer = document.getElementById('leaderboardContainer');
const leaderboardList = document.getElementById('leaderboardList');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// Game state
let user = {
    name: '',
    coins: 0,
    lastCompletedDate: null,
    dailyStreak: 0
};

// Leaderboard data
let leaderboard = [];

// Constants
const COIN_REWARD_TASK = 10;
const COIN_REWARD_DAILY = 30;
const STORAGE_KEY = 'taskmaster_data';

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

// Update the active filter button
function updateActiveFilterButton() {
    if (!filterButtons) return;
    
    filterButtons.forEach(button => {
        if (button.dataset.filter === currentFilter) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

// Initialize the app
function init() {
    // Load user data and tasks
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
        const data = JSON.parse(savedData);
        user = data.user || user;
        tasks = data.tasks || [];
        leaderboard = data.leaderboard || [];
        
        // Check if it's a new day for daily streak
        checkDailyStreak();
        
        // If user is logged in, show the app
        if (user.name) {
            showApp();
        } else {
            showLogin();
        }
    } else {
        showLogin();
    }

    // Set up event listeners
    if (addTaskBtn) addTaskBtn.addEventListener('click', addTask);
    if (taskInput) {
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addTask();
            }
        });
    }

    if (clearCompletedBtn) clearCompletedBtn.addEventListener('click', clearCompleted);

    // Set up filter buttons
    if (filterButtons) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                currentFilter = button.dataset.filter;
                updateActiveFilterButton();
                renderTasks();
            });
        });
    }

    // Set up login form
    if (startBtn) startBtn.addEventListener('click', startApp);
    if (usernameInput) {
        usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                startApp();
            }
        });
    }
    
    // Set up leaderboard button
    if (leaderboardBtn) leaderboardBtn.addEventListener('click', toggleLeaderboard);

    // Initialize theme
    initTheme();
    
    // Update the active filter button
    updateActiveFilterButton();
    
    // Initial render
    renderTasks();
    
    // Initialize progress bar
    updateTaskCount();
}

// Add a new task
function addTask() {
    const taskText = taskInput.value.trim();
    
    if (taskText) {
        const now = new Date().toISOString();
        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false,
            createdAt: now,
            updatedAt: now
        };
        
        tasks.unshift(newTask); // Add to beginning of array
        saveTasks();
        renderTasks();
        
        // Clear and focus input
        taskInput.value = '';
        taskInput.focus();
        
        // Award coins for adding a new task
        addCoins(COIN_REWARD_TASK, `+${COIN_REWARD_TASK} coins for adding a task!`);
        
        // Show success message
        showToast('Task added successfully!');
        
        // Scroll to the top to show the new task
        taskList.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Toggle task completion
function toggleTask(id) {
    const now = new Date().toISOString();
    
    tasks = tasks.map(task => {
        if (task.id === id) {
            const newCompletedState = !task.completed;
            return {
                ...task,
                completed: newCompletedState,
                completedAt: newCompletedState ? now : null,
                updatedAt: now
            };
        }
        return task;
    });
    
    saveTasks();
    updateTaskCount();
    
    // If task was just completed, award coins
    const task = tasks.find(t => t.id === id);
    if (task && task.completed) {
        // Add visual feedback
        const taskElement = document.querySelector(`[data-task-id="${id}"]`);
        if (taskElement) {
            taskElement.classList.add('completed');
            
            // Add a subtle animation
            taskElement.style.transform = 'scale(0.98)';
            setTimeout(() => {
                taskElement.style.transform = 'scale(1)';
            }, 100);
        }
        
        // Award coins
        addCoins(COIN_REWARD_TASK, `+${COIN_REWARD_TASK} coins for completing a task!`);
        
        // Check if all tasks are completed for daily bonus
        checkDailyCompletion();
    } else if (task) {
        // Task was unchecked
        const taskElement = document.querySelector(`[data-task-id="${id}"]`);
        if (taskElement) {
            taskElement.classList.remove('completed');
        }
    }
    
    // Re-render to update the UI
    renderTasks();
}

// Edit task text
function editTask(id, newText = null) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    // If newText is provided, update the task directly (for programmatic updates)
    if (newText !== null) {
        const trimmedText = newText.trim();
        if (trimmedText) {
            const taskIndex = tasks.findIndex(t => t.id === id);
            if (taskIndex !== -1) {
                const updatedTask = {
                    ...task,
                    text: trimmedText,
                    updatedAt: new Date().toISOString()
                };
                
                tasks[taskIndex] = updatedTask;
                saveTasks();
                renderTasks();
                showToast('Task updated successfully!');
            }
        } else if (newText === '') {
            deleteTask(id);
        }
        return;
    }
    
    // Create edit dialog
    const dialog = document.createElement('div');
    dialog.className = 'edit-dialog';
    dialog.innerHTML = `
        <div class="dialog-content">
            <h3>Edit Task</h3>
            <textarea class="edit-textarea" placeholder="Enter task description...">${escapeHtml(task.text)}</textarea>
            <div class="dialog-buttons">
                <button class="btn btn-cancel">Cancel</button>
                <button class="btn btn-save">Save Changes</button>
            </div>
        </div>
    `;
    
    // Add to DOM
    document.body.appendChild(dialog);
    
    // Focus the textarea
    const textarea = dialog.querySelector('.edit-textarea');
    textarea.focus();
    textarea.select();
    
    // Add event listeners
    const saveBtn = dialog.querySelector('.btn-save');
    const cancelBtn = dialog.querySelector('.btn-cancel');
    
    const saveChanges = () => {
        const newText = textarea.value.trim();
        const taskIndex = tasks.findIndex(t => t.id === id);
        
        if (newText && taskIndex !== -1) {
            const updatedTask = {
                ...task,
                text: newText,
                updatedAt: new Date().toISOString()
            };
            
            tasks[taskIndex] = updatedTask;
            saveTasks();
            renderTasks();
            showToast('Task updated successfully!');
            closeDialog();
        } else if (!newText) {
            // If text is empty, ask if they want to delete
            if (confirm('Task text is empty. Would you like to delete this task instead?')) {
                deleteTask(id, true); // Skip confirmation
                closeDialog();
            } else {
                textarea.focus();
            }
        }
    };
    
    const closeDialog = () => {
        if (document.body.contains(dialog)) {
            document.body.removeChild(dialog);
        }
    };
    
    saveBtn.addEventListener('click', saveChanges);
    cancelBtn.addEventListener('click', closeDialog);
    
    // Save on Enter, close on Escape
    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            saveChanges();
        } else if (e.key === 'Escape') {
            closeDialog();
        }
    });
    
    // Close on outside click
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
            closeDialog();
        }
    });
    
    // Helper function to escape HTML
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}

// Delete a task
function deleteTask(id, skipConfirm = false) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    // Skip confirmation if explicitly set to true
    if (skipConfirm) {
        performDelete();
        return;
    }
    
    // Create a custom confirmation dialog
    const dialog = document.createElement('div');
    dialog.className = 'confirmation-dialog';
    dialog.innerHTML = `
        <div class="dialog-content">
            <h3>Delete Task</h3>
            <p>Are you sure you want to delete this task?</p>
            <p class="task-preview">"${task.text.length > 50 ? task.text.substring(0, 50) + '...' : task.text}"</p>
            <div class="dialog-buttons">
                <button class="btn btn-cancel">Cancel</button>
                <button class="btn btn-confirm">Delete</button>
            </div>
        </div>
    `;
    
    // Add to DOM
    document.body.appendChild(dialog);
    
    // Add event listeners
    const confirmBtn = dialog.querySelector('.btn-confirm');
    const cancelBtn = dialog.querySelector('.btn-cancel');
    
    const performDelete = () => {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
        updateTaskCount();
        showToast('Task deleted');
        
        // Remove dialog
        if (document.body.contains(dialog)) {
            document.body.removeChild(dialog);
        }
    };
    
    const closeDialog = () => {
        if (document.body.contains(dialog)) {
            document.body.removeChild(dialog);
        }
    };
    
    confirmBtn.addEventListener('click', performDelete);
    cancelBtn.addEventListener('click', closeDialog);
    
    // Close on outside click
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
            closeDialog();
        }
    });
    
    // Close on Escape key
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            closeDialog();
            document.removeEventListener('keydown', handleKeyDown);
        }
    };
    
    document.addEventListener('keydown', handleKeyDown);
}

// Clear all completed tasks
function clearCompleted() {
    const completedCount = tasks.filter(task => task.completed).length;
    
    if (completedCount === 0) {
        showToast('No completed tasks to clear');
        return;
    }
    
    if (confirm(`Are you sure you want to clear ${completedCount} completed ${completedCount === 1 ? 'task' : 'tasks'}?`)) {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        updateTaskCount();
        renderTasks();
        
        // Show feedback
        showToast(`Cleared ${completedCount} ${completedCount === 1 ? 'task' : 'tasks'}`);
    }
}

// Save tasks to localStorage
function saveTasks() {
    saveUserData();
}

// Save user data to localStorage
function saveUser() {
    // Make sure we have the latest data before saving
    const data = {
        user: user,
        tasks: tasks,
        leaderboard: leaderboard
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Save all user data to localStorage
function saveUserData() {
    // Ensure leaderboard is updated before saving
    updateLeaderboard();
    
    const data = {
        user: user,
        tasks: tasks,
        leaderboard: leaderboard
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Load user data from localStorage
function loadUserData() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            
            // Initialize user data with defaults if not present
            user = {
                name: data.user?.name || '',
                coins: data.user?.coins || 0,
                lastCompletedDate: data.user?.lastCompletedDate || null,
                dailyStreak: data.user?.dailyStreak || 0
            };
            
            tasks = data.tasks || [];
            leaderboard = data.leaderboard || [];
            
            // Check if it's a new day for daily streak
            checkDailyStreak();
            
            // If user is logged in, show the app
            if (user.name) {
                showApp();
            } else {
                showLogin();
            }
        } catch (e) {
            console.error('Error loading user data:', e);
            // Reset to default values if there's an error
            user = { name: '', coins: 0, lastCompletedDate: null, dailyStreak: 0 };
            tasks = [];
            leaderboard = [];
            showLogin();
        }
    } else {
        // No saved data, show login
        showLogin();
    }
}

// Update the task counter and progress bar
function updateTaskCount() {
    const activeTasks = tasks.filter(task => !task.completed).length;
    const totalTasks = tasks.length;
    const taskWord = activeTasks === 1 ? 'task' : 'tasks';
    
    if (taskCount) {
        taskCount.textContent = `${activeTasks} ${taskWord} left`;
    }
    
    // Update coin count display
    if (coinCount) {
        coinCount.textContent = user.coins;
    }
    
    // Update progress bar
    updateProgressBar(totalTasks, activeTasks);
    
    // Check for daily completion bonus
    if (totalTasks > 0 && activeTasks === 0) {
        checkDailyCompletion();
    }
}

// Update the progress bar
function updateProgressBar(totalTasks, activeTasks) {
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    if (!progressBar || !progressText) return;
    
    if (totalTasks === 0 || isNaN(totalTasks) || isNaN(activeTasks)) {
        progressBar.style.width = '0%';
        progressText.textContent = '0% Complete';
        progressBar.style.backgroundColor = '#4caf50'; // Default color
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
    li.setAttribute('data-task-id', task.id);
    
    if (task.completed) {
        li.classList.add('completed');
    }
    
    // Create checkbox container
    const checkboxContainer = document.createElement('div');
    checkboxContainer.className = 'checkbox-container';
    
    // Create custom checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `task-${task.id}`;
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTask(task.id));
    
    // Create custom checkbox appearance
    const checkmark = document.createElement('span');
    checkmark.className = 'checkmark';
    
    // Add checkmark icon when checked
    if (task.completed) {
        const checkIcon = document.createElement('i');
        checkIcon.className = 'fas fa-check';
        checkmark.appendChild(checkIcon);
    }
    
    // Add checkbox and checkmark to container
    checkboxContainer.appendChild(checkbox);
    checkboxContainer.appendChild(checkmark);
    
    // Create task content container
    const taskContent = document.createElement('div');
    taskContent.className = 'task-content';
    
    // Create task text
    const taskText = document.createElement('span');
    taskText.className = 'task-text';
    taskText.textContent = task.text;
    
    // Create task metadata (creation time)
    const taskMeta = document.createElement('div');
    taskMeta.className = 'task-meta';
    
    if (task.createdAt) {
        const createdAt = new Date(task.createdAt);
        const timeString = createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateString = createdAt.toLocaleDateString();
        
        const timeElement = document.createElement('span');
        timeElement.className = 'task-time';
        timeElement.textContent = `${timeString} • ${dateString}`;
        timeElement.title = `Created on ${dateString} at ${timeString}`;
        
        taskMeta.appendChild(timeElement);
    }
    
    // Add text and metadata to content
    taskContent.appendChild(taskText);
    taskContent.appendChild(taskMeta);
    
    // Create action buttons container
    const taskActions = document.createElement('div');
    taskActions.className = 'task-actions';
    
    // Edit button
    const editButton = document.createElement('button');
    editButton.className = 'task-action edit-task';
    editButton.title = 'Edit task';
    editButton.innerHTML = '<i class="fas fa-edit"></i>';
    editButton.addEventListener('click', (e) => {
        e.stopPropagation();
        editTask(task.id);
    });
    
    // Delete button
    const deleteButton = document.createElement('button');
    deleteButton.className = 'task-action delete-task';
    deleteButton.title = 'Delete task';
    deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
    deleteButton.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteTask(task.id);
    });
    
    // Add buttons to actions container
    taskActions.appendChild(editButton);
    taskActions.appendChild(deleteButton);
    
    // Add all elements to task item
    li.appendChild(checkboxContainer);
    li.appendChild(taskContent);
    li.appendChild(taskActions);
    
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
    // Clear the task list
    if (!taskList) return;
    
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
    
    // Sort tasks: completed at bottom, then by creation date (newest first)
    filteredTasks.sort((a, b) => {
        // Completed tasks go to the bottom
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        
        // Sort by creation date (newest first)
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
    });
    
    // Add tasks to the list
    if (filteredTasks.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.className = 'empty-message';
        
        if (currentFilter === 'active') {
            emptyMessage.textContent = 'No active tasks';
        } else if (currentFilter === 'completed') {
            emptyMessage.textContent = 'No completed tasks';
        } else {
            emptyMessage.textContent = 'No tasks yet. Add one above!';
        }
        
        taskList.appendChild(emptyMessage);
    } else {
        filteredTasks.forEach(task => {
            const taskElement = createTaskElement(task);
            if (task.completed) {
                taskElement.classList.add('completed');
            }
            taskList.appendChild(taskElement);
        });
    }
    
    // Update the active filter button
    updateActiveFilterButton();
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    init();
    if (startBtn) startBtn.addEventListener('click', startApp);
    if (leaderboardBtn) leaderboardBtn.addEventListener('click', toggleLeaderboard);
    
    // Close leaderboard when clicking outside
    document.addEventListener('click', (e) => {
        if (leaderboardContainer && !leaderboardContainer.contains(e.target) && 
            leaderboardBtn && !leaderboardBtn.contains(e.target)) {
            leaderboardContainer.classList.remove('show');
        }
    });
});

// Load user data from localStorage
function loadUserData() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
        const data = JSON.parse(savedData);
        user = data.user || user;
        tasks = data.tasks || [];
        leaderboard = data.leaderboard || [];
        
        // Check if it's a new day for daily streak
        checkDailyStreak();
        
        // If user is logged in, show the app
        if (user.name) {
            showApp();
        } else {
            showLogin();
        }
    } else {
        showLogin();
    }
}

// Save user data to localStorage
function saveUserData() {
    const data = {
        user,
        tasks,
        leaderboard
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Show login modal
function showLogin() {
    if (loginModal) loginModal.style.display = 'flex';
    if (document.querySelector('.taskmaster-container')) {
        document.querySelector('.taskmaster-container').style.display = 'none';
    }
}

// Show the main app
function showApp() {
    if (loginModal) loginModal.style.display = 'none';
    const container = document.querySelector('.taskmaster-container');
    if (container) container.style.display = 'block';
    
    if (userGreeting) userGreeting.textContent = user.name;
    if (coinCount) coinCount.textContent = user.coins;
    
    // Update leaderboard with current user
    updateLeaderboard();
}

// Start the app with username
function startApp() {
    const username = usernameInput.value.trim();
    if (username) {
        user.name = username;
        user.coins = user.coins || 0;
        user.lastCompletedDate = user.lastCompletedDate || new Date().toISOString();
        user.dailyStreak = user.dailyStreak || 0;
        
        saveUserData();
        showApp();
        showToast(`Welcome, ${user.name}! Start completing tasks to earn coins!`);
    } else {
        alert('Please enter your name to continue');
    }
}

// Add coins to user's balance
function addCoins(amount, message) {
    if (!user.coins) user.coins = 0;
    user.coins += amount;
    if (coinCount) coinCount.textContent = user.coins;
    saveUserData();

    if (message) {
        showToast(message);
    }

    // Update leaderboard when coins are added
    updateLeaderboard();

    // Check for daily completion bonus when coins are added
    checkDailyCompletion();
}

// Show toast notification
function showToast(message, duration = 3000) {
    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// Toggle leaderboard visibility
function toggleLeaderboard() {
    if (leaderboardContainer) {
        leaderboardContainer.classList.toggle('show');
        if (leaderboardContainer.classList.contains('show')) {
            // Update leaderboard when opened
            updateLeaderboard();
        }
    }
}

// Update leaderboard with current user data
function updateLeaderboard() {
    if (!leaderboardList) return;

    // Add current user to leaderboard if not already present
    const userIndex = leaderboard.findIndex(entry => entry.name === user.name);
    if (userIndex === -1 && user.name) {
        leaderboard.push({
            name: user.name,
            coins: user.coins || 0,
            lastUpdated: new Date().toISOString(),
            streak: user.dailyStreak || 0
        });
    } else if (userIndex !== -1) {
        // Update existing user's coins and streak
        leaderboard[userIndex].coins = user.coins || 0;
        leaderboard[userIndex].lastUpdated = new Date().toISOString();
        leaderboard[userIndex].streak = user.dailyStreak || 0;
    }

    // Sort leaderboard by coins (descending)
    leaderboard.sort((a, b) => b.coins - a.coins);

    // Keep only top 10 entries to prevent localStorage from getting too large
    if (leaderboard.length > 10) {
        leaderboard = leaderboard.slice(0, 10);
    }

    // Save updated leaderboard
    saveUserData();

    // Render leaderboard
    renderLeaderboard();
}

// Render the leaderboard
function renderLeaderboard() {
    if (!leaderboardList) return;

    // Clear current leaderboard
    leaderboardList.innerHTML = '';

    if (leaderboard.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.className = 'leaderboard-empty';
        emptyMessage.textContent = 'No entries yet. Complete tasks to earn coins!';
        leaderboardList.appendChild(emptyMessage);
        return;
    }

    // Add each leaderboard entry
    leaderboard.forEach((entry, index) => {
        const li = document.createElement('li');
        li.className = 'leaderboard-item';
        if (entry.name === user.name) {
            li.classList.add('current-user');
        }

        const rank = document.createElement('span');
        rank.className = 'leaderboard-rank';
        rank.textContent = `#${index + 1}`;

        const name = document.createElement('span');
        name.className = 'leaderboard-name';
        name.textContent = entry.name;

        const coins = document.createElement('span');
        coins.className = 'leaderboard-coins';
        coins.innerHTML = `<i class="fas fa-coins"></i> ${entry.coins}`;

        const streak = document.createElement('span');
        streak.className = 'leaderboard-streak';
        streak.innerHTML = `<i class="fas fa-fire"></i> ${entry.streak || 0}d`;

        li.appendChild(rank);
        li.appendChild(name);
        li.appendChild(coins);
        li.appendChild(streak);

        leaderboardList.appendChild(li);
    });
}

// Check and update daily streak
function checkDailyStreak() {
    if (!user.lastCompletedDate) {
        user.dailyStreak = 0;
        return;
    }

    const lastDate = new Date(user.lastCompletedDate);
    const today = new Date();

    // Reset time for comparison
    lastDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const diffDays = Math.round(Math.abs((today - lastDate) / oneDay));

    if (diffDays === 1) {
        // Consecutive day
        user.dailyStreak = (user.dailyStreak || 0) + 1;
        showToast(`🔥 Streak! ${user.dailyStreak} days in a row!`);
    } else if (diffDays > 1) {
        // Streak broken
        if (user.dailyStreak > 0) {
            showToast(`😢 Streak of ${user.dailyStreak} days broken!`);
        }
        user.dailyStreak = 0;
    }

    user.lastCompletedDate = today.toISOString();
    saveUserData();
    updateLeaderboard();
}

// Check for daily completion bonus
function checkDailyCompletion() {
    if (!user.lastCompletedDate) return;

    const lastDate = new Date(user.lastCompletedDate);
    const today = new Date();

    // Reset time for comparison
    lastDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (lastDate < today) {
        // Check if all tasks are completed
        const allCompleted = tasks.length > 0 && tasks.every(task => task.completed);

        if (allCompleted) {
            // Award bonus coins for completing all tasks
            const streakBonus = Math.min(Math.floor(user.dailyStreak / 7) * 10, 50); // Max 50% bonus
            const bonusCoins = COIN_REWARD_DAILY + Math.floor((COIN_REWARD_DAILY * streakBonus) / 100);

            addCoins(bonusCoins, `🎉 Daily bonus! +${bonusCoins} coins!`);

            // Update last completed date
            user.lastCompletedDate = today.toISOString();
            saveUserData();

            // Update streak
            checkDailyStreak();
        }
    }
    
    return false;
}
