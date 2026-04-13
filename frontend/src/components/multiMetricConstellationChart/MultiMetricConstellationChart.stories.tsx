import type { Meta, StoryObj } from '@storybook/react';
import { MultiMetricConstellationChart } from './MultiMetricConstellationChart';
import { contractData } from '../../mocks/workspace.mock';

const meta: Meta<typeof MultiMetricConstellationChart> = {
  title: 'Contract/MultiMetricConstellationChart',
  component: MultiMetricConstellationChart,
};
export default meta;

type Story = StoryObj<typeof MultiMetricConstellationChart>;

export const Default: Story = {
  args: { items: contractData.items, 'data-testid': 'contract-bars' },
};
