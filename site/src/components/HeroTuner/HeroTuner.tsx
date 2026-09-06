'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_TUNING,
  TUNING,
  TUNING_DEFS,
  resetTuning,
  setTuning,
  type TuningKey,
} from '@/components/HeroParticles/particles';
import styles from './HeroTuner.module.css';

const STORAGE_KEY = 'hero-tuning';

type Values = Record<TuningKey, number>;

/** Only the values that differ from the shipped defaults. */
function changed(values: Values): Partial<Values> {
  const out: Partial<Values> = {};
  for (const key of Object.keys(DEFAULT_TUNING) as TuningKey[]) {
    if (values[key] !== DEFAULT_TUNING[key]) out[key] = values[key];
  }
  return out;
}

function format(v: number, step: number) {
  const decimals = step >= 1 ? 0 : Math.min(3, Math.ceil(-Math.log10(step)));
  return v.toFixed(decimals);
}

/**
 * Temporary, dev-only tuning panel for the hero particles. Edits the live
 * `TUNING` object the engine reads every frame; remembers changes in
 * localStorage across reloads; "Copy" puts the changed values on the
 * clipboard as JSON so they can be pasted back into DEFAULT_TUNING.
 */
export default function HeroTuner({ onClose }: { onClose: () => void }) {
  const [values, setValues] = useState<Values>(() => ({ ...TUNING }));
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  // Restore remembered values once.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as Record<string, unknown>;
      for (const [key, v] of Object.entries(saved)) {
        if (key in DEFAULT_TUNING && typeof v === 'number' && Number.isFinite(v)) {
          setTuning(key as TuningKey, v);
        }
      }
      setValues({ ...TUNING });
    } catch {
      // Ignore storage failures; defaults stay.
    }
  }, []);

  const groups = useMemo(() => {
    const map = new Map<string, typeof TUNING_DEFS>();
    for (const def of TUNING_DEFS) {
      const list = map.get(def.group) ?? [];
      list.push(def);
      map.set(def.group, list);
    }
    return [...map.entries()];
  }, []);

  const update = (key: TuningKey, v: number) => {
    setTuning(key, v);
    const next = { ...TUNING };
    setValues(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(changed(next)));
    } catch {
      // Ignore.
    }
  };

  const reset = () => {
    resetTuning();
    setValues({ ...TUNING });
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore.
    }
  };

  const copy = async () => {
    const diff = changed(values);
    const text = JSON.stringify(Object.keys(diff).length ? diff : values, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      window.prompt('Copy the tuning JSON:', text);
    }
  };

  const changedCount = Object.keys(changed(values)).length;

  return (
    <aside className={styles.panel} aria-label="Particle tuning">
      <header className={styles.header}>
        <strong className={styles.title}>Particle tuning</strong>
        <span className={styles.count}>{changedCount ? `${changedCount} changed` : 'defaults'}</span>
        <button type="button" className={styles.btn} onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button type="button" className={styles.btn} onClick={reset}>
          Reset
        </button>
        <button type="button" className={styles.btn} onClick={onClose} aria-label="Close tuning panel">
          ×
        </button>
      </header>
      <div className={styles.body}>
        {groups.map(([group, defs]) => {
          const isCollapsed = collapsed[group] ?? group !== 'Pointer';
          return (
            <section key={group} className={styles.group}>
              <button
                type="button"
                className={styles.groupToggle}
                aria-expanded={!isCollapsed}
                onClick={() => setCollapsed((c) => ({ ...c, [group]: !isCollapsed }))}
              >
                <span className={styles.chevron} data-open={!isCollapsed ? '' : undefined}>
                  ▸
                </span>
                {group}
              </button>
              {!isCollapsed && (
                <div className={styles.rows}>
                  {defs.map((def) => {
                    const v = values[def.key];
                    const isChanged = v !== DEFAULT_TUNING[def.key];
                    const id = `tune-${def.key}`;
                    return (
                      <label key={def.key} className={styles.row} htmlFor={id} title={def.note}>
                        <span className={styles.label} data-changed={isChanged ? '' : undefined}>
                          {def.label}
                          {def.note && <span className={styles.note}> ⏲</span>}
                        </span>
                        <input
                          id={id}
                          className={styles.range}
                          type="range"
                          min={def.min}
                          max={def.max}
                          step={def.step}
                          value={v}
                          onChange={(e) => update(def.key, Number(e.target.value))}
                        />
                        <input
                          className={styles.number}
                          type="number"
                          min={def.min}
                          max={def.max}
                          step={def.step}
                          value={format(v, def.step)}
                          onChange={(e) => {
                            const n = Number(e.target.value);
                            if (Number.isFinite(n)) update(def.key, n);
                          }}
                          aria-label={`${def.label} value`}
                        />
                      </label>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
        <p className={styles.hint}>
          ⏲ = takes effect on the next appearance or scene build. Values persist in this browser until
          Reset. Copy gives the changed values as JSON.
        </p>
      </div>
    </aside>
  );
}
