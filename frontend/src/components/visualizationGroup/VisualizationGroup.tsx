import { useState, useCallback, useRef, useEffect, useLayoutEffect } from 'react';
import { VisualizationRenderer } from '../visualizationRenderer/VisualizationRenderer';
import type { BaseVisualizationConfig, VisualizationGroupProps, SubentityPayload } from '../../types';
import './VisualizationGroup.css';

function normalizeId(id: string): string {
  return id.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const W = 56;   // connector column width (px)
const MID = 28; // horizontal midpoint

export function VisualizationGroup({ items, colorOffset = 0, 'data-testid': testID }: VisualizationGroupProps) {
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [selectedLabel, setSelectedLabel] = useState<string | undefined>(undefined);
  const [listenerItems, setListenerItems] = useState<SubentityPayload | null>(null);
  const [broadcasterIndex, setBroadcasterIndex] = useState<number | null>(null);
  const [connectorY, setConnectorY] = useState<number | null>(null);
  const [containerH, setContainerH] = useState<number>(0);
  const [endY, setEndY] = useState<number>(0);
  const chartsContainerRef = useRef<HTMLDivElement>(null);
  const listenerDivIdxRef = useRef<number | null>(null);

  // Capture the clicked item's Y and identify the listener div.
  // X is intentionally NOT captured — the tick always lives at the connector edge.
  useEffect(() => {
    const container = chartsContainerRef.current;
    if (!container) return;
    const handler = (e: Event) => {
      const { centerClientY } = (e as CustomEvent<{ centerClientY: number; centerClientX: number }>).detail;
      const rect = container.getBoundingClientRect();
      setConnectorY(centerClientY - rect.top);
      setContainerH(rect.height);

      const chartDivs = Array.from(container.children).filter((_, idx) => idx % 2 === 0) as HTMLElement[];
      const bDivIdx = chartDivs.findIndex(d => d.contains(e.target as Node));
      listenerDivIdxRef.current = bDivIdx === 0 ? chartDivs.length - 1 : 0;
    };
    container.addEventListener('viz-item-click', handler);
    return () => container.removeEventListener('viz-item-click', handler);
  }, []);

  // Measure listener canvas center Y after React re-renders with new listenerItems.
  useLayoutEffect(() => {
    const container = chartsContainerRef.current;
    const lIdx = listenerDivIdxRef.current;
    if (!container || lIdx === null || broadcasterIndex === null) return;
    const chartDivs = Array.from(container.children).filter((_, idx) => idx % 2 === 0) as HTMLElement[];
    const listenerDiv = chartDivs[lIdx];
    if (!listenerDiv) return;
    const lr = listenerDiv.getBoundingClientRect();
    const rect = container.getBoundingClientRect();
    setEndY(lr.top + lr.height / 2 - rect.top);
  }, [listenerItems, broadcasterIndex]);

  const handleItemClick = useCallback((chartIndex: number, id: string, label: string, subentity?: SubentityPayload) => {
    const normId = normalizeId(id);
    setSelectedId((prev) => {
      const next = prev === normId ? undefined : normId;
      setSelectedLabel(next ? label : undefined);
      if (next) {
        setBroadcasterIndex(chartIndex);
        const hasSubentity = subentity != null && (Array.isArray(subentity) ? subentity.length > 0 : true);
        setListenerItems(hasSubentity ? subentity! : null);
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
    setEndY(0);
  }, []);

  const isActive = broadcasterIndex !== null && connectorY !== null;
  const startY = connectorY ?? containerH / 2;

  return (
    <div className="viz-group" data-testid={testID}>
      <div className="viz-group__bar">
        {selectedId ? (
          <>
            <span className="viz-group__viewing-label">
              Viewing: <strong>{selectedLabel ?? selectedId}</strong>
            </span>
            <button
              type="button"
              className="viz-group__reset-btn"
              onClick={handleReset}
              aria-label="Reset selection"
            >
              ✕ Reset
            </button>
          </>
        ) : (
          <span className="viz-group__hint">
            ↑ Click a row to drill down
          </span>
        )}
      </div>
      <div ref={chartsContainerRef} className="viz-group__charts">
        {items.flatMap((config: BaseVisualizationConfig, i: number) => {
          const isListener = broadcasterIndex !== null && i !== broadcasterIndex && listenerItems !== null;
          const chart = (
            <div key={i} className={`viz-group__chart viz-group__chart--${config.type}${isListener ? ' viz-group__chart--listener' : ''}`}>
              <VisualizationRenderer
                config={config}
                colorOffset={colorOffset + i}
                onItemClick={(id, label, subentity) => handleItemClick(i, id, label, subentity)}
                selectedId={selectedId}
                listenerItems={i !== broadcasterIndex && listenerItems ? listenerItems : undefined}
              />
            </div>
          );
          if (i === items.length - 1) return [chart];

          const isReversed = broadcasterIndex !== null && broadcasterIndex > i;
          const dotX   = isReversed ? 2 : W - 2;
          // Tick always sits at the connector edge — never bleeds into a chart canvas.
          // The Y coordinate (startY) already identifies which item was clicked.
          const tickX  = isReversed ? W - 2 : 2;
          const path   = `M ${tickX} ${startY} H ${MID} V ${endY} H ${dotX}`;

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
                <line
                  x1={tickX} y1={startY - 7}
                  x2={tickX} y2={startY + 7}
                  className="viz-group__connector-tick"
                />
                <path d={path} className="viz-group__connector-path" />
                <circle cx={dotX} cy={endY} r="4" className="viz-group__connector-dot" />
              </svg>
            </div>
          );
          return [chart, connector];
        })}
      </div>
    </div>
  );
}
