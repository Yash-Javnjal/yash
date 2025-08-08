
        const API_URL = "http://localhost:8080/api/expenses";
        const form = document.getElementById("expenseForm");
        const amountInput = document.getElementById("amount");
        const categoryInput = document.getElementById("category");
        const descriptionInput = document.getElementById("description");
        const messageContainer = document.getElementById("messageContainer");
        const expensesList = document.getElementById("expensesList");
        const filteredExpensesList = document.getElementById("filteredExpensesList");
        const totalAmountEl = document.getElementById("totalAmount");
        const totalExpensesEl = document.getElementById("totalExpenses");
        const avgExpenseEl = document.getElementById("avgExpense");

        let expenses = [];

        document.addEventListener("DOMContentLoaded", () => {
            loadExpenses();
            setupFilterButtons();
        });

        async function loadExpenses() {
            try {
                const res = await fetch(API_URL);
                expenses = await res.json();
                renderExpenses(expensesList, expenses);
                updateStats();
            } catch (err) {
                showMessage("Unable to load expenses from server", "error");
            }
        }

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const expense = {
                amount: parseFloat(amountInput.value),
                category: categoryInput.value,
                description: descriptionInput.value
            };

            try {
                const res = await fetch(API_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(expense)
                });

                if (!res.ok) throw new Error("Failed to add expense");

                const newExpense = await res.json();
                expenses.unshift(newExpense);
                renderExpenses(expensesList, expenses);
                updateStats();
                form.reset();
                showMessage("Expense added successfully!", "success");
            } catch (err) {
                showMessage("Failed to add expense. Please try again.", "error");
            }
        });

        async function deleteExpense(id) {
            if (!confirm("Are you sure you want to delete this expense?")) return;
            
            try {
                await fetch(`${API_URL}/${id}`, { method: "DELETE" });
                expenses = expenses.filter(e => e.id !== id);
                renderExpenses(expensesList, expenses);
                clearFilteredExpenses();
                updateStats();
                showMessage("Expense deleted successfully", "success");
            } catch (err) {
                showMessage("Failed to delete expense", "error");
            }
        }

        function getCategoryIcon(category) {
            const icons = {
                food: "🍽️",
                clothing: "👕",
                transport: "🚗",
                electronics: "📱",
                entertainment: "🎬",
                hospital: "🏥",
                other: "📋"
            };
            return icons[category] || "📋";
        }

        function renderExpenses(container, list) {
            container.innerHTML = "";
            
            if (!list.length) {
                container.innerHTML = `<div class="no-expenses">No expenses to display</div>`;
                return;
            }

            list.forEach(exp => {
                const div = document.createElement("div");
                div.className = "expense-item";
                div.innerHTML = `
                    <div class="expense-icon">${getCategoryIcon(exp.category)}</div>
                    <div class="expense-info">
                        <div class="expense-name">${exp.description}</div>
                        <div class="expense-category">${exp.category}</div>
                    </div>
                    <div class="expense-amount">
                        <div class="expense-price">Rs.${exp.amount.toFixed(2)}</div>
                        <button class="delete-btn" onclick="deleteExpense(${exp.id})">Delete</button>
                    </div>
                `;
                container.appendChild(div);
            });
        }

        function clearFilteredExpenses() {
            filteredExpensesList.innerHTML = `<div class="no-expenses">Select a category to filter expenses</div>`;
        }

        function updateStats() {
            const total = expenses.reduce((sum, e) => sum + e.amount, 0);
            const avg = expenses.length ? total / expenses.length : 0;

            totalAmountEl.textContent = `Rs.${total.toFixed(2)}`;
            totalExpensesEl.textContent = expenses.length;
            avgExpenseEl.textContent = `Rs.${avg.toFixed(2)}`;
        }

        function showMessage(msg, type) {
            messageContainer.innerHTML = `
                <div class="${type === 'success' ? 'success-message' : 'error-message'}">
                    ${msg}
                </div>
            `;
            setTimeout(() => {
                messageContainer.innerHTML = "";
            }, 4000);
        }

        function setupFilterButtons() {
            document.querySelectorAll(".filter-btn").forEach(btn => {
                btn.addEventListener("click", () => {
                    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
                    btn.classList.add("active");

                    const category = btn.getAttribute("data-category");

                    if (!category) {
                        renderExpenses(filteredExpensesList, expenses);
                    } else {
                        const filtered = expenses.filter(e => e.category === category);
                        renderExpenses(filteredExpensesList, filtered);
                    }
                });
            });
        }
