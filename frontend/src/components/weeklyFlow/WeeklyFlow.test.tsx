import { render } from '@testing-library/react';
import { WeeklyFlow } from './WeeklyFlow';
import { contractData } from '../../mocks/workspace.mock';

describe('WeeklyFlow', () => {
  it('renders canvas', () => {
    const { container } = render(
      <WeeklyFlow items={contractData.items} data-testid="weekly-flow" />
    );
    expect(container.querySelector('canvas')).toBeTruthy();
  });

  it('forwards data-testid', () => {
    const { getByTestId } = render(
      <WeeklyFlow items={contractData.items} data-testid="weekly-flow" />
    );
    expect(getByTestId('weekly-flow')).toBeTruthy();
  });
});
