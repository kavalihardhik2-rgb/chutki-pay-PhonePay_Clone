# Chutki Pay - demo wallet

A phone-first payments app UI with a working fake wallet, built with plain **HTML**, **CSS** and **JavaScript**. "Chutki Pay" is an invented brand; no real money moves and nothing is sent to a server.

## Run it

Open `index.html` in a browser. To see the phone layout on a laptop, open DevTools and switch on the device toolbar.

## What works

- **Wallet balance** with show/hide.
- **Send money**: checks the name, a 10-digit mobile number, the amount, the balance and a PIN (demo PIN: `1234`).
- **Add money** with quick-amount chips.
- **Transaction history** that updates after every action.
- **Saved data**: balance and history stay after a refresh (stored in `localStorage`). Tap the avatar to reset.

## How the code is organised (`script.js`)

1. **State** - one object holding balance and transactions. Money is stored in paise (whole numbers) to avoid decimal errors.
2. **Helpers** - formatting rupees and dates, the toast message.
3. **Rendering** - functions that draw the screen from the state.
4. **Actions** - `sendMoney` and `addMoney`, the only places that change the state.
5. **Wiring** - event listeners connecting buttons and forms to the actions.

## Exercises (buttons that show "not built yet")

In rough order of difficulty:

1. **History page** - show all transactions with a filter for sent / received.
2. **Mobile recharge** - a sheet like Send money, with operator and amount.
3. **Request money** - create a pending request, then let the user mark it paid.
4. **Change PIN** - store the PIN in the state instead of the `DEMO_PIN` constant.
5. **Search transactions** by name.
6. **Scan QR** - generate a QR code for your chutki ID with a library, then read one with the camera.
7. **Dark theme** - override the colour variables at the top of `style.css`.

## Later: a real backend

Login, a database and a payment gateway's test mode (Razorpay or Stripe). The balance check and PIN check must move to the server at that point, because anything in browser JavaScript can be edited by the user.
