# Aparte Landing Page Developer Guide

Welcome to the Aparte Landing Page repository! This project is a modern React application built with Vite, designed for high performance and visual excellence.

## Tech Stack
- **Framework**: [React 18](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) with [Redux Persist](https://github.com/rt2zz/redux-persist)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Material UI (MUI)](https://mui.com/)
- **Routing**: [React Router DOM](https://reactrouter.com/)
- **API Client**: [Axios](https://axios-http.com/)
- **Icons**: [Heroicons](https://heroicons.com/), [Iconify](https://iconify.design/), [MUI Icons](https://mui.com/material-ui/material-icons/)
- **Payments**: Paystack and Monnify integration
- **Maps**: [React Google Maps API](https://react-google-maps-api-docs.netlify.app/) and [Leaflet](https://leafletjs.com/)

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd landing-page
   ```
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Environment Setup
1. Create a `.env` file from the template:
   ```bash
   cp .env.template .env
   ```
2. Update the `.env` file with the necessary API base URLs and gateway keys.

## Project Structure
```text
landing-page/
├── public/              # Static assets (images, icons, robots.txt)
├── src/
│   ├── assets/          # Project-specific assets (images, fonts)
│   ├── components/      # Reusable UI components
│   ├── hooks/           # Custom React hooks
│   ├── layouts/         # Page layouts (Header, Footer, MainLayout)
│   ├── pages/           # Page components (Home, Properties, Booking)
│   ├── store/           # Redux slices and store configuration
│   ├── theme/           # MUI theme customization
│   ├── utils/           # Utility functions and constants
│   ├── App.tsx          # Main application component
│   └── main.tsx         # Entry point
├── index.html           # Main HTML file
├── tailwind.config.js   # Tailwind CSS configuration
└── vite.config.ts       # Vite configuration
```

## Available Scripts
- `npm run dev`: Starts the development server.
- `npm run build`: Builds the production bundle.
- `npm run lint`: Runs ESLint for code quality checks.
- `npm run preview`: Previews the production build locally.

## Development Workflow
1. **Components**: Place reusable components in `src/components/`. Use functional components with TypeScript.
2. **State Management**: Use Redux slices for global state (e.g., auth, cart, search filters). Ensure persistent data is handled via Redux Persist if needed.
3. **Styling**: Mix Tailwind CSS for layout and spacing with MUI for complex interactive components.
4. **API Calls**: Define API service functions in a dedicated folder (e.g., `src/services/`) or use Axios instances with base URLs from env.

## Best Practices
- **TypeScript**: Use strict typing for props and state.
- **Responsiveness**: Always test designs across multiple screen sizes using Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`).
- **Performance**: Use dynamic imports (React.lazy) for route-level code splitting.
- **Visuals**: Aim for a clean, confident look with smooth transitions and consistent spacing.
