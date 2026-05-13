import { AreaChart } from '../areaChart/AreaChart';
import { BarChart } from '../barChart/BarChart';
import { ProgressRaceChart } from '../progressRaceChart';
import { SemiCircularGaugeChart } from '../semiCircularGaugeChart';
import { MultiMetricConstellationChart } from '../multiMetricConstellationChart';
import { StackedHorizontalBarChart } from '../stackedHorizontalBarChart';
import { RankedCardLeaderboard } from '../rankedCardLeaderboard';
import { DotMatrixChart } from '../dotMatrixChart';
import { LineChart } from '../lineChart/LineChart';
import { MiniBars } from '../miniBars/MiniBars';
import { RadialFanTreeChart } from '../radialFanTreeChart';
import { PieChart } from '../pieChart/PieChart';
import { ProcessSankey, RankingSankey } from '../sankey';
import { BalanceScaleChart } from '../balanceScaleChart';
import { AreaLineChart } from '../areaLineChart';
import { Trend } from '../trend';
import { ProportionalBandChart } from '../proportionalBandChart';
import { HubAndSpokeRadialChart } from '../hubAndSpokeRadialChart';
import { TrendChart } from '../trendChart/TrendChart';
import { SegmentedSplitBarChart } from '../segmentedSplitBarChart';
import { WeeklyFlow } from '../weeklyFlow';
import { HorizontalBarChart } from '../horizontalBarChart';
import type { VisualizationRendererProps } from '../../types';

export function VisualizationRenderer({ config, className, colorOffset = 0, onItemClick, selectedId }: VisualizationRendererProps) {
  if (config.type === 'line') return <LineChart rows={config.rows} className={className} />;
  if (config.type === 'area') return <AreaChart rows={config.rows} className={className} />;
  if (config.type === 'bar') return <BarChart rows={config.rows} className={className} />;
  if (config.type === 'pie') return <PieChart rows={config.rows} variant="pie" className={className} />;
  if (config.type === 'donut') return <PieChart rows={config.rows} variant="donut" className={className} />;
  if (config.type === 'sankey') return <RankingSankey rows={config.rows} className={className} />;
  if (config.type === 'flow') return <ProcessSankey selectedEntity={config.selectedEntity} className={className} />;
  if (config.type === 'trend') return <TrendChart points={config.points} className={className} />;
  if (config.type === 'mini-bars') return <MiniBars rows={config.rows} className={className} />;

  if (config.type === 'stacked-horizontal-bar-chart') {
    const data = config.data ?? { items: config.items ?? [] };
    return <StackedHorizontalBarChart data={data} dataByEntity={config.dataByEntity} onItemClick={onItemClick} selectedId={selectedId} />;
  }
  if (config.type === 'multi-metric-constellation-chart') return <MultiMetricConstellationChart items={config.items} />;
  if (config.type === 'progress-race-chart') return <ProgressRaceChart items={config.items} itemsByEntity={config.itemsByEntity} colorOffset={colorOffset} onItemClick={onItemClick} selectedId={selectedId} />;
  if (config.type === 'hub-and-spoke-radial-chart') return <HubAndSpokeRadialChart segments={config.segments} title={config.title} unitLabel={config.unitLabel} />;
  if (config.type === 'dot-matrix-chart') return <DotMatrixChart items={config.items} />;
  if (config.type === 'ranked-card-leaderboard') return <RankedCardLeaderboard items={config.items} />;
  if (config.type === 'proportional-band-chart') return <ProportionalBandChart severities={config.severities} colorOffset={colorOffset} />;
  if (config.type === 'radial-fan-tree-chart') return <RadialFanTreeChart total={config.total} totalLabel={config.totalLabel} items={config.items} dataByEntity={config.dataByEntity} colorOffset={colorOffset} onItemClick={onItemClick} selectedId={selectedId} />;
  if (config.type === 'semi-circular-gauge-chart') return <SemiCircularGaugeChart confirmed={config.confirmed} total={config.total} label={config.label} gaugeByEntity={config.gaugeByEntity} colorOffset={colorOffset} selectedId={selectedId} />;
  if (config.type === 'segmented-split-bar-chart') return <SegmentedSplitBarChart items={config.items} itemsByEntity={config.itemsByEntity} labelA={config.labelA} labelB={config.labelB} unit={config.unit} onItemClick={onItemClick} selectedId={selectedId} />;
  if (config.type === 'balance-scale-chart') return <BalanceScaleChart left={config.left} right={config.right} leftTitle={config.leftTitle} rightTitle={config.rightTitle} unit={config.unit} dataByEntity={config.dataByEntity} selectedId={selectedId} />;
  if (config.type === 'area-line-chart') return <AreaLineChart points={config.points} />;
  if (config.type === 'trend-view') return <Trend points={config.points} colorOffset={colorOffset} seriesByEntity={config.pointsByEntity} selectedId={selectedId} />;
  if (config.type === 'weekly-flow') return <WeeklyFlow items={config.items} />;
  if (config.type === 'horizontal-bar-chart') return <HorizontalBarChart rows={config.rows} valuePrefix={config.valuePrefix} />;

  return <div className="viz-empty">Visualization unavailable</div>;
}
