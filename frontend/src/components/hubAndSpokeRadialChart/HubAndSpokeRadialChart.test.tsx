import { render } from '@testing-library/react';
import { HubAndSpokeRadialChart } from './HubAndSpokeRadialChart';
import { ewStatusData } from '../../mocks/workspace.mock';

describe('HubAndSpokeRadialChart', () => {
  it('renders canvas', () => {
    const { container } = render(
      <HubAndSpokeRadialChart segments={ewStatusData} data-testid="status-arc" />
    );
    expect(container.querySelector('canvas')).toBeTruthy();
  });

  it('forwards data-testid', () => {
    const { getByTestId } = render(
      <HubAndSpokeRadialChart segments={ewStatusData} data-testid="status-arc" />
    );
    expect(getByTestId('status-arc')).toBeTruthy();
  });
});
