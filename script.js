// Chutki Pay - demo wallet logic.
// Everything is fake and lives in this browser's localStorage. No server, no real money.

// ---------- 1. State ----------
// Money is stored in PAISE (whole numbers), never in rupees with decimals.
// 0.1 + 0.2 is not exactly 0.3 in JavaScript, so decimals are unsafe for money.

const STORAGE_KEY = "chutkiPayState";
const AUTH_KEY = "chutkiPayLoggedIn";
const THEME_KEY = "chutkiPayTheme";
const DEMO_PIN = "1234";

const defaultState = {
    balance: 250000, // Rs 2,500.00
    hideBalance: false,
    transactions: [
        { id: 3, type: "debit", title: "Paid to Hardhik", amount: 45000, time: Date.now() - 2 * 60 * 60 * 1000 },
        { id: 2, type: "debit", title: "Paid to Chai Point", amount: 6000, time: Date.now() - 26 * 60 * 60 * 1000 },
        { id: 1, type: "credit", title: "Added to wallet", amount: 300000, time: Date.now() - 50 * 60 * 60 * 1000 },
    ],
};

function loadState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
    } catch (error) {
        // Storage can be blocked or hold bad data; fall back to the defaults.
    }
    return structuredClone(defaultState);
}

function saveState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        // The app still works for this visit even if saving fails.
    }
}

let state = loadState();

const loginScreen = document.getElementById("loginScreen");
const app = document.querySelector(".app");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

function isLoggedIn() {
    return localStorage.getItem(AUTH_KEY) === "true";
}

function showWallet() {
    loginScreen.hidden = true;
    app.hidden = false;
}

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    document.body.dataset.theme = theme;
    const toggle = document.getElementById("themeToggle");
    toggle.textContent = theme === "dark" ? "☀" : "☾";
    toggle.title = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
    toggle.setAttribute("aria-label", toggle.title);
}

function loadTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    applyTheme(savedTheme === "dark" ? "dark" : "light");
}

// ---------- 2. Helpers ----------

const rupeeFormat = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });

function formatPaise(paise) {
    return rupeeFormat.format(paise / 100);
}

// Turns what the user typed ("120.50") into paise (12050). Returns null if invalid.
function rupeesToPaise(text) {
    const rupees = Number(text);
    if (text.trim() === "" || !Number.isFinite(rupees) || rupees <= 0) return null;
    return Math.round(rupees * 100);
}

function formatTime(timestamp) {
    return new Date(timestamp).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
    });
}

let toastTimer;
function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}

// ---------- 3. Rendering: draw the screen from the state ----------

function renderBalance() {
    const amount = document.getElementById("balanceAmount");
    const toggle = document.getElementById("toggleBalanceBtn");
    amount.textContent = state.hideBalance ? "₹ ••••••" : formatPaise(state.balance);
    toggle.textContent = state.hideBalance ? "Show" : "Hide";
}

function renderTransactions() {
    const list = document.getElementById("txnList");
    const emptyState = document.getElementById("emptyState");
    list.replaceChildren(); // clear the old rows

    for (const txn of state.transactions) {
        const row = document.createElement("li");
        row.className = "txn";

        const badge = document.createElement("span");
        badge.className = "txn-badge";
        badge.textContent = txn.type === "credit" ? "↓" : txn.type === "request" ? "?" : "↑";

        const details = document.createElement("div");
        details.className = "txn-details";

        const title = document.createElement("p");
        title.className = "txn-title";
        title.textContent = txn.title; // textContent, not innerHTML: user-typed names stay plain text

        const meta = document.createElement("p");
        meta.className = "txn-meta";
        meta.textContent = formatTime(txn.time);

        const amount = document.createElement("span");
        amount.className = "txn-amount " + txn.type;
        amount.textContent = txn.type === "credit"
            ? "+ " + formatPaise(txn.amount)
            : txn.type === "request" ? "Requested " + formatPaise(txn.amount) : "- " + formatPaise(txn.amount);

        details.append(title, meta);
        row.append(badge, details, amount);
        list.append(row);
    }

    list.hidden = state.transactions.length === 0;
    emptyState.hidden = state.transactions.length > 0;
}

function render() {
    renderBalance();
    renderTransactions();
}

// ---------- 4. Actions: the only places that change the state ----------

function addTransaction(type, title, amount) {
    state.transactions.unshift({ id: Date.now(), type, title, amount, time: Date.now() });
}

// Returns an error message, or null when the payment went through.
function sendMoney(name, phone, amountText, pin) {
    const amount = rupeesToPaise(amountText);

    if (name.trim().length < 2) return "Enter the recipient's name.";
    if (!/^[6-9]\d{9}$/.test(phone)) return "Enter a valid 10-digit mobile number.";
    if (amount === null) return "Enter an amount greater than zero.";
    if (amount > state.balance) return "Not enough balance. You have " + formatPaise(state.balance) + ".";
    if (pin !== DEMO_PIN) return "Wrong PIN.";

    state.balance -= amount;
    addTransaction("debit", "Paid to " + name.trim(), amount);
    saveState();
    return null;
}

