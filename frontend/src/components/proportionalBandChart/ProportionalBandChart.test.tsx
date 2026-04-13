import { render } from '@testing-library/react';
import { ProportionalBandChart } from './ProportionalBandChart';
import { ewSeverityData } from '../../mocks/workspace.mock';

describe('ProportionalBandChart', () => {
  it('renders canvas', () => {
    const { container } = render(
      <ProportionalBandChart severities={ewSeverityData} data-testid="severity-bands" />
    );
    expect(container.querySelector('canvas')).toBeTruthy();
  });

  it('forwards data-testid', () => {
    const { getByTestId } = render(
      <ProportionalBandChart severities={ewSeverityData} data-testid="severity-bands" />
    );
    expect(getByTestId('severity-bands')).toBeTruthy();
  });
});
