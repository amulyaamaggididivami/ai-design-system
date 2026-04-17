import { render } from '@testing-library/react';
import { RankedCardLeaderboard } from './RankedCardLeaderboard';
import { ewOpenByContractor } from '../../mocks/workspace.mock';

describe('RankedCardLeaderboard', () => {
  it('renders canvas', () => {
    const { container } = render(
      <RankedCardLeaderboard items={ewOpenByContractor} data-testid="contractor-rank" />
    );
    expect(container.querySelector('canvas')).toBeTruthy();
  });

  it('forwards data-testid', () => {
    const { getByTestId } = render(
      <RankedCardLeaderboard items={ewOpenByContractor} data-testid="contractor-rank" />
    );
    expect(getByTestId('contractor-rank')).toBeTruthy();
  });
});
