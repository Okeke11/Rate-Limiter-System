# 🛡️ Traffic Guard: API Rate Limiter & Security System

## 🚀 Overview
**Traffic Guard** is a custom-built middleware system designed to protect APIs from DDoS attacks and server overload. It uses **MongoDB TTL Indexes** for real-time traffic analysis and **Persistent Blacklisting** for permanent access control.

## 🛠️ Tech Stack
* **Node.js & Express:** Backend server and routing.
* **MongoDB:** Data persistence using TTL (Time-To-Live) collections for temporary logs.
* **HTML/JS Dashboard:** Real-time "NOC" style monitoring interface.

## ⚙️ How It Works
1.  **Request Interception:** Every incoming request passes through the `rateLimiter` middleware.
2.  **Traffic Counting:** The system logs the IP address in MongoDB with a **60-second expiration**.
3.  **Threshold Logic:** If an IP exceeds **5 requests/minute**, the middleware blocks the request immediately (`HTTP 429`).
4.  **The Ban Hammer:** Administrators can permanently ban abusive IPs via the Dashboard, adding them to a separate `Blacklist` collection (`HTTP 403`).

## 🔧 Installation
1.  Clone the repo:
    ```bash
    git clone [https://github.com/YOUR_USERNAME/traffic-guard.git](https://github.com/YOUR_USERNAME/traffic-guard.git)
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the server:
    ```bash
    node server.js
    ```
4.  Open `dashboard.html` in your browser to monitor traffic.git add 