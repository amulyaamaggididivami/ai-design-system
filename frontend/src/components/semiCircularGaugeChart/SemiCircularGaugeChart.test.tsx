import { render } from '@testing-library/react';
import { SemiCircularGaugeChart } from './SemiCircularGaugeChart';
import { nceCompensationData } from '../../mocks/workspace.mock';

describe('SemiCircularGaugeChart', () => {
  it('renders canvas', () => {
    const { container } = render(
      <SemiCircularGaugeChart
        pct={nceCompensationData.pctConfirmed}
        confirmed={nceCompensationData.confirmed}
        total={nceCompensationData.total}
        data-testid="compensation-gauge"
      />
    );
    expect(container.querySelector('canvas')).toBeTruthy();
  });

  it('forwards data-testid', () => {
    const { getByTestId } = render(
      <SemiCircularGaugeChart
        pct={nceCompensationData.pctConfirmed}
        confirmed={nceCompensationData.confirmed}
        total={nceCompensationData.total}
        data-testid="compensation-gauge"
      />
    );
    expect(getByTestId('compensation-gauge')).toBeTruthy();
  });
});
