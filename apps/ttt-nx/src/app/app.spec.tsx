// import { render } from '@testing-library/react';

// import App from './app';

// describe('App', () => {
//   it('should render successfully', () => {
//     const { baseElement } = render(<App />);
//     expect(baseElement).toBeTruthy();
//   });

//   it('should have a greeting as the title', () => {
//     const { getByText } = render(<App />);
//     expect(getByText(/Welcome ttt-nx/gi)).toBeTruthy();
//   });
// });


// src/components/mainPage/mainPage.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import MainPage from '../components/mainPage/mainPage';

test('renders welcome text', () => {
  render(<MainPage />);
  const welcomeElement = screen.getByText(/Login/i);
  expect(welcomeElement).toBeDefined();
});
