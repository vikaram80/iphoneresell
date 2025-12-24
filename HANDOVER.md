# iPhone Store Website - Handover Guide

This document contains instructions on how to install, run, and manage the iPhone Store website.

## 1. Prerequisites

You need **Node.js** installed on your computer.

- Download it here: [https://nodejs.org/](https://nodejs.org/) (LTS version recommended).

## 2. Installation

1. Unzip the project folder.
2. Open the folder in a terminal (Command Prompt or PowerShell).
3. Run the following command to install dependencies:

    ```bash
    npm install
    ```

## 3. Starting the Server

To run the website locally:

1. In the terminal, run:

    ```bash
    npm start
    ```

2. The server will start at `http://localhost:3000`.

## 4. Accessing the Website

- **Customer Store**: Open your browser and go to [http://localhost:3000](http://localhost:3000).
- **Admin Panel**: Go to [http://localhost:3000/admin.html](http://localhost:3000/admin.html).

## 5. Admin Panel Features

The Admin Panel allows you to manage orders:

- **View Orders**: See all customer orders (newest first).
- **Update Status**: Change status to `Shipped`, `Delivered`, etc.
- **View Proof**: Click "View Proof" to see the payment screenshot uploaded by the customer.
- **Delete Order**: Click "Delete" to remove an order permanently (use with caution).

## 6. Hosting Online

To make the website accessible to customers worldwide, you need to host it.

### Option A: Glitch.com (Recommended)

1. Go to [Glitch.com](https://glitch.com/).
2. Click "New Project" -> "glitch-hello-node".
3. Copy/Upload all project files to Glitch.
    - Copy `server.js` content.
    - Upload `public` folder.
    - Upload `data` folder.
4. **Your Link**: Glitch generates a public URL (e.g., `https://my-shop.glitch.me`).

### Option B: Replit (Easiest Alternative)

If Glitch is not working, use **Replit**:

1. Go to [Replit.com](https://replit.com/).
2. Click **"Import code or design"** (top-left).
3. Upload your folder.
4. **Important**: If it asks what to build, select **"Web App"**.
    - *Note*: Replit calls everything an "App". Since your website has a `server.js` file to save orders, it counts as an "App". This is normal!
5. Click **Run**.
6. A "Webview" window will appear. Click the "New Tab" icon (arrow) to open your site in its own tab.
7. **Your Link**: That new tab's URL is your public link!

### Option C: Professional Hosting (Railway / Render)

For professional use, deploy to **Railway.app** or **Render.com**.

- **Note**: These might reset data when the server restarts unless you upgrade to a database.

### Option D: Vercel (Professional & Fast)

Vercel is excellent, but requires a small configuration file for Node.js apps.

1. **Create `vercel.json`**: Create this file in your root folder:

    ```json
    {
      "version": 2,
      "builds": [
        {
          "src": "server.js",
          "use": "@vercel/node"
        }
      ],
      "routes": [
        {
          "src": "/(.*)",
          "dest": "server.js"
        }
      ]
    }
    ```

2. **Deploy**:
    - Install Vercel CLI: `npm i -g vercel`
    - Run: `vercel`
    - Follow the prompts.

### Option E: Instant Sharing (Local Tunnel)

If you just want to show a friend **right now** without moving files:

1. Start your server: `npm start`
2. Open a new terminal.
3. Run: `npx localtunnel --port 3000`
4. It will give you a temporary URL (e.g., `https://funny-cat-55.loca.lt`) that connects directly to your computer.
    - *Note*: The URL stops working when you close your terminal.

## 7. Configuration

You can change the **Advance Payment Amount** or **UPI ID** in `server.js` (look for the API Config section).

---
*Developed by Your Name*
