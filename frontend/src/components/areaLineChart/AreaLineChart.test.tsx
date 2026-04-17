import { render } from '@testing-library/react';
import { AreaLineChart } from './AreaLineChart';
import { quotationTrend } from '../../mocks/workspace.mock';

describe('AreaLineChart', () => {
  it('renders canvas', () => {
    const { container } = render(
      <AreaLineChart points={quotationTrend} data-testid="quotation-trend" />
    );
    expect(container.querySelector('canvas')).toBeTruthy();
  });

  it('forwards data-testid', () => {
    const { getByTestId } = render(
      <AreaLineChart points={quotationTrend} data-testid="quotation-trend" />
    );
    expect(getByTestId('quotation-trend')).toBeTruthy();
  });
});
