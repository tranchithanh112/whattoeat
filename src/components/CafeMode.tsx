import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  cafes,
  filterCafes,
  mapsUrl,
  CITY_CENTRE,
  CITY_LABEL,
  type Cafe,
  type CafeTag,
  type City,
} from '@/lib/cafes';
import { copy, type Lang } from '@/lib/i18n';
import type { Prefs } from '@/lib/storage';
import type { Sfx } from '@/lib/audio';
import { Reel, type ReelHandle } from './Reel';
import { CafeCard, Cup } from './CafeCard';

const CITIES: City[] = ['hp', 'hn', 'hcm'];

const VIBE: Record<CafeTag, { vi: string; en: string; icon: string }> = {
  work: { vi: 'Ngồi làm việc', en: 'Work-friendly', icon: '💻' },
  quiet: { vi: 'Yên tĩnh', en: 'Quiet', icon: '🤫' },
  view: { vi: 'View đẹp', en: 'Good view', icon: '🌅' },
  garden: { vi: 'Sân vườn', en: 'Garden', icon: '🌿' },
  rooftop: { vi: 'Rooftop', en: 'Rooftop', icon: '🏙️' },
  vintage: { vi: 'Hoài cổ', en: 'Vintage', icon: '📻' },
  book: { vi: 'Cà phê sách', en: 'Books', icon: '📚' },
  photo: { vi: 'Chụp ảnh', en: 'Photogenic', icon: '📸' },
  late: { vi: 'Mở khuya', en: 'Open late', icon: '🌙' },
  pet: { vi: 'Có mèo', en: 'Cats', icon: '🐱' },
  chain: { vi: 'Chuỗi', en: 'Chain', icon: '🏪' },
};

const VIBE_ORDER = Object.keys(VIBE) as CafeTag[];

const toggle = <T,>(list: T[], value: T): T[] =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

const randomOf = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)];

type Props = {
  lang: Lang;
  prefs: Prefs;
  patch: (next: Partial<Prefs>) => void;
  sfx: Sfx;
};

export function CafeMode({ lang, prefs, patch, sfx }: Props) {
  const t = copy[lang];
  const reel = useRef<ReelHandle<Cafe>>(null);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Cafe | null>(null);

  const pool = useMemo(
    () => filterCafes(cafes, prefs.city, prefs.radiusKm, prefs.cafeTags),
    [prefs.city, prefs.radiusKm, prefs.cafeTags],
  );

  // A café from another city or radius is stale the moment the filters move.
  useEffect(() => {
    setResult(null);
  }, [prefs.city, prefs.radiusKm, prefs.cafeTags]);

  // Uniform, deliberately: cafés carry no price to weight by, and a review
  // listicle's ordering is not a preference worth inheriting.
  const pick = useCallback(() => {
    if (spinning || !pool.length) return;
    sfx.unlock();
    setResult(null);
    const winner = randomOf(pool);
    reel.current?.run(
      winner,
      () => randomOf(pool),
      () => setResult(winner),
    );
  }, [spinning, pool, sfx]);

  // Space or Enter picks while this mode is on screen, as for dishes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' && e.code !== 'Enter') return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON' || tag === 'SELECT') return;
      if (document.querySelector('dialog[open]')) return;
      e.preventDefault();
      pick();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pick]);

  return (
    <>
      <Reel
        handle={reel}
        idle={pool}
        sfx={sfx}
        onSpinningChange={setSpinning}
        renderCard={(cafe) => <CafeCard cafe={cafe} />}
        keyOf={(cafe) => cafe.id}
        // A view or a rooftop is the café equivalent of a rare drop.
        revealLevel={(cafe) => (cafe.tags.includes('rooftop') || cafe.tags.includes('view') ? 3 : 2)}
      />

      <div className="spin-bar">
        <button type="button" className="spin-button" disabled={spinning || !pool.length} onClick={pick}>
          {spinning ? t.cafePicking : t.pickCafe}
        </button>
      </div>

      {!pool.length && (
        <p className="banner" role="status">
          {t.cafeEmpty}
        </p>
      )}

      {result && !spinning && (
        <div className="cafe-result reveal" role="status" aria-live="polite">
          <div className="cafe-hero">
            <Cup cafe={result} size="lg" />
            <div className="cafe-hero-copy">
              <strong>{result.name}</strong>
              <span className="cafe-where">
                {result.area} · {result.address}
              </span>
              <span className="cafe-meta">
                ~{result.km} km {t.fromCentre} {CITY_CENTRE[result.city]}
              </span>
            </div>
          </div>
          <div className="chips">
            {result.tags.map((tag) => (
              <span key={tag} className="chip static">
                {VIBE[tag].icon} {VIBE[tag][lang]}
              </span>
            ))}
          </div>
          <a className="cta solid" href={mapsUrl(result)} target="_blank" rel="noreferrer noopener">
            {t.openMaps} ↗
          </a>
        </div>
      )}

      <section className="filters" aria-label={t.settings}>
        <div className="filter-row">
          <span className="filter-label">{t.city}</span>
          <div className="segmented" role="group" aria-label={t.city}>
            {CITIES.map((c) => (
              <button
                key={c}
                type="button"
                className={prefs.city === c ? 'on' : ''}
                aria-pressed={prefs.city === c}
                disabled={spinning}
                onClick={() => patch({ city: c })}
              >
                {CITY_LABEL[c]}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-row">
          <div className="budget-head">
            <label htmlFor="radius">{t.radius}</label>
            <output htmlFor="radius" className="budget-value">
              {prefs.radiusKm} km
            </output>
          </div>
          <input
            id="radius"
            type="range"
            min={1}
            max={30}
            step={1}
            value={prefs.radiusKm}
            disabled={spinning}
            onChange={(e) => patch({ radiusKm: Number(e.target.value) })}
          />
          <div className="budget-foot">
            <small>
              {t.fromCentre} {CITY_CENTRE[prefs.city]}
            </small>
            <small>
              {pool.length} {t.cafes}
            </small>
          </div>
        </div>

        <div className="filter-row">
          <span className="filter-label">{t.cafeVibe}</span>
          <div className="chips">
            {VIBE_ORDER.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`chip ${prefs.cafeTags.includes(tag) ? 'on' : ''}`}
                aria-pressed={prefs.cafeTags.includes(tag)}
                disabled={spinning}
                onClick={() => patch({ cafeTags: toggle(prefs.cafeTags, tag) })}
              >
                <span aria-hidden="true">{VIBE[tag].icon}</span> {VIBE[tag][lang]}
              </button>
            ))}
          </div>
        </div>
      </section>

      <p className="hint">{t.cafeSource}</p>
    </>
  );
}
