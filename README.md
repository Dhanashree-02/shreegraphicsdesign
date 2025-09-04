# Shree Graphics Design Website

A full-stack e-commerce website for customizable logo designs, built with React + Vite frontend and Node.js + Express + MongoDB backend.

## Features

- **User Authentication**: JWT-based login/signup system
- **Product Browsing**: Browse customizable logos (embroidery, branding, unique designs)
- **Product Preview**: Preview customizations before ordering
- **Shopping Cart & Checkout**: Complete e-commerce functionality
- **User Profile**: Profile management and order history
- **Admin Dashboard**: Manage users, logos, and orders
- **Responsive Design**: Mobile-friendly UI

## Project Structure

```
shreegraphicsdesign-website/
├── frontend/          # React + Vite application
├── backend/           # Node.js + Express API
└── README.md         # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. Clone the repository
2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

4. Set up environment variables (see respective directories for details)

5. Start the development servers:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

## Technology Stack

### Frontend
- React 18
- Vite
- React Router
- Axios
- Tailwind CSS

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs
- CORS

## License

Private project for Shree Graphics Design