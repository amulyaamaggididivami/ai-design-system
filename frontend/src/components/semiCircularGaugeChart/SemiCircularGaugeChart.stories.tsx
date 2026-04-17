import type { Meta, StoryObj } from '@storybook/react';
import { SemiCircularGaugeChart } from './SemiCircularGaugeChart';
import { nceCompensationData } from '../../mocks/workspace.mock';

const meta: Meta<typeof SemiCircularGaugeChart> = {
  title: 'Contract/SemiCircularGaugeChart',
  component: SemiCircularGaugeChart,
};
export default meta;

type Story = StoryObj<typeof SemiCircularGaugeChart>;

export const Default: Story = {
  args: {
    pct: nceCompensationData.pctConfirmed,
    confirmed: nceCompensationData.confirmed,
    total: nceCompensationData.total,
    'data-testid': 'compensation-gauge',
  },
};
