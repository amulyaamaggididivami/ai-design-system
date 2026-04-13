import type { Meta, StoryObj } from '@storybook/react';
import { HubAndSpokeRadialChart } from './HubAndSpokeRadialChart';
import { ewStatusData, ewSeverityData } from '../../mocks/workspace.mock';

const meta: Meta<typeof HubAndSpokeRadialChart> = {
  title: 'Contract/HubAndSpokeRadialChart',
  component: HubAndSpokeRadialChart,
};
export default meta;

type Story = StoryObj<typeof HubAndSpokeRadialChart>;

export const EWStatus: Story = {
  args: { segments: ewStatusData, title: 'Early Warning Status Split', 'data-testid': 'status-arc-ew' },
};

export const Severity: Story = {
  args: { segments: ewSeverityData, title: 'EW Severity Distribution', 'data-testid': 'status-arc-severity' },
};
