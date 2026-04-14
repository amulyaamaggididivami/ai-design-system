import { render } from '@testing-library/react';
import { BalanceScaleChart } from './BalanceScaleChart';
import { quotationSummary } from '../../mocks/workspace.mock';

describe('BalanceScaleChart', () => {
  it('renders canvas', () => {
    const { container } = render(
      <BalanceScaleChart
        left={quotationSummary.left}
        right={quotationSummary.right}
        data-testid="quotation-balance"
      />
    );
    expect(container.querySelector('canvas')).toBeTruthy();
  });

  it('forwards data-testid', () => {
    const { getByTestId } = render(
      <BalanceScaleChart
        left={quotationSummary.left}
        right={quotationSummary.right}
        data-testid="quotation-balance"
      />
    );
    expect(getByTestId('quotation-balance')).toBeTruthy();
  });
});
