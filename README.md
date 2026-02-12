# Aparte Landing Page

The guest-facing website for Aparte, a premium property rental platform. Built with React 18, Vite, and Tailwind CSS.

## 🚀 Current State
- **Core Features**: Property browsing, unit selection, and booking flow are operational.
- **Payments**: Integrated with **Paystack** and **Monnify** for seamless guest transactions.
- **User Experience**: Premium design with responsive layouts and interactive components using **MUI** and **Swiper**.

## 🛠️ Tech Stack
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS & Material UI (MUI)
- **State Management**: Redux Toolkit (with Redux Persist)
- **API Client**: Axios

## 📚 Documentation
For more detailed onboarding and technical details, see the [Developer Guide](DEVELOPER_GUIDE.md).

## 🤝 Contributing
We welcome contributions to enhance the guest experience! Please follow these standards:

### 1. Git Workflow
- Branch from `main`: `git checkout -b feature/your-feature-name`.
- Use **Conventional Commits**: `feat: ...`, `fix: ...`, `docs: ...`.
- PRs must pass linting and build checks before merging.

### 2. Coding Standards
- **Component Design**: Use functional components with **TypeScript**. Use the Atomic Design methodology for organizing components.
- **Styling**: Prefer **Tailwind CSS** for layout/spacing and **MUI** for complex UI elements like modals and pickers.
- **Type Safety**: Strictly define interfaces for all data structures and API responses.
- **State**: Use Redux for global application state and local React `useState`/`useReducer` for component-specific logic.

---

## 🚀 Quick Start
```bash
# Install dependencies
npm install

# Setup environment
cp .env.template .env # Update with backend API URLs

# Start dev server
npm run dev
```
