import { render, screen } from '@testing-library/react';
import MainPage from '../components/mainPage/MainPage';

test('renders welcome text', () => {
  render(<MainPage />);
  const welcomeElement = screen.getByText(/Login/i);
  expect(welcomeElement).toBeDefined();
});
