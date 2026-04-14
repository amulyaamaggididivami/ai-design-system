import type { Meta, StoryObj } from '@storybook/react';
import { ProgressRaceChart } from './ProgressRaceChart';
import { contractData } from '../../mocks/workspace.mock';

const meta: Meta<typeof ProgressRaceChart> = {
  title: 'Contract/ProgressRaceChart',
  component: ProgressRaceChart,
};
export default meta;

type Story = StoryObj<typeof ProgressRaceChart>;

export const Default: Story = {
  args: { items: contractData.items, 'data-testid': 'commitment-race' },
};
