import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ExpenseProvider } from './context/ExpenseContext';
import { AuthProvider } from './context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AddExpense from './pages/AddExpense';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

const pageTransition = {
  type: "tween",
  duration: 0.5,
  ease: "easeInOut"
};

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  return (
    <motion.div
      key={location.pathname}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ExpenseProvider>
          <AnimatePresence mode="wait">
            <Routes>
              <Route 
                path="/" 
                element={
                  <PageTransition>
                    <LandingPage />
                  </PageTransition>
                } 
              />
              <Route
                path="/login"
                element={
                  <PageTransition>
                    <Login />
                  </PageTransition>
                }
              />
              <Route
                path="/register"
                element={
                  <PageTransition>
                    <Register />
                  </PageTransition>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <PageTransition>
                      <Dashboard />
                    </PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <PageTransition>
                      <AddExpense />
                    </PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <PageTransition>
                      <Reports />
                    </PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <PageTransition>
                      <Profile />
                    </PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <PageTransition>
                      <Settings />
                    </PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </AnimatePresence>
        </ExpenseProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;