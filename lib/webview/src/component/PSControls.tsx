import React from "react";

export interface PSControlsProps {
  mode: "debug" | "explain" | "learn" | "reveal";
  hintLevel: number;
  onModeChange: (mode: "debug" | "explain" | "learn" | "reveal") => void;
  onHintLevelChange: (level: number) => void;
  disabled?: boolean;
}

export const PSControls: React.FC<PSControlsProps> = ({
  mode,
  hintLevel,
  onModeChange,
  onHintLevelChange,
  disabled = false,
}) => {
  return (
    <div className="ps-controls">
      <div className="control-row">
        <label htmlFor="mode-select">Mode:</label>
        <select
          id="mode-select"
          value={mode}
          onChange={(e) =>
            onModeChange(
              e.target.value as "debug" | "explain" | "learn" | "reveal"
            )
          }
          disabled={disabled}
        >
          <option value="debug">Debug</option>
          <option value="explain">Explain</option>
          <option value="learn">Learn</option>
          <option value="reveal">Reveal</option>
        </select>
      </div>

      <div className="control-row">
        <label htmlFor="hint-level">Hint Level: {hintLevel}</label>
        <div className="hint-level-controls">
          <button
            className="hint-level-btn"
            onClick={() => onHintLevelChange(Math.max(0, hintLevel - 1))}
            disabled={disabled || hintLevel === 0}
            title="Decrease hint level"
          >
            -
          </button>
          <input
            id="hint-level"
            type="range"
            min="0"
            max="4"
            value={hintLevel}
            onChange={(e) => onHintLevelChange(parseInt(e.target.value, 10))}
            disabled={disabled}
            className="hint-level-slider"
          />
          <button
            className="hint-level-btn"
            onClick={() => onHintLevelChange(Math.min(4, hintLevel + 1))}
            disabled={disabled || hintLevel === 4}
            title="Increase hint level"
          >
            +
          </button>
        </div>
      </div>

      <div className="hint-level-description">
        {getHintLevelDescription(hintLevel)}
      </div>
    </div>
  );
};

function getHintLevelDescription(level: number): string {
  const descriptions = [
    "L0: Reflect + ask clarifying question",
    "L1: Ask invariant/assumption check",
    "L2: Propose tiny experiment (print/debug)",
    "L3: Point to suspicious region/condition",
    "L4: Partial pseudocode / key insight",
  ];
  return descriptions[level] || descriptions[0];
}
