// DOM Elements
const incomeForm = document.getElementById('income-form');
const expenseForm = document.getElementById('expense-form');
const incomeList = document.getElementById('income-list');
const expenseList = document.getElementById('expense-list');
const totalIncomeElement = document.getElementById('total-income');
const totalExpensesElement = document.getElementById('total-expenses');
const balanceAmountElement = document.getElementById('balance-amount');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const importFile = document.getElementById('import-file');
const installBtn = document.getElementById('install-btn');
const clearBtn = document.getElementById('clear-btn');
const notification = document.getElementById('notification');

// Data structure
let budgetData = {
    income: [],
    expenses: [],
    // savingsGoal: 0,
    lastUpdated: new Date().toISOString()
};

// Initialize the app
function init() {
    loadData();
    renderData();
    setupEventListeners();
    setupPWA();
}

// Set up event listeners
function setupEventListeners() {
    incomeForm.addEventListener('submit', addIncome);
    expenseForm.addEventListener('submit', addExpense);
    exportBtn.addEventListener('click', exportData);
    importBtn.addEventListener('click', triggerImport);
    importFile.addEventListener('change', importData);
    clearBtn.addEventListener('click', clearData);
}

// Load data from localStorage
function loadData() {
    const savedData = localStorage.getItem('budgetData');
    if (savedData) {
        budgetData = JSON.parse(savedData);
    }
}

// Save data to localStorage
function saveData() {
    budgetData.lastUpdated = new Date().toISOString();
    localStorage.setItem('budgetData', JSON.stringify(budgetData));
}

// Render data to the UI
function renderData() {
    renderIncome();
    renderExpenses();
    updateSummary();
}

// Render income list
function renderIncome() {
    incomeList.innerHTML = '';
    budgetData.income.forEach((income, index) => {
        const li = document.createElement('li');
        li.className = 'transaction-item';
        li.innerHTML = `
            <span class="transaction-name">${income.source}</span>
            <span class="transaction-amount income-amount">£${income.amount.toFixed(2)}</span>
            <button class="delete-btn" data-type="income" data-index="${index}">
                <i class="fas fa-trash"></i>
            </button>
        `;
        incomeList.appendChild(li);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-btn[data-type="income"]').forEach(btn => {
        btn.addEventListener('click', deleteItem);
    });
    
    // Update total income
    const totalIncome = budgetData.income.reduce((total, income) => total + income.amount, 0);
    totalIncomeElement.textContent = `£${totalIncome.toFixed(2)}`;
}

// Render expenses list
function renderExpenses() {
    expenseList.innerHTML = '';
    budgetData.expenses.forEach((expense, index) => {
        const li = document.createElement('li');
        li.className = 'transaction-item';
        li.innerHTML = `
            <span class="transaction-name">${expense.category}</span>
            <span class="transaction-amount expense-amount">£${expense.amount.toFixed(2)}</span>
            <button class="delete-btn" data-type="expense" data-index="${index}">
                <i class="fas fa-trash"></i>
            </button>
        `;
        expenseList.appendChild(li);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-btn[data-type="expense"]').forEach(btn => {
        btn.addEventListener('click', deleteItem);
    });
    
    // Update total expenses
    const totalExpenses = budgetData.expenses.reduce((total, expense) => total + expense.amount, 0);
    totalExpensesElement.textContent = `£${totalExpenses.toFixed(2)}`;
}

// Update summary
function updateSummary() {
    const totalIncome = budgetData.income.reduce((total, income) => total + income.amount, 0);
    const totalExpenses = budgetData.expenses.reduce((total, expense) => total + expense.amount, 0);
    const balance = totalIncome - totalExpenses;
    
    balanceAmountElement.textContent = `£${balance.toFixed(2)}`;
    
    if (balance >= 0) {
        balanceAmountElement.classList.remove('negative');
        balanceAmountElement.classList.add('positive');
    } else {
        balanceAmountElement.classList.remove('positive');
        balanceAmountElement.classList.add('negative');
    }
    
    // Update savings goal
    // const savingsGoalInput = document.getElementById('savings-goal');
    // savingsGoalInput.value = budgetData.savingsGoal || '';
    // savingsGoalInput.addEventListener('change', () => {
    //     budgetData.savingsGoal = parseFloat(savingsGoalInput.value) || 0;
    //     saveData();
    // });
}

// Add income
function addIncome(e) {
    e.preventDefault();
    
    const source = document.getElementById('income-source');
    const amount = document.getElementById('income-amount');
    
    if (source.value.trim() === '' || amount.value === '') {
        showNotification('Please fill all fields', 'error');
        return;
    }
    
    budgetData.income.push({
        source: source.value.trim(),
        amount: parseFloat(amount.value),
        date: new Date().toISOString()
    });
    
    saveData();
    renderData();
    
    // Reset form
    source.value = '';
    amount.value = '';
    
    showNotification('Income added successfully!');
}

// Add expense
function addExpense(e) {
    e.preventDefault();
    
    const category = document.getElementById('expense-category');
    const amount = document.getElementById('expense-amount');
    
    // if (category.value === '' || amount.value === '') {
    //     showNotification('Please fill all fields', 'error');
    //     return;
    // }

    if (category.value.trim() === '' || amount.value === '') {
        showNotification('Please fill all fields', 'error');
        return;
    }
    
    budgetData.expenses.push({
        category: category.value.trim(),
        amount: parseFloat(amount.value),
        date: new Date().toISOString()
    });
    
    saveData();
    renderData();
    
    // Reset form
    category.value = '';
    amount.value = '';
    
    showNotification('Expense added successfully!');
}

// Delete item
function deleteItem(e) {
    const type = e.currentTarget.getAttribute('data-type');
    const index = parseInt(e.currentTarget.getAttribute('data-index'));
    
    if (type === 'income') {
        budgetData.income.splice(index, 1);
    } else {
        budgetData.expenses.splice(index, 1);
    }
    
    saveData();
    renderData();
    
    showNotification('Item deleted successfully!');
}

// Export data
function exportData() {
    const dataStr = JSON.stringify(budgetData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'budget-data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Data exported successfully!');
}

// Trigger import
function triggerImport() {
    importFile.click();
}

// Import data
function importData(e) {
    const file = e.target.files[0];
    
    if (!file) {
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // Validate the imported data structure
            if (importedData && Array.isArray(importedData.income) && Array.isArray(importedData.expenses)) {
                budgetData = importedData;
                saveData();
                renderData();
                showNotification('Data imported successfully!');
            } else {
                showNotification('Invalid file format', 'error');
            }
        } catch (error) {
            showNotification('Error parsing JSON file', 'error');
            console.error(error);
        }
    };
    
    reader.readAsText(file);
    
    // Reset the file input
    e.target.value = '';
}

// Clear data
function clearData() {
    if (confirm("Are you sure you want to delete all saved date? This action cannot be undone.")) {
        localStorage.clear();
        localStorage.reload();
    }
}

// Show notification
function showNotification(message, type = 'success') {
    notification.textContent = message;
    
    if (type === 'error') {
        notification.style.backgroundColor = '#f72585';
    } else {
        notification.style.backgroundColor = '#4cc9f0';
    }
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// PWA setup
function setupPWA() {
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installBtn.classList.remove('hidden');
    });
    
    installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) {
            return;
        }
        
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            installBtn.classList.add('hidden');
        }
        
        deferredPrompt = null;
    });
}

// Initialize the app
init();
