# Veritas Admin Dashboard

This is the admin dashboard for the Veritas Android project, built with React and Vite. The dashboard provides administrative functionalities for managing the Veritas system.

## Features

- Secure authentication using Clerk
- Modern UI built with React and TailwindCSS
- Real-time data management with Axios
- Responsive design for all device sizes
- Icon support with Lucide React

## Prerequisites

Before you begin, ensure you have installed:

- Node.js (v18.0.0 or higher recommended)
- npm (v9.0.0 or higher recommended)

## Project Setup

1. Clone the repository:

```bash
git clone https://github.com/Ta-h-a/veritas-android.git
cd veritas-android/admin
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory and add your environment variables:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in development mode.\
Open [http://localhost:5173](http://localhost:5173) to view it in your browser.\
The page will reload when you make changes.

### `npm run build`

Builds the app for production to the `dist` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm run preview`

Previews the built app locally, useful for testing the production build before deployment.

### `npm run lint`

Runs ESLint to check for code style issues and potential errors.

## Project Structure

```
admin/
├── public/           # Public assets
├── src/             # Source files
│   ├── assets/      # Static assets
│   ├── components/  # React components
│   ├── pages/       # Page components
│   ├── utils/       # Utility functions
│   ├── App.jsx      # Root component
│   └── main.jsx     # Entry point
├── .env             # Environment variables
├── .gitignore       # Git ignore rules
├── package.json     # Project dependencies
├── vite.config.js   # Vite configuration
└── README.md        # Project documentation
```

## Dependencies

### Core Dependencies

- **React**: v19.1.1 - Frontend library
- **Clerk**: v5.49.0 - Authentication and user management
- **TailwindCSS**: v4.1.13 - Utility-first CSS framework
- **Axios**: v1.12.2 - HTTP client
- **Lucide React**: v0.544.0 - Icon library

### Development Dependencies

- **Vite**: v7.1.7 - Build tool and development server
- **ESLint**: v9.36.0 - Code linting
- Various React-specific ESLint plugins and TypeScript types

## Authentication

The application uses Clerk for authentication. Make sure to:

1. Set up a Clerk account
2. Create an application in Clerk dashboard
3. Add the Publishable Key to your `.env` file
4. Configure authentication settings in the Clerk dashboard

## Development Guide

1. **Component Structure**

   - Follow React best practices
   - Use functional components with hooks
   - Keep components small and focused

2. **Styling**

   - Use TailwindCSS for styling
   - Follow the utility-first approach
   - Maintain consistent spacing and layout

3. **State Management**

   - Use React hooks for local state
   - Implement proper data fetching strategies
   - Handle loading and error states

4. **Code Style**
   - Follow ESLint rules
   - Write clean, maintainable code
   - Add comments for complex logic

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support

For support, please open an issue in the GitHub repository or contact the development team.
