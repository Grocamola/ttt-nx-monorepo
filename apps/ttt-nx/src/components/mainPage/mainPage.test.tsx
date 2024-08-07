// src/components/mainPage/mainPage.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import MainPage from './mainPage';

test('renders welcome text', () => {
  render(<MainPage />);
  const welcomeElement = screen.getByText(/Login/i);
  expect(welcomeElement).toBeDefined();
});
