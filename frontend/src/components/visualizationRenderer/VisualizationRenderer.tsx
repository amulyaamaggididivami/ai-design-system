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
import { CHART_TYPE } from '../../constants';

export function VisualizationRenderer({ config, className, colorOffset = 0, onItemClick, selectedId }: VisualizationRendererProps) {
  if (config.type === CHART_TYPE.LINE) return <LineChart rows={config.rows} className={className} />;
  if (config.type === CHART_TYPE.AREA) return <AreaChart rows={config.rows} className={className} />;
  if (config.type === CHART_TYPE.BAR) return <BarChart rows={config.rows} className={className} />;
  if (config.type === CHART_TYPE.PIE) return <PieChart rows={config.rows} variant="pie" className={className} />;
  if (config.type === CHART_TYPE.DONUT) return <PieChart rows={config.rows} variant="donut" className={className} />;
  if (config.type === CHART_TYPE.SANKEY) return <RankingSankey rows={config.rows} className={className} />;
  if (config.type === CHART_TYPE.FLOW) return <ProcessSankey selectedEntity={config.selectedEntity} className={className} />;
  if (config.type === CHART_TYPE.TREND) return <TrendChart points={config.points} className={className} />;
  if (config.type === CHART_TYPE.MINI_BARS) return <MiniBars rows={config.rows} className={className} />;

  if (config.type === CHART_TYPE.STACKED_HORIZONTAL_BAR) {
    const data = config.data ?? { items: config.items ?? [] };
    return <StackedHorizontalBarChart data={data} dataByEntity={config.dataByEntity} onItemClick={onItemClick} selectedId={selectedId} />;
  }
  if (config.type === CHART_TYPE.MULTI_METRIC_CONSTELLATION) return <MultiMetricConstellationChart items={config.items} />;
  if (config.type === CHART_TYPE.PROGRESS_RACE) return <ProgressRaceChart items={config.items} itemsByEntity={config.itemsByEntity} colorOffset={colorOffset} onItemClick={onItemClick} selectedId={selectedId} />;
  if (config.type === CHART_TYPE.HUB_AND_SPOKE_RADIAL) return <HubAndSpokeRadialChart segments={config.segments} title={config.title} unitLabel={config.unitLabel} />;
  if (config.type === CHART_TYPE.DOT_MATRIX) return <DotMatrixChart items={config.items} />;
  if (config.type === CHART_TYPE.RANKED_CARD_LEADERBOARD) return <RankedCardLeaderboard items={config.items} />;
  if (config.type === CHART_TYPE.PROPORTIONAL_BAND) return <ProportionalBandChart severities={config.severities} colorOffset={colorOffset} />;
  if (config.type === CHART_TYPE.RADIAL_FAN_TREE) return <RadialFanTreeChart total={config.total} totalLabel={config.totalLabel} items={config.items} dataByEntity={config.dataByEntity} colorOffset={colorOffset} onItemClick={onItemClick} selectedId={selectedId} />;
  if (config.type === CHART_TYPE.SEMI_CIRCULAR_GAUGE) return <SemiCircularGaugeChart confirmed={config.confirmed} total={config.total} label={config.label} gaugeByEntity={config.gaugeByEntity} colorOffset={colorOffset} selectedId={selectedId} />;
  if (config.type === CHART_TYPE.SEGMENTED_SPLIT_BAR) return <SegmentedSplitBarChart items={config.items} itemsByEntity={config.itemsByEntity} labelA={config.labelA} labelB={config.labelB} unit={config.unit} onItemClick={onItemClick} selectedId={selectedId} />;
  if (config.type === CHART_TYPE.BALANCE_SCALE) return <BalanceScaleChart left={config.left} right={config.right} leftTitle={config.leftTitle} rightTitle={config.rightTitle} unit={config.unit} dataByEntity={config.dataByEntity} selectedId={selectedId} />;
  if (config.type === CHART_TYPE.AREA_LINE) return <AreaLineChart points={config.points} />;
  if (config.type === CHART_TYPE.TREND_VIEW) return <Trend points={config.points} colorOffset={colorOffset} seriesByEntity={config.pointsByEntity} selectedId={selectedId} />;
  if (config.type === CHART_TYPE.WEEKLY_FLOW) return <WeeklyFlow items={config.items} />;
  if (config.type === CHART_TYPE.HORIZONTAL_BAR) return <HorizontalBarChart rows={config.rows} valuePrefix={config.valuePrefix} />;

  return <div className="viz-empty">Visualization unavailable</div>;
}
