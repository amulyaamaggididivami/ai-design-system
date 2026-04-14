import { render } from '@testing-library/react';
import { SegmentedSplitBarChart } from './SegmentedSplitBarChart';
import { variationByContractor } from '../../mocks/workspace.mock';

describe('SegmentedSplitBarChart', () => {
  it('renders canvas', () => {
    const { container } = render(
      <SegmentedSplitBarChart items={variationByContractor} data-testid="variation-split" />
    );
    expect(container.querySelector('canvas')).toBeTruthy();
  });

  it('forwards data-testid', () => {
    const { getByTestId } = render(
      <SegmentedSplitBarChart items={variationByContractor} data-testid="variation-split" />
    );
    expect(getByTestId('variation-split')).toBeTruthy();
  });
});
