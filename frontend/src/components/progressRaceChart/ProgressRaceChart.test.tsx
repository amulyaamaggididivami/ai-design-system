// @ts-ignore
import { render } from '@testing-library/react';
import { ProgressRaceChart } from './ProgressRaceChart';
import { contractData } from '../../mocks/workspace.mock';

describe('ProgressRaceChart', () => {
  it('renders canvas', () => {
    const { container } = render(
      <ProgressRaceChart items={contractData.items} data-testid="commitment-race" />
    );
    expect(container.querySelector('canvas')).toBeTruthy();
  });

  it('forwards data-testid', () => {
    const { getByTestId } = render(
      <ProgressRaceChart items={contractData.items} data-testid="commitment-race" />
    );
    expect(getByTestId('commitment-race')).toBeTruthy();
  });
});
