import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

// Mock the config
vi.mock('../config', () => ({
  default: {
    API_URL: 'http://localhost:5000'
  }
}));

// Component to test the hook
const TestComponent = () => {
  const { isAuthenticated, login, logout } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleRegister = async () => {
    setError('');
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username: 'testuser' })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      if (data.token) {
        login(data.token);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.token) {
        login(data.token);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'unauthenticated'}</div>
      <input
        data-testid="email-input"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        data-testid="password-input"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Password"
      />
      {error && <div data-testid="error-message">{error}</div>}
      {isLoading && <div data-testid="loading">Loading...</div>}
      <button data-testid="login-button" onClick={handleLogin}>
        Login
      </button>
      <button data-testid="register-button" onClick={handleRegister}>
        Register
      </button>
      <button data-testid="logout-button" onClick={logout}>
        Logout
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should have unauthenticated state initially', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated');
  });

  it('should login successfully with valid credentials', async () => {
    const mockResponse = {
      token: 'test-jwt-token',
      user: { id: '123', email: 'test@example.com', username: 'testuser' }
    };

    (global.fetch as unknown as jest.Mock<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    );

    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    });

    expect(localStorage.getItem('token')).toBe('test-jwt-token');
  });

  it('should handle login failure', async () => {
    const errorResponse = {
      message: 'Invalid email or password'
    };

    (global.fetch as unknown as jest.Mock<typeof fetch>).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => errorResponse
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    );

    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Invalid email or password');
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated');
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('should register successfully with valid credentials', async () => {
    const mockResponse = {
      token: 'new-jwt-token',
      user: { id: '456', email: 'newuser@example.com', username: 'newuser' }
    };

    (global.fetch as unknown as jest.Mock<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    );

    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'newuser@example.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByTestId('register-button'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    });

    expect(localStorage.getItem('token')).toBe('new-jwt-token');
  });

  it('should handle registration failure', async () => {
    const errorResponse = {
      message: 'User already exists'
    };

    (global.fetch as unknown as jest.Mock<typeof fetch>).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => errorResponse
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    );

    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'existing@example.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByTestId('register-button'));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('User already exists');
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated');
  });

  it('should logout and clear token', async () => {
    // Set up authenticated state
    localStorage.setItem('token', 'existing-token');
    localStorage.setItem('user', JSON.stringify({ email: 'test@example.com' }));

    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    );

    // Note: AuthProvider checks auth on mount, so we need to wait
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    });

    fireEvent.click(screen.getByTestId('logout-button'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated');
    });

    expect(localStorage.getItem('token')).toBeNull();
  });

  it('should handle network error on login', async () => {
    (global.fetch as unknown as jest.Mock<typeof fetch>).mockRejectedValueOnce(new Error('Network error'));

    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    );

    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Network error');
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated');
  });
});