function addMoney(amountText) {
    const amount = rupeesToPaise(amountText);

    if (amount === null) return "Enter an amount greater than zero.";
    if (amount > 10000000) return "You can add up to ₹1,00,000 at a time.";

    state.balance += amount;
    addTransaction("credit", "Added to wallet", amount);
    saveState();
    return null;
}

function requestMoney(name, phone, amountText) {
    const amount = rupeesToPaise(amountText);
    if (name.trim().length < 2) return "Enter the person's name.";
    if (!/^[6-9]\d{9}$/.test(phone)) return "Enter a valid 10-digit mobile number.";
    if (amount === null) return "Enter an amount greater than zero.";

    addTransaction("request", "Requested from " + name.trim(), amount);
    saveState();
    return null;
}

function payBill(service, reference, amountText, pin) {
    const amount = rupeesToPaise(amountText);
    if (reference.trim().length < 3) return "Enter a valid customer or account number.";
    if (amount === null) return "Enter an amount greater than zero.";
    if (amount > state.balance) return "Not enough balance. You have " + formatPaise(state.balance) + ".";
    if (pin !== DEMO_PIN) return "Wrong PIN.";

    state.balance -= amount;
    addTransaction("debit", service + " · " + reference.trim(), amount);
    saveState();
    return null;
}

// ---------- 5. Wiring: connect buttons and forms to the actions ----------

const sendDialog = document.getElementById("sendDialog");
const addDialog = document.getElementById("addDialog");
const requestDialog = document.getElementById("requestDialog");
const billDialog = document.getElementById("billDialog");
const qrDialog = document.getElementById("qrDialog");
const viewDialog = document.getElementById("viewDialog");
const sendForm = document.getElementById("sendForm");
const addForm = document.getElementById("addForm");
const requestForm = document.getElementById("requestForm");
const billForm = document.getElementById("billForm");
const qrForm = document.getElementById("qrForm");

document.getElementById("openSendBtn").addEventListener("click", () => {
    sendForm.reset();
    document.getElementById("sendError").textContent = "";
    sendDialog.showModal();
});

document.getElementById("openAddBtn").addEventListener("click", () => {
    addForm.reset();
    document.getElementById("addError").textContent = "";
    addDialog.showModal();
});

document.getElementById("openRequestBtn").addEventListener("click", () => {
    requestForm.reset();
    document.getElementById("requestError").textContent = "";
    requestDialog.showModal();
});

document.getElementById("openQrBtn").addEventListener("click", () => {
    qrForm.reset();
    document.getElementById("qrError").textContent = "";
    qrDialog.showModal();
});

// Any button with data-close shuts the dialog it sits in.
document.querySelectorAll("[data-close]").forEach((button) => {
    button.addEventListener("click", () => button.closest("dialog").close());
});

sendForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("sendName").value;
    const error = sendMoney(
        name,
        document.getElementById("sendPhone").value,
        document.getElementById("sendAmount").value,
        document.getElementById("sendPin").value
    );

    if (error) {
        document.getElementById("sendError").textContent = error;
        return;
    }
    sendDialog.close();
    render();
    showToast("Payment to " + name.trim() + " successful");
});

addForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const error = addMoney(document.getElementById("addAmount").value);

    if (error) {
        document.getElementById("addError").textContent = error;
        return;
    }
    addDialog.close();
    render();
    showToast("Money added to wallet");
});

requestForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("requestName").value;
    const error = requestMoney(
        name,
        document.getElementById("requestPhone").value,
        document.getElementById("requestAmount").value
    );
    if (error) {
        document.getElementById("requestError").textContent = error;
        return;
    }
    requestDialog.close();
    render();
    showToast("Request sent to " + name.trim());
});

let selectedBill = "";
document.querySelectorAll("[data-bill]").forEach((button) => {
    button.addEventListener("click", () => {
        selectedBill = button.dataset.bill;
        document.getElementById("billTitle").textContent = selectedBill;
        billForm.reset();
        document.getElementById("billError").textContent = "";
        billDialog.showModal();
    });
});

document.getElementById("openMoreServicesBtn").addEventListener("click", () => {
    showView("services");
});

billForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const error = payBill(
        selectedBill,
        document.getElementById("billReference").value,
        document.getElementById("billAmount").value,
        document.getElementById("billPin").value
    );
    if (error) {
        document.getElementById("billError").textContent = error;
        return;
    }
    billDialog.close();
    render();
    showToast(selectedBill + " paid successfully");
});

qrForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const id = document.getElementById("qrId").value.trim().toLowerCase();
    if (!/^[a-z0-9._-]+@chutki$/.test(id)) {
        document.getElementById("qrError").textContent = "Enter a valid Chutki ID, such as priya@chutki.";
        return;
    }
    const recipient = id.split("@")[0].replace(/[._-]/g, " ");
    document.getElementById("sendName").value = recipient.replace(/\b\w/g, (letter) => letter.toUpperCase());
    document.getElementById("sendPhone").value = "";
    document.getElementById("sendAmount").value = "";
    document.getElementById("sendPin").value = "";
    qrDialog.close();
    document.getElementById("sendError").textContent = "";
    sendDialog.showModal();
});

