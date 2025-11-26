import { render, screen } from '@testing-library/react';
import GradesList from './GradesList';

jest.mock('../context/AuthContext', () => ({ useAuth: () => ({ currentUser: null }) }));

test('shows sign-in prompt when not signed in', () => {
  render(<GradesList />);
  expect(screen.getByText(/please sign in to view your grades/i)).toBeInTheDocument();
});
