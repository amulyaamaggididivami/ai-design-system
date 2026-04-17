import type { Meta, StoryObj } from '@storybook/react';
import { StackedHorizontalBarChart } from './StackedHorizontalBarChart';
import { contractData } from '../../mocks/workspace.mock';

const meta: Meta<typeof StackedHorizontalBarChart> = {
  title: 'Contract/StackedHorizontalBarChart',
  component: StackedHorizontalBarChart,
};
export default meta;

type Story = StoryObj<typeof StackedHorizontalBarChart>;

export const Default: Story = {
  args: { data: contractData, 'data-testid': 'contract-value-orb' },
};
