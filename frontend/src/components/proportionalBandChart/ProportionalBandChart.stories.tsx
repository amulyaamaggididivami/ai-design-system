import type { Meta, StoryObj } from '@storybook/react';
import { ProportionalBandChart } from './ProportionalBandChart';
import { ewSeverityData } from '../../mocks/workspace.mock';

const meta: Meta<typeof ProportionalBandChart> = {
  title: 'Contract/ProportionalBandChart',
  component: ProportionalBandChart,
};
export default meta;

type Story = StoryObj<typeof ProportionalBandChart>;

export const Default: Story = {
  args: { severities: ewSeverityData, 'data-testid': 'severity-bands' },
};
