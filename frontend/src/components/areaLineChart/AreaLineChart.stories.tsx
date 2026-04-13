import type { Meta, StoryObj } from '@storybook/react';
import { AreaLineChart } from './AreaLineChart';
import { quotationTrend } from '../../mocks/workspace.mock';

const meta: Meta<typeof AreaLineChart> = {
  title: 'Contract/AreaLineChart',
  component: AreaLineChart,
};
export default meta;

type Story = StoryObj<typeof AreaLineChart>;

export const Default: Story = {
  args: { points: quotationTrend, 'data-testid': 'quotation-trend' },
};
