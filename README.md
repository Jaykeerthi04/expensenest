# ExpenseNest - Personal Finance Management Application

ExpenseNest is a modern, user-friendly expense tracking application built with React, TypeScript, and Node.js. It helps users manage their personal finances with an intuitive interface and powerful features.

## Features

- 🔐 Secure user authentication
- 👤 Customizable user profiles
- 💰 Expense tracking and management
- 📊 Financial reports and analytics
- 🎨 Modern and responsive UI with Tailwind CSS
- ⚡ Fast and reliable performance with Vite

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- React Router DOM
- Axios

### Backend
- Node.js
- Express
- MongoDB
- JWT Authentication
- bcryptjs
- CORS

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/expensenest.git
cd expensenest
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

4. Start the development servers:

In one terminal (for backend):
```bash
npm run server
```

In another terminal (for frontend):
```bash
npm run dev
```

5. Open http://localhost:5173 in your browser

## Deployment

### Frontend Deployment (Vercel)

1. Create a Vercel account at vercel.com
2. Install Vercel CLI:
```bash
npm install -g vercel
```
3. Deploy:
```bash
vercel
```
4. Set environment variables in Vercel:
   - `VITE_API_URL`: Your backend API URL

### Backend Deployment (Render)

1. Create a Render account at render.com
2. Create a new Web Service
3. Connect your GitHub repository
4. Configure the service:
   - Build Command: `npm install`
   - Start Command: `node src/server/index.js`
5. Add environment variables:
   - `NODE_ENV`: production
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret key
   - `PORT`: 5000

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 