// Quick-amount chips fill the amount box.
document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
        document.getElementById("addAmount").value = chip.dataset.amount;
    });
});

document.getElementById("toggleBalanceBtn").addEventListener("click", () => {
    state.hideBalance = !state.hideBalance;
    saveState();
    renderBalance();
});

// Tapping the avatar resets the demo data.
document.getElementById("resetBtn").addEventListener("click", () => {
    state = structuredClone(defaultState);
    saveState();
    render();
    showToast("Demo data reset");
});

function showView(view) {
    const content = document.getElementById("viewContent");
    content.replaceChildren();
    const heading = document.createElement("h2");
    heading.textContent = view === "history"
        ? "All transactions"
        : view === "offers" ? "Offers" : view === "services" ? "More services" : "Profile";
    content.append(heading);

    if (view === "history") {
        const history = document.createElement("ul");
        history.className = "txn-list view-list";
        for (const transaction of state.transactions) {
            const row = document.createElement("li");
            row.className = "txn";
            const details = document.createElement("div");
            details.className = "txn-details";
            const title = document.createElement("p");
            title.className = "txn-title";
            title.textContent = transaction.title;
            const meta = document.createElement("p");
            meta.className = "txn-meta";
            meta.textContent = formatTime(transaction.time);
            details.append(title, meta);
            const amount = document.createElement("span");
            amount.className = "txn-amount " + transaction.type;
            amount.textContent = transaction.type === "credit"
                ? "+ " + formatPaise(transaction.amount)
                : transaction.type === "request"
                    ? "Requested " + formatPaise(transaction.amount)
                    : "- " + formatPaise(transaction.amount);
            row.append(details, amount);
            history.append(row);
        }
        content.append(history);
    } else if (view === "offers") {
        const offers = document.createElement("div");
        offers.className = "offer-list";
        offers.innerHTML = `
            <article class="offer"><strong>₹50 cashback</strong><span>On your next demo bill payment</span><button type="button" class="primary-btn offer-btn">Redeem</button></article>
            <article class="offer"><strong>Zero demo fees</strong><span>Send money without extra charges</span><button type="button" class="primary-btn offer-btn">Redeem</button></article>
            <article class="offer"><strong>Bonus ₹100</strong><span>Add money and get a demo bonus</span><button type="button" class="primary-btn offer-btn">Redeem</button></article>`;
        offers.querySelectorAll(".offer-btn").forEach((button) => {
            button.addEventListener("click", () => {
                button.textContent = "Redeemed";
                button.disabled = true;
                showToast("Offer redeemed for this demo");
            });
        });
        content.append(offers);
    } else if (view === "services") {
        const services = document.createElement("div");
        services.className = "service-list";
        services.innerHTML = ["Mobile recharge", "Electricity bill", "DTH recharge", "Water bill", "Gas booking", "Broadband bill", "Rent payment"]
            .map((service) => `<button type="button" class="secondary-btn service-btn" data-service="${service}">${service}</button>`)
            .join("");
        services.querySelectorAll("[data-service]").forEach((button) => {
            button.addEventListener("click", () => {
                selectedBill = button.dataset.service;
                document.getElementById("billTitle").textContent = selectedBill;
                billForm.reset();
                document.getElementById("billError").textContent = "";
                viewDialog.close();
                billDialog.showModal();
            });
        });
        content.append(services);
    } else {
        const profile = document.createElement("div");
        profile.className = "profile-details";
        profile.innerHTML = "<p><strong>Hardhik</strong></p><p class=\"sheet-copy\">hardhik@chutki</p><p class=\"sheet-copy\">Demo account · No real payments</p>";
        const logout = document.createElement("button");
        logout.type = "button";
        logout.className = "secondary-btn logout-btn";
        logout.textContent = "Log out";
        logout.addEventListener("click", logoutUser);
        profile.append(logout);
        content.append(profile);
    }
    viewDialog.showModal();
}

function logoutUser() {
    localStorage.removeItem(AUTH_KEY);
    viewDialog.close();
    app.hidden = true;
    loginScreen.hidden = false;
    loginForm.reset();
    showToast("You have been logged out");
}

document.querySelectorAll("[data-view]").forEach((element) => {
    element.addEventListener("click", (event) => {
        event.preventDefault();
        document.querySelectorAll(".bottom-nav a").forEach((link) => link.classList.remove("active"));
        element.classList.add("active");
        showView(element.dataset.view);
    });
});

loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("loginName").value.trim();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (name.length < 2) {
        loginError.textContent = "Enter your name to continue.";
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        loginError.textContent = "Enter a valid email address.";
        return;
    }
    if (password.length === 0) {
        loginError.textContent = "Enter a demo password to continue.";
        return;
    }

    localStorage.setItem(AUTH_KEY, "true");
    loginError.textContent = "";
    showWallet();
    showToast("Welcome to Chutki Pay, " + name);
});

document.getElementById("themeToggle").addEventListener("click", () => {
    const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
});

loadTheme();
if (isLoggedIn()) {
    showWallet();
} else {
    app.hidden = true;
}
render();
