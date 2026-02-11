# vorote.ch

Welcome to the repository for https://vorote.ch 👋

This is the personal website and professional portfolio of **Dmytro Vorotyntsev**, built with a focus on performance, modern web standards, and seamless content management.

## 🚀 Overview

This project is a modern Next.js application designed to be:
*   **Fast & Responsive**: Built on [Next.js](https://nextjs.org/) and deployed to the edge with [Cloudflare Workers](https://workers.cloudflare.com/) via OpenNext.
*   **Content-Driven**: Powered by [TinaCMS](https://tina.io/) for an intuitive, Git-backed editing experience.
*   **Robust**: Fully typed with TypeScript and styled with Tailwind CSS.

## 📚 Documentation

Detailed documentation for specific features and integrations can be found in the `docs/` directory:

*   **[Email Integration](./docs/EMAIL_INTEGRATION.md)**: How transactional emails (feedback forms, etc.) are handled using Resend and Cloudflare Turnstile.
*   **[Scheduler Algorithm](./docs/SCHEDULER_ALGORITHM.md)**: A deep dive into the constraint-based linear optimization algorithm used for the on-call scheduler tool.

## 🛠️ Local Development

To run this project locally, you'll need **Node.js** (LTS) and **pnpm**.

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment
1.  Copy `.env.develpment.example` to `.env.develpment` for frontend/local development variables.
    ```bash
    cp .env.develpment.example .env.development
    ```
2.  Copy `.env.example` to `.env` for backend/Wrangler variables.
    ```bash
    cp .env.example .env
    ```
3.  Fill in the required tokens (TinaCMS, Cloudflare Turnstile, Resend API Key).

### 3. Run Development Server
```bash
pnpm dev
```
*   **Website**: [http://localhost:3000](http://localhost:3000)
*   **CMS Admin**: [http://localhost:3000/admin](http://localhost:3000/admin)
*   **GraphQL Playground**: [http://localhost:4001/altair/](http://localhost:4001/altair/)

### 4. Type Generation
To generate Cloudflare Worker types (`Env` interface) based on your `.env` file:
```bash
pnpm types
```
*Note: This strictly reads `.env` to keep backend types clean of frontend `NEXT_PUBLIC_` variables.*

## 📦 Deployment

The application is designed to be deployed to **Cloudflare Workers** using OpenNext.

```bash
pnpm deploy
```

## 📄 License

This project is licensed under the [Apache 2.0 License](./LICENSE).
