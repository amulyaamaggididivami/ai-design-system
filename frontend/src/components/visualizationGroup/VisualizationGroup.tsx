import { useState, useCallback } from 'react';
import { VisualizationRenderer } from '../visualizationRenderer/VisualizationRenderer';
import type { BaseVisualizationConfig, VisualizationGroupProps, SubentityPayload } from '../../types';
import './VisualizationGroup.css';

function normalizeId(id: string): string {
  return id.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function VisualizationGroup({ items, colorOffset = 0, 'data-testid': testID }: VisualizationGroupProps) {
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [selectedLabel, setSelectedLabel] = useState<string | undefined>(undefined);
  const [listenerItems, setListenerItems] = useState<SubentityPayload | null>(null);
  const [broadcasterIndex, setBroadcasterIndex] = useState<number | null>(null);

  const handleItemClick = useCallback((chartIndex: number, id: string, label: string, subentity?: SubentityPayload) => {
    const normId = normalizeId(id);
    setSelectedId((prev) => {
      const next = prev === normId ? undefined : normId;
      setSelectedLabel(next ? label : undefined);
      const hasSubentity = subentity != null && (Array.isArray(subentity) ? subentity.length > 0 : true);
      if (next && hasSubentity) {
        setListenerItems(subentity);
        setBroadcasterIndex(chartIndex);
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
  }, []);

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
      <div className="viz-group__charts">
        {items.map((config: BaseVisualizationConfig, i: number) => (
          <div key={i} className={`viz-group__chart viz-group__chart--${config.type}`}>
            <VisualizationRenderer
              config={config}
              colorOffset={colorOffset + i}
              onItemClick={(id, label, subentity) => handleItemClick(i, id, label, subentity)}
              selectedId={selectedId}
              listenerItems={i !== broadcasterIndex && listenerItems ? listenerItems : undefined}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
