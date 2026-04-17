import type { Meta, StoryObj } from '@storybook/react';
import { RankedCardLeaderboard } from './RankedCardLeaderboard';
import { ewOpenByContractor } from '../../mocks/workspace.mock';

const meta: Meta<typeof RankedCardLeaderboard> = {
  title: 'Contract/RankedCardLeaderboard',
  component: RankedCardLeaderboard,
};
export default meta;

type Story = StoryObj<typeof RankedCardLeaderboard>;

export const Default: Story = {
  args: { items: ewOpenByContractor, 'data-testid': 'contractor-rank' },
};
