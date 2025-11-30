import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navbar from '../Navbar';
import { AuthProvider } from '@/context/AuthContext';

// --- Mock next/navigation properly at top-level ---
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

import { usePathname } from 'next/navigation';

// Create a typed mock reference for usePathname
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

// --- Mock user data ---
const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
};

// --- Helper: render with context and mock localStorage ---
const renderWithAuth = () => {
  localStorage.setItem('user', JSON.stringify(mockUser));
  localStorage.setItem('token', 'mock-token');
  return render(
    <AuthProvider>
      <Navbar />
    </AuthProvider>
  );
};

describe('Navbar Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should not render on auth pages', () => {
    mockUsePathname.mockReturnValue('/auth/login');

    renderWithAuth();

    expect(screen.queryByText('Twitter MVP')).toBeNull();
  });

  it('should not render if user is not logged in', () => {
    mockUsePathname.mockReturnValue('/dashboard');

    render(
      <AuthProvider>
        <Navbar />
      </AuthProvider>
    );

    expect(screen.queryByText('Twitter MVP')).toBeNull();
  });

  it('should render navigation items when user is logged in', () => {
    mockUsePathname.mockReturnValue('/dashboard');

    renderWithAuth();

    expect(screen.getByText('Twitter MVP')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Posts')).toBeInTheDocument();
    expect(screen.getByText('Follows')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('@testuser')).toBeInTheDocument();
  });

  it('should highlight the active navigation item', () => {
    mockUsePathname.mockReturnValue('/posts');

    renderWithAuth();

    const postsLink = screen.getByText('Posts').closest('a');
    expect(postsLink).toHaveClass('border-blue-500');
  });
});
