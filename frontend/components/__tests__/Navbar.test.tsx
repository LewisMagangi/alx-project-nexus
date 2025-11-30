import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navbar from '../Navbar';
import { AuthProvider } from '@/context/AuthContext';

// --- Mock next/navigation properly at top-level ---
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
    back: jest.fn(),
    forward: jest.fn(),
    reload: jest.fn(),
  }),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => ({ get: jest.fn() })),
  __esModule: true,
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

    expect(screen.queryByText('Nexus')).toBeNull();
  });

  it('should not render if user is not logged in', () => {
    mockUsePathname.mockReturnValue('/dashboard');

    render(
      <AuthProvider>
        <Navbar />
      </AuthProvider>
    );

    expect(screen.queryByText('Nexus')).toBeNull();
  });

  it('should render navigation items when user is logged in', () => {
    mockUsePathname.mockReturnValue('/dashboard');

    renderWithAuth();

    expect(screen.getByText('Nexus')).toBeInTheDocument();
    expect(screen.getAllByText('Home').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Explore').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Notifications').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Messages').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Bookmarks').length).toBeGreaterThan(0);
  });

  it('should highlight the active navigation item', () => {
    mockUsePathname.mockReturnValue('/profile');

    renderWithAuth();

    const profileLink = screen.getByText('Profile').closest('a');
    expect(profileLink).toHaveClass('bg-blue-50');
  });
});
