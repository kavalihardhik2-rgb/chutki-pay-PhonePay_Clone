# Chutki Pay - demo wallet

A phone-first payments app UI with a working fake wallet, built with plain **HTML**, **CSS** and **JavaScript**. "Chutki Pay" is an invented brand; no real money moves and nothing is sent to a server.

The demo is branded for **Hardhik** and always clearly identifies itself as a front-end-only experience.

## Run it

Open `index.html` in a browser. To see the phone layout on a laptop, open DevTools and switch on the device toolbar.

## What works

- **Login screen** before the wallet: enter any valid name, email and non-empty demo password. Login state is saved locally so the screen is not shown again on every refresh.
- **Wallet balance** with show/hide.
- **Send money**: checks the name, a 10-digit mobile number, the amount, the balance and a PIN (demo PIN: `1234`). This only updates local demo data.
- **Add money** with quick-amount chips.
- **Transaction history** that updates after every action.
- **Dark mode** with a theme toggle in the header. The choice is saved in `localStorage`.
- **Demo service and navigation actions** with clear preview feedback rather than real bill, QR, offer or transfer services.
- **Saved data**: balance, history, login and theme preferences stay after a refresh (stored in `localStorage`). Tap the avatar to reset wallet data; use Profile to log out.

## How the code is organised (`script.js`)

1. **State** - one object holding balance and transactions. Money is stored in paise (whole numbers) to avoid decimal errors.
2. **Helpers** - formatting rupees and dates, the toast message.
3. **Rendering** - functions that draw the screen from the state.
4. **Actions** - `sendMoney` and `addMoney`, the only places that change the state.
5. **Wiring** - event listeners connecting buttons and forms to the actions.

## Demo limitations

This project has no backend, authentication service, database or payment gateway. All login state, wallet changes and transactions are fake and stored only in this browser's `localStorage`. The service and navigation items are intentionally preview interactions; they do not call billers, scan a camera or transfer money.

## If this becomes a real product

Move authentication, balances, PIN checks and every payment operation to a secure server. Add a database and a payment gateway's test mode (for example, Razorpay or Stripe) before considering real-money functionality. Anything in browser JavaScript can be edited by the user.
