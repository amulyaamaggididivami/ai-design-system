import { render } from '@testing-library/react';
import { RadialFanTreeChart } from './RadialFanTreeChart';
import { nceByContractor, nceCompensationData } from '../../mocks/workspace.mock';

describe('RadialFanTreeChart', () => {
  it('renders canvas', () => {
    const { container } = render(
      <RadialFanTreeChart total={nceCompensationData.total} items={nceByContractor} data-testid="nce-tree" />
    );
    expect(container.querySelector('canvas')).toBeTruthy();
  });

  it('forwards data-testid', () => {
    const { getByTestId } = render(
      <RadialFanTreeChart total={nceCompensationData.total} items={nceByContractor} data-testid="nce-tree" />
    );
    expect(getByTestId('nce-tree')).toBeTruthy();
  });
});
