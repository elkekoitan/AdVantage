import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import { LoginScreen } from './LoginScreen';
import { AuthContext } from '../../contexts/AuthContext';

// Mock AuthContext
const mockSignIn = jest.fn();
const mockAuthContext = {
  signIn: mockSignIn,
  signOut: jest.fn(),
  user: null,
  loading: false,
};

// Mock useNavigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Wrapper for NativeBaseProvider
const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <NativeBaseProvider initialWindowMetrics={{
      frame: { x: 0, y: 0, width: 0, height: 0 },
      insets: { top: 0, left: 0, right: 0, bottom: 0 },
    }}>
      <AuthContext.Provider value={mockAuthContext}>
        {children}
      </AuthContext.Provider>
    </NativeBaseProvider>
  );
};

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />, { wrapper: Wrapper });
    expect(getByPlaceholderText('E-posta')).toBeTruthy();
    expect(getByPlaceholderText('Şifre')).toBeTruthy();
    expect(getByText('Giriş Yap')).toBeTruthy();
  });

  it('displays error message if fields are empty', async () => {
    const { getByText } = render(<LoginScreen />, { wrapper: Wrapper });
    fireEvent.press(getByText('Giriş Yap'));

    await waitFor(() => {
      expect(getByText('Lütfen tüm alanları doldurun')).toBeTruthy();
    });
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('calls signIn with correct credentials on successful login', async () => {
    mockSignIn.mockResolvedValueOnce({}); // Simulate successful login

    const { getByPlaceholderText, getByText } = render(<LoginScreen />, { wrapper: Wrapper });

    fireEvent.changeText(getByPlaceholderText('E-posta'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Şifre'), 'password123');
    fireEvent.press(getByText('Giriş Yap'));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
    // Navigation is handled by AuthContext, so we don't expect navigate to be called directly here
  });

  it('displays error message on failed login', async () => {
    mockSignIn.mockRejectedValueOnce(new Error('Invalid credentials')); // Simulate failed login

    const { getByPlaceholderText, getByText } = render(<LoginScreen />, { wrapper: Wrapper });

    fireEvent.changeText(getByPlaceholderText('E-posta'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Şifre'), 'wrongpassword');
    fireEvent.press(getByText('Giriş Yap'));

    await waitFor(() => {
      expect(getByText('Giriş Başarısız')).toBeTruthy();
      expect(getByText('Invalid credentials')).toBeTruthy();
    });
    expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'wrongpassword');
  });

  it('navigates to ForgotPassword screen when "Şifremi Unuttum" is pressed', () => {
    const { getByText } = render(<LoginScreen />, { wrapper: Wrapper });
    fireEvent.press(getByText('Şifremi Unuttum'));
    expect(mockNavigate).toHaveBeenCalledWith('ForgotPassword');
  });

  it('navigates to Register screen when "Kayıt Ol" is pressed', () => {
    const { getByText } = render(<LoginScreen />, { wrapper: Wrapper });
    fireEvent.press(getByText('Kayıt Ol'));
    expect(mockNavigate).toHaveBeenCalledWith('Register');
  });

  it('toggles password visibility', () => {
    const { getByPlaceholderText, getByLabelText } = render(<LoginScreen />, { wrapper: Wrapper });
    const passwordInput = getByPlaceholderText('Şifre');
    expect(passwordInput.props.type).toBe('password');

    fireEvent.press(getByLabelText('toggle password visibility')); // Assuming an accessible label for the eye icon
    expect(passwordInput.props.type).toBe('text');

    fireEvent.press(getByLabelText('toggle password visibility'));
    expect(passwordInput.props.type).toBe('password');
  });
});
