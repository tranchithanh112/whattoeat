import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cafes, mapsUrl, CITY_CENTRE, CITY_LABEL, type Cafe, type CafeTag, type City } from '@/lib/cafes';
import { copy, type Lang } from '@/lib/i18n';
import type { Prefs } from '@/lib/storage';
import type { Sfx } from '@/lib/audio';

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

export function CafeTab({
  lang,
  prefs,
  patch,
  sfx,
}: {
  lang: Lang;
  prefs: Prefs;
  patch: (next: Partial<Prefs>) => void;
  sfx: Sfx;
}) {
  const t = copy[lang];
  const [picking, setPicking] = useState(false);
  const [shown, setShown] = useState<Cafe | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const pool = useMemo(
    () =>
      cafes.filter(
        (c) =>
          c.city === prefs.city &&
          c.km <= prefs.radiusKm &&
          // No vibe selected means anything goes; otherwise one match is
          // enough. Requiring every selected vibe empties the pool almost
          // immediately at this catalogue size.
          (prefs.cafeTags.length === 0 || prefs.cafeTags.some((tag) => c.tags.includes(tag))),
      ),
    [prefs.city, prefs.radiusKm, prefs.cafeTags],
  );

  // Changing the filters invalidates whatever is on screen.
  useEffect(() => {
    setShown(null);
  }, [prefs.city, prefs.radiusKm, prefs.cafeTags]);

  const pick = useCallback(() => {
    if (picking || !pool.length) return;
    sfx.unlock();
    sfx.open();
    setPicking(true);
    timers.current.forEach(clearTimeout);
    timers.current = [];

    // A short flicker through candidates, then settle. Cheaper than a full
    // reel and it still reads as a draw rather than an instant answer.
    const winner = pool[Math.floor(Math.random() * pool.length)];
    const flickers = 12;
    for (let i = 0; i < flickers; i++) {
      timers.current.push(
        window.setTimeout(() => {
          setShown(pool[Math.floor(Math.random() * pool.length)]);
          sfx.tick(i / flickers);
        }, i * 90),
      );
    }
    timers.current.push(
      window.setTimeout(
        () => {
          setShown(winner);
          setPicking(false);
          sfx.reveal(2);
        },
        flickers * 90 + 120,
      ),
    );
  }, [picking, pool, sfx]);

  return (
    <div className="panel">
      <div className="filter-row">
        <span className="filter-label">{t.city}</span>
        <div className="segmented" role="group" aria-label={t.city}>
          {CITIES.map((c) => (
            <button
              key={c}
              type="button"
              className={prefs.city === c ? 'on' : ''}
              aria-pressed={prefs.city === c}
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
              onClick={() => patch({ cafeTags: toggle(prefs.cafeTags, tag) })}
            >
              <span aria-hidden="true">{VIBE[tag].icon}</span> {VIBE[tag][lang]}
            </button>
          ))}
        </div>
      </div>

      <button type="button" className="spin-button" disabled={picking || !pool.length} onClick={pick}>
        {picking ? t.cafePicking : t.pickCafe}
      </button>

      {!pool.length && <p className="banner">{t.cafeEmpty}</p>}

      {shown && (
        <div className={`cafe-result ${picking ? 'is-picking' : ''}`}>
          <strong>{shown.name}</strong>
          <span className="cafe-where">
            {shown.area} · {shown.address}
          </span>
          <span className="cafe-meta">
            ~{shown.km} km {t.fromCentre} {CITY_CENTRE[shown.city]}
          </span>
          <div className="chips">
            {shown.tags.map((tag) => (
              <span key={tag} className="chip static">
                {VIBE[tag].icon} {VIBE[tag][lang]}
              </span>
            ))}
          </div>
          {!picking && (
            <a className="cta solid" href={mapsUrl(shown)} target="_blank" rel="noreferrer noopener">
              {t.openMaps} ↗
            </a>
          )}
        </div>
      )}

      <p className="hint">{t.cafeSource}</p>
    </div>
  );
}
