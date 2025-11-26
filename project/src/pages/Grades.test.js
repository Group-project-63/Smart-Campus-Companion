import { render, screen } from '@testing-library/react';
import Grades from './Grades';

// Stub the GradesList so we don't hit Supabase in tests.
jest.mock('../components/GradesList', () => () => <div data-testid="grades-list">stub</div>);

// Stub useAuth to simulate signed-in user
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ currentUser: { id: 'abc-123', email: 'student@example.com' } })
}));

test('renders Grades page header and grades list stub', () => {
  render(<Grades />);
  expect(screen.getByText(/My Grades/i)).toBeInTheDocument();
  expect(screen.getByTestId('grades-list')).toBeInTheDocument();
});
