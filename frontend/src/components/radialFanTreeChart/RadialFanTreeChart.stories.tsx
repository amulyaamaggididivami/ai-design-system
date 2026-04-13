import type { Meta, StoryObj } from '@storybook/react';
import { RadialFanTreeChart } from './RadialFanTreeChart';
import { nceByContractor, nceCompensationData } from '../../mocks/workspace.mock';

const meta: Meta<typeof RadialFanTreeChart> = {
  title: 'Contract/RadialFanTreeChart',
  component: RadialFanTreeChart,
};
export default meta;

type Story = StoryObj<typeof RadialFanTreeChart>;

export const Default: Story = {
  args: {
    total: nceCompensationData.total,
    items: nceByContractor,
    'data-testid': 'nce-tree',
  },
};
