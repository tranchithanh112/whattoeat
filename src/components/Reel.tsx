import {
  Fragment,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import type { Sfx } from '@/lib/audio';

export const STEP = 176; // card width + gap, mirrored in styles.css
const STRIP = 48;
const WINNER_AT = 41;

export type ReelHandle<T> = { run: (winner: T, filler: () => T, onDone: () => void) => void };

type Props<T> = {
  handle: RefObject<ReelHandle<T> | null>;
  idle: T[];
  sfx: Sfx;
  onSpinningChange: (spinning: boolean) => void;
  renderCard: (item: T) => ReactNode;
  keyOf: (item: T) => string;
  /** 0..4 — how triumphant the reveal sounds. */
  revealLevel: (item: T) => number;
};

/**
 * The strip is rebuilt for every spin and animated exactly once, rather than
 * recycled at world coordinates. Forty-eight cards is nothing for the DOM and
 * it removes a whole class of drift bugs at the cost of one array rebuild.
 *
 * Generic over what it shows: dishes and cafés share the motion, the sound and
 * the timing, and differ only in the card they render.
 */
export function Reel<T>({ handle, idle, sfx, onSpinningChange, renderCard, keyOf, revealLevel }: Props<T>) {
  const [strip, setStrip] = useState<T[]>(() => idle.slice(0, 12));
  const track = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const busy = useRef(false);

  // While idle the strip mirrors the current pool, so filter changes show
  // before anyone presses the button. The track must return to the start as
  // well: after a spin it sits ~41 cards to the left, and a fresh 12-card
  // strip would otherwise render entirely off-screen, leaving the reel blank.
  useEffect(() => {
    if (busy.current) return;
    setStrip(idle.slice(0, 12));
    if (track.current) track.current.style.transform = 'translate3d(0,0,0)';
  }, [idle]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const run = useCallback(
    (winner: T, filler: () => T, onDone: () => void) => {
      const view = viewport.current;
      const node = track.current;
      if (busy.current || !view || !node) return;
      busy.current = true;
      onSpinningChange(true);

      const cards: T[] = [];
      for (let i = 0; i < STRIP; i++) cards.push(i === WINNER_AT ? winner : filler());
      setStrip(cards);

      const centre = view.clientWidth / 2;
      const start = centre - STEP / 2 - 2 * STEP;
      // Stop off-centre by a random slice of the card, so the reel never
      // lands with suspicious precision.
      const jitter = (Math.random() - 0.5) * STEP * 0.62;
      const end = centre - STEP / 2 - WINNER_AT * STEP + jitter;
      const duration = 5200 + Math.random() * 1400;
      const friction = 3.1 + Math.random() * 0.7;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      node.style.transform = `translate3d(${start}px,0,0)`;
      sfx.open();

      const began = performance.now();
      let lastCell = Math.floor((start - centre) / STEP);

      const step = (now: number) => {
        const p = Math.min(1, (now - began) / (reduced ? 240 : duration));
        const eased = 1 - Math.pow(1 - p, friction);
        const x = start + (end - start) * eased;
        node.style.transform = `translate3d(${x}px,0,0)`;

        const cell = Math.floor((x - centre) / STEP);
        if (cell !== lastCell) {
          sfx.tick(p);
          lastCell = cell;
        }

        if (p < 1) {
          frame.current = requestAnimationFrame(step);
          return;
        }
        busy.current = false;
        onSpinningChange(false);
        sfx.reveal(revealLevel(winner));
        onDone();
      };
      frame.current = requestAnimationFrame(step);
    },
    [onSpinningChange, sfx, revealLevel],
  );

  useImperativeHandle(handle, () => ({ run }), [run]);

  return (
    <div className="reel" ref={viewport}>
      <div className="reel-marker" aria-hidden="true" />
      <div className="reel-track" ref={track}>
        {strip.map((item, i) => (
          <Fragment key={`${i}-${keyOf(item)}`}>{renderCard(item)}</Fragment>
        ))}
      </div>
      <div className="reel-fade left" aria-hidden="true" />
      <div className="reel-fade right" aria-hidden="true" />
    </div>
  );
}
