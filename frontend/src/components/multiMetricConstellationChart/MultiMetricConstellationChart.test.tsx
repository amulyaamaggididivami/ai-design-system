import { render } from '@testing-library/react';
import { MultiMetricConstellationChart } from './MultiMetricConstellationChart';
import { contractData } from '../../mocks/workspace.mock';

describe('MultiMetricConstellationChart', () => {
  it('renders canvas element', () => {
    const { container } = render(
      <MultiMetricConstellationChart items={contractData.items} data-testid="contract-bars" />
    );
    expect(container.querySelector('canvas')).toBeTruthy();
  });

  it('forwards data-testid to root', () => {
    const { getByTestId } = render(
      <MultiMetricConstellationChart items={contractData.items} data-testid="contract-bars" />
    );
    expect(getByTestId('contract-bars')).toBeTruthy();
  });
});
