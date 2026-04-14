import type { Meta, StoryObj } from '@storybook/react';
import { SegmentedSplitBarChart } from './SegmentedSplitBarChart';
import { variationByContractor } from '../../mocks/workspace.mock';

const meta: Meta<typeof SegmentedSplitBarChart> = {
  title: 'Contract/SegmentedSplitBarChart',
  component: SegmentedSplitBarChart,
};
export default meta;

type Story = StoryObj<typeof SegmentedSplitBarChart>;

export const Default: Story = {
  args: { items: variationByContractor, 'data-testid': 'variation-split' },
};
