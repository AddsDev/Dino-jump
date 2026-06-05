import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WelcomePage } from '../../pages/WelcomePage';

vi.mock('../../game/hooks/useLeaderboard', () => ({
  useLeaderboard: vi.fn(),
}));

import { useLeaderboard } from '../../game/hooks/useLeaderboard';

const mockedHook = useLeaderboard as unknown as ReturnType<typeof vi.fn>;

describe('<WelcomePage />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a Global badge and the table when the hook reports source=api', async () => {
    mockedHook.mockReturnValue({
      entries: [
        { nick: 'AAA', score: 999 },
        { nick: 'BBB', score: 42 },
      ],
      source: 'api',
      isLoading: false,
      errorMessage: null,
      refresh: vi.fn().mockResolvedValue(undefined),
    });

    render(<WelcomePage onStartGame={vi.fn()} />);

    const badge = await screen.findByTestId('leaderboard-source-badge');
    expect(badge.textContent).toMatch(/Global/i);
    expect(screen.getByTestId('leaderboard-table')).toBeInTheDocument();
    expect(screen.getAllByTestId('leaderboard-row')).toHaveLength(2);
  });

  it('renders a Local (offline) badge and a notice when source=local with error', async () => {
    mockedHook.mockReturnValue({
      entries: [{ nick: 'OFFLINE_HERO', score: 1 }],
      source: 'local',
      isLoading: false,
      errorMessage: 'API down',
      refresh: vi.fn().mockResolvedValue(undefined),
    });

    render(<WelcomePage onStartGame={vi.fn()} />);

    const badge = await screen.findByTestId('leaderboard-source-badge');
    expect(badge.textContent).toMatch(/Local/i);
    const error = screen.getByTestId('leaderboard-error');
    expect(error.textContent).toContain('API down');
  });

  it('renders the empty state with a Vacío badge when there are no entries', async () => {
    mockedHook.mockReturnValue({
      entries: [],
      source: 'none',
      isLoading: false,
      errorMessage: null,
      refresh: vi.fn().mockResolvedValue(undefined),
    });

    render(<WelcomePage onStartGame={vi.fn()} />);

    const badge = await screen.findByTestId('leaderboard-source-badge');
    expect(badge.textContent).toMatch(/Vacío/i);
    expect(screen.getByText(/No scores recorded yet/i)).toBeInTheDocument();
  });

  it('shows a loading state while fetching entries', async () => {
    mockedHook.mockReturnValue({
      entries: [],
      source: 'none',
      isLoading: true,
      errorMessage: null,
      refresh: vi.fn().mockResolvedValue(undefined),
    });

    render(<WelcomePage onStartGame={vi.fn()} />);

    expect(await screen.findByText(/Loading leaderboard/i)).toBeInTheDocument();
  });
});
