import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  brandOf,
  cafeEmoji,
  cafes,
  filterCafes,
  pickCafe,
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
import { CafeCard } from './CafeCard';
import { CafeInfo, VIBE } from './CafeInfo';

const CITIES: City[] = ['hp', 'hn', 'hcm'];
const VIBE_ORDER = Object.keys(VIBE) as CafeTag[];

// Labels only the café catalogue uses.
const K = {
  vi: {
    title: 'Kho quán',
    search: 'Tìm tên quán, đường, phường…',
    empty: 'Không có quán nào khớp.',
    far: 'Quán mờ nằm ngoài bán kính đang chọn — vẫn xem được, nhưng reel sẽ không bốc.',
  },
  en: {
    title: 'Café catalogue',
    search: 'Search by name, street or ward…',
    empty: 'No café matches.',
    far: 'Faded cafés sit outside the chosen radius — you can still view them, but the reel will not pick them.',
  },
} as const;

const toggle = <T,>(list: T[], value: T): T[] =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

/** Case- and accent-insensitive, so "bac viet" finds "Bắc Việt". */
const fold = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');

type Props = {
  lang: Lang;
  prefs: Prefs;
  patch: (next: Partial<Prefs>) => void;
  sfx: Sfx;
};

export function CafeMode({ lang, prefs, patch, sfx }: Props) {
  const t = copy[lang];
  const k = K[lang];
  const reel = useRef<ReelHandle<Cafe>>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Cafe | null>(null);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Cafe | null>(null);

  const pool = useMemo(
    () => filterCafes(cafes, prefs.city, prefs.radiusKm, prefs.cafeTags),
    [prefs.city, prefs.radiusKm, prefs.cafeTags],
  );

  const cityCafes = useMemo(() => cafes.filter((c) => c.city === prefs.city), [prefs.city]);

  const branchCount = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of cityCafes) counts.set(brandOf(c), (counts.get(brandOf(c)) ?? 0) + 1);
    return counts;
  }, [cityCafes]);

  const catalogue = useMemo(() => {
    const q = fold(query.trim());
    const list = q ? cityCafes.filter((c) => fold(`${c.name} ${c.address} ${c.area}`).includes(q)) : cityCafes;
    return [...list].sort((a, b) => a.km - b.km || a.name.localeCompare(b.name, 'vi'));
  }, [cityCafes, query]);

  // A café from another city or radius is stale the moment the filters move.
  useEffect(() => {
    setResult(null);
  }, [prefs.city, prefs.radiusKm, prefs.cafeTags]);

  useEffect(() => {
    setSelected(null);
    setQuery('');
  }, [prefs.city]);

  useEffect(() => {
    if (selected) infoRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selected]);

  const pick = useCallback(() => {
    if (spinning || !pool.length) return;
    sfx.unlock();
    setResult(null);
    const winner = pickCafe(pool);
    reel.current?.run(
      winner,
      () => pickCafe(pool),
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
        <CafeInfo cafe={result} lang={lang} branches={branchCount.get(brandOf(result)) ?? 1} reveal />
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

      <section className="panels cafe-catalog" aria-label={k.title}>
        <div className="panel">
          <div className="panel-head">
            <strong>{k.title}</strong>
            <small>
              {catalogue.length} / {cityCafes.length} {t.cafes} · {CITY_LABEL[prefs.city]}
            </small>
          </div>

          <input
            className="search"
            type="search"
            placeholder={k.search}
            aria-label={k.search}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {selected && (
            <div ref={infoRef}>
              <CafeInfo cafe={selected} lang={lang} branches={branchCount.get(brandOf(selected)) ?? 1} />
            </div>
          )}

          {catalogue.length === 0 ? (
            <p className="hint">{k.empty}</p>
          ) : (
            <div className="catalog">
              {catalogue.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`catalog-row cafe-row ${selected?.id === c.id ? 'on' : ''} ${c.km > prefs.radiusKm ? 'is-far' : ''}`}
                  aria-pressed={selected?.id === c.id}
                  onClick={() => setSelected(c)}
                >
                  <span className="mini-emoji" aria-hidden="true">
                    {cafeEmoji(c)}
                  </span>
                  <span className="catalog-copy">
                    <strong>{c.name}</strong>
                    <small>
                      {c.area} · {c.address}
                    </small>
                  </span>
                  <span className="row-meta">
                    <small>~{c.km} km</small>
                    {c.rating !== undefined && <small>★ {c.rating.toFixed(1)}</small>}
                  </span>
                </button>
              ))}
            </div>
          )}

          <p className="hint">{k.far}</p>
        </div>
      </section>

      <p className="hint">{t.cafeSource}</p>
    </>
  );
}
