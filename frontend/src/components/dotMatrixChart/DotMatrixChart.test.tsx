import { render } from '@testing-library/react';
import { DotMatrixChart } from './DotMatrixChart';
import { ewCategoryData } from '../../mocks/workspace.mock';

describe('DotMatrixChart', () => {
  it('renders canvas', () => {
    const { container } = render(
      <DotMatrixChart items={ewCategoryData} data-testid="ew-category" />
    );
    expect(container.querySelector('canvas')).toBeTruthy();
  });

  it('forwards data-testid', () => {
    const { getByTestId } = render(
      <DotMatrixChart items={ewCategoryData} data-testid="ew-category" />
    );
    expect(getByTestId('ew-category')).toBeTruthy();
  });
});
