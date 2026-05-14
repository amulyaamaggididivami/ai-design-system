import type { Meta, StoryObj } from '@storybook/react';

import { MultiSegmentHorizontalBarChart } from './MultiSegmentHorizontalBarChart';
import { dualSegmentBarRows } from '../../mocks/workspace.mock';

const meta: Meta<typeof MultiSegmentHorizontalBarChart> = {
  title: 'Contract/MultiSegmentHorizontalBarChart',
  component: MultiSegmentHorizontalBarChart,
};
export default meta;

type Story = StoryObj<typeof MultiSegmentHorizontalBarChart>;

export const Default: Story = {
  args: {
    rows: dualSegmentBarRows,
    valuePrefix: '$',
    testID: 'multi-segment-bar',
  },
};

export const AgreedOnly: Story = {
  args: {
    rows: dualSegmentBarRows.map(({ secondaryValue: _, ...r }) => r),
    valuePrefix: '$',
    testID: 'multi-segment-bar-agreed-only',
  },
};

export const Empty: Story = {
  args: {
    rows: [],
    testID: 'multi-segment-bar-empty',
  },
};
