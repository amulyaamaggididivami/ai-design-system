import type { Meta, StoryObj } from '@storybook/react';
import { DotMatrixChart } from './DotMatrixChart';
import { ewCategoryData } from '../../mocks/workspace.mock';

const meta: Meta<typeof DotMatrixChart> = {
  title: 'Contract/DotMatrixChart',
  component: DotMatrixChart,
};
export default meta;

type Story = StoryObj<typeof DotMatrixChart>;

export const Default: Story = {
  args: { items: ewCategoryData, 'data-testid': 'ew-category' },
};
