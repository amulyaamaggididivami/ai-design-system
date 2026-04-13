import { render } from '@testing-library/react';
import { StackedHorizontalBarChart } from './StackedHorizontalBarChart';
import { contractData } from '../../mocks/workspace.mock';

describe('StackedHorizontalBarChart', () => {
  it('renders canvas element', () => {
    const { container } = render(
      <StackedHorizontalBarChart data={contractData} data-testid="contract-value-orb" />
    );
    expect(container.querySelector('canvas')).toBeTruthy();
  });

  it('forwards data-testid to root element', () => {
    const { getByTestId } = render(
      <StackedHorizontalBarChart data={contractData} data-testid="contract-value-orb" />
    );
    expect(getByTestId('contract-value-orb')).toBeTruthy();
  });
});
