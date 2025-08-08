const API_URL = "http://localhost:8080/api/expenses";
const entryForm = document.getElementById("entry-form");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const descInput = document.getElementById("description");
const msgArea = document.getElementById("message-area");
const recentList = document.getElementById("recent-list");
const filteredList = document.getElementById("filtered-list");
const totalAmountEl = document.getElementById("total-amount");
const totalEntriesEl = document.getElementById("total-entries");
const avgEntryEl = document.getElementById("avg-entry");

let entries = [];

document.addEventListener("DOMContentLoaded", () => {
    loadEntries();
    setupFilterBtns();
});

async function loadEntries() {
    try {
        const res = await fetch(API_URL);
        entries = await res.json();
        renderEntries(recentList, entries);
        updateStats();
    } catch (err) {
        displayMessage("Unable to load expenses from server", "error");
    }
}

entryForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const entry = {
        amount: parseFloat(amountInput.value),
        category: categoryInput.value,
        description: descInput.value
    };

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(entry)
        });

        if (!res.ok) throw new Error("Failed to add expense");

        const newEntry = await res.json();
        entries.unshift(newEntry);
        renderEntries(recentList, entries);
        updateStats();
        entryForm.reset();
        displayMessage("Expense added successfully!", "success");
    } catch (err) {
        displayMessage("Failed to add expense. Please try again.", "error");
    }
});

async function removeEntry(id) {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    
    try {
        await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        entries = entries.filter(e => e.id !== id);
        renderEntries(recentList, entries);
        clearFilteredList();
        updateStats();
        displayMessage("Expense deleted successfully", "success");
    } catch (err) {
        displayMessage("Failed to delete expense", "error");
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

function renderEntries(container, list) {
    container.innerHTML = "";
    
    if (!list.length) {
        container.innerHTML = `<div class="no-entries">No expenses to display</div>`;
        return;
    }

    list.forEach(entry => {
        const div = document.createElement("div");
        div.className = "entry-item";
        div.innerHTML = `
            <div class="entry-icon">${getCategoryIcon(entry.category)}</div>
            <div class="entry-info">
                <div class="entry-name">${entry.description}</div>
                <div class="entry-category">${entry.category}</div>
            </div>
            <div class="entry-value">
                <div class="entry-price">Rs.${entry.amount.toFixed(2)}</div>
                <button class="btn-delete" onclick="removeEntry(${entry.id})">Delete</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function clearFilteredList() {
    filteredList.innerHTML = `<div class="no-entries">Select a category to filter expenses</div>`;
}

function updateStats() {
    const total = entries.reduce((sum, e) => sum + e.amount, 0);
    const avg = entries.length ? total / entries.length : 0;

    totalAmountEl.textContent = `Rs.${total.toFixed(2)}`;
    totalEntriesEl.textContent = entries.length;
    avgEntryEl.textContent = `Rs.${avg.toFixed(2)}`;
}

function displayMessage(msg, type) {
    msgArea.innerHTML = `
        <div class="${type === 'success' ? 'success-msg' : 'error-msg'}">
            ${msg}
        </div>
    `;
    setTimeout(() => {
        msgArea.innerHTML = "";
    }, 4000);
}

function setupFilterBtns() {
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const category = btn.getAttribute("data-category");

            if (!category) {
                renderEntries(filteredList, entries);
            } else {
                const filtered = entries.filter(e => e.category === category);
                renderEntries(filteredList, filtered);
            }
        });
    });
}
