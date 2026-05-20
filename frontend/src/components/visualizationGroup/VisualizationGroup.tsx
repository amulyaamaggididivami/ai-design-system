import { useState, useCallback, useRef, useEffect } from 'react';
import { VisualizationRenderer } from '../visualizationRenderer/VisualizationRenderer';
import type { BaseVisualizationConfig, VisualizationGroupProps, SubentityPayload } from '../../types';
import { CHART_TYPE } from '../../constants';
import './VisualizationGroup.css';

function normalizeId(id: string): string {
  return id.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const W = 56;   // connector column width (px)

export function VisualizationGroup({ items, colorOffset = 0, title, 'data-testid': testID }: VisualizationGroupProps) {
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [selectedLabel, setSelectedLabel] = useState<string | undefined>(undefined);
  const [listenerItems, setListenerItems] = useState<SubentityPayload | null>(null);
  const [broadcasterIndex, setBroadcasterIndex] = useState<number | null>(null);
  const [connectorY, setConnectorY] = useState<number | null>(null);
  const [connectorX, setConnectorX] = useState<number | null>(null);
  const [sourceY, setSourceY] = useState<number | null>(null);
  const [containerH, setContainerH] = useState<number>(0);
  const [containerW, setContainerW] = useState<number>(0);
  const chartsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = chartsContainerRef.current;
    if (!container) return;
    const handler = (e: Event) => {
      const { centerClientY, centerClientX, sourceClientY } = (e as CustomEvent<{ centerClientY: number; centerClientX: number; sourceClientY?: number }>).detail;
      const rect = container.getBoundingClientRect();
      setConnectorY(centerClientY - rect.top);
      setConnectorX(centerClientX - rect.left);
      setSourceY(sourceClientY != null ? sourceClientY - rect.top : null);
      setContainerH(rect.height);
      setContainerW(rect.width);
    };
    container.addEventListener('viz-item-click', handler);
    return () => container.removeEventListener('viz-item-click', handler);
  }, []);

  const handleItemClick = useCallback((chartIndex: number, id: string, label: string, subentity?: SubentityPayload) => {
    const hasSubentity = subentity != null && (Array.isArray(subentity) ? subentity.length > 0 : true);
    if (!hasSubentity) return;

    const normId = normalizeId(id);
    setSelectedId((prev) => {
      const next = prev === normId ? undefined : normId;
      setSelectedLabel(next ? label : undefined);
      if (next) {
        setBroadcasterIndex(chartIndex);
        setListenerItems(subentity!);
      } else {
        setListenerItems(null);
        setBroadcasterIndex(null);
      }
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    setSelectedId(undefined);
    setSelectedLabel(undefined);
    setListenerItems(null);
    setBroadcasterIndex(null);
    setConnectorY(null);
    setConnectorX(null);
    setSourceY(null);
  }, []);

  const isActive = broadcasterIndex !== null && connectorY !== null;
  const lineY = connectorY ?? containerH / 2;

  // For BalanceScaleChart broadcaster: SVG overlay draws the L-shaped routing path
  // outside the canvas element, positioned on the broadcaster chart div.
  // connectorLeft = width of the broadcaster chart div (flex: 1 1 0 among N charts, N-1 connectors)
  const numConnectors = items.length - 1;
  const connectorLeft = containerW > 0 ? (containerW - numConnectors * W) / items.length : null;
  const isBalanceScaleBroadcaster = (idx: number) =>
    isActive && broadcasterIndex === idx && items[idx]?.type === CHART_TYPE.BALANCE_SCALE;

  return (
    <div className="viz-group" data-testid={testID}>
      {title && <div className="viz-group__title">{title}</div>}
      <div className="viz-group__bar">
        {selectedId ? (
          <button
            type="button"
            className="viz-group__reset-btn"
            onClick={handleReset}
            aria-label="Reset selection"
          >
            ✕ Reset
          </button>
        ) : (
          <span className="viz-group__hint">
            ↑ Click a row to drill down
          </span>
        )}
      </div>
      <div ref={chartsContainerRef} className="viz-group__charts">
        {items.flatMap((config: BaseVisualizationConfig, i: number) => {
          const isListener = broadcasterIndex !== null ? i !== broadcasterIndex : i === items.length - 1;
          const showRouting = isBalanceScaleBroadcaster(i) && connectorX !== null && sourceY !== null && connectorLeft !== null;
          const chart = (
            <div key={i} className={`viz-group__chart viz-group__chart--${config.type}${isListener ? ' viz-group__chart--listener' : ''}`}>
              {isListener && (
                <div className="viz-group__listener-label">
                  {broadcasterIndex !== null ? selectedLabel : null}
                </div>
              )}
              <VisualizationRenderer
                config={config}
                colorOffset={colorOffset + i}
                onItemClick={(id, label, subentity) => handleItemClick(i, id, label, subentity)}
                selectedId={selectedId}
                listenerItems={i !== broadcasterIndex && listenerItems ? listenerItems : undefined}
              />
              {showRouting && (
                <svg
                  className="viz-group__route-svg"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <line
                    x1={connectorX! - 7} y1={sourceY!}
                    x2={connectorX! + 7} y2={sourceY!}
                    className="viz-group__connector-tick"
                  />
                  <path
                    d={`M ${connectorX} ${sourceY} L ${connectorX} ${lineY} H ${connectorLeft!}`}
                    className="viz-group__connector-path"
                  />
                </svg>
              )}
            </div>
          );
          if (i === items.length - 1) return [chart];

          const isReversed = broadcasterIndex !== null && broadcasterIndex > i;
          const dotX  = isReversed ? -0.7 : W + 0.7;
          const tickX = isReversed ? W - 2 : 2;
          const path  = `M ${tickX} ${lineY} H ${dotX}`;

          const connector = (
            <div
              key={`connector-${i}`}
              className={`viz-group__connector${isActive ? ' viz-group__connector--active' : ''}`}
            >
              <svg
                className="viz-group__connector-svg"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                {!showRouting && (
                  <line
                    x1={tickX} y1={lineY - 7}
                    x2={tickX} y2={lineY + 7}
                    className="viz-group__connector-tick"
                  />
                )}
                <path d={path} className="viz-group__connector-path" />
                <circle cx={dotX} cy={lineY} r="4" className="viz-group__connector-dot" />
              </svg>
            </div>
          );
          return [chart, connector];
        })}
      </div>
    </div>
  );
}
