import { useState, useCallback } from 'react';
import { VisualizationRenderer } from '../visualizationRenderer/VisualizationRenderer';
import type { BaseVisualizationConfig, VisualizationGroupProps } from '../../types';

export function VisualizationGroup({ items, colorOffset = 0, 'data-testid': testId }: VisualizationGroupProps) {
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [selectedLabel, setSelectedLabel] = useState<string | undefined>(undefined);

  const handleItemClick = useCallback((id: string, label: string) => {
    setSelectedId((prev) => {
      const next = prev === id ? undefined : id;
      setSelectedLabel(next ? label : undefined);
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    setSelectedId(undefined);
    setSelectedLabel(undefined);
  }, []);

  return (
    <div className="viz-group" data-testid={testId}>
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
              onItemClick={handleItemClick}
              selectedId={selectedId}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
