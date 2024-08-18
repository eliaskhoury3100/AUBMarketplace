// Import necessary functions and components for testing
import { render, screen } from '@testing-library/react';
import App from './App';

// Define a test case to verify that the "learn react" link is rendered in the App component
test('renders learn react link', () => {
  render(<App />); // Render the App component for testing
  const linkElement = screen.getByText(/learn react/i); // Find the element with the text "learn react" (case-insensitive)
  expect(linkElement).toBeInTheDocument(); // Assert that the element is present in the document (i.e., it was rendered)
});
