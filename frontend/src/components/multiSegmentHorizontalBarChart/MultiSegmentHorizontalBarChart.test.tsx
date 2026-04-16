import { render } from '@testing-library/react';

import { MultiSegmentHorizontalBarChart } from './MultiSegmentHorizontalBarChart';
import { dualSegmentBarRows } from '../../mocks/workspace.mock';

describe('MultiSegmentHorizontalBarChart', () => {
  it('renders a canvas element', () => {
    const { container } = render(
      <MultiSegmentHorizontalBarChart rows={dualSegmentBarRows} data-testid="dual-seg-bar" />,
    );
    expect(container.querySelector('canvas')).toBeTruthy();
  });

  it('forwards data-testid to the root element', () => {
    const { getByTestId } = render(
      <MultiSegmentHorizontalBarChart rows={dualSegmentBarRows} data-testid="dual-seg-bar" />,
    );
    expect(getByTestId('dual-seg-bar')).toBeTruthy();
  });

  it('renders empty state when rows is empty', () => {
    const { getByTestId } = render(
      <MultiSegmentHorizontalBarChart rows={[]} data-testid="dual-seg-bar-empty" />,
    );
    expect(getByTestId('dual-seg-bar-empty')).toBeTruthy();
  });

  it('renders agreed-only rows (no secondaryValue)', () => {
    const agreedOnly = dualSegmentBarRows.map(({ secondaryValue: _, ...r }) => r);
    const { container } = render(
      <MultiSegmentHorizontalBarChart rows={agreedOnly} data-testid="dual-seg-agreed-only" />,
    );
    expect(container.querySelector('canvas')).toBeTruthy();
  });
});
