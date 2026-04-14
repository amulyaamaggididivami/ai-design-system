import type { Meta, StoryObj } from '@storybook/react';
import { BalanceScaleChart } from './BalanceScaleChart';
import { quotationSummary } from '../../mocks/workspace.mock';

const meta: Meta<typeof BalanceScaleChart> = {
  title: 'Contract/BalanceScaleChart',
  component: BalanceScaleChart,
};
export default meta;

type Story = StoryObj<typeof BalanceScaleChart>;

export const Default: Story = {
  args: {
    left: quotationSummary.accepted,
    right: quotationSummary.submitted,
    'data-testid': 'quotation-balance',
  },
};
