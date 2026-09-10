import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { dishes, type Dish } from '@/lib/dishes';
import { cafes } from '@/lib/cafes';
import { buildSelector, withinBudget, BUDGET_MEAN_RATIO } from '@/lib/selector';
import { mulberry32, roomSeed } from '@/lib/rng';
import { Sfx } from '@/lib/audio';
import { copy, dishName } from '@/lib/i18n';
import {
  defaultBody,
  defaultPrefs,
  emptyDiary,
  emptyPool,
  loadBody,
  loadDiary,
  loadHistory,
  loadMode,
  loadPool,
  loadPrefs,
  newCustomId,
  toDish,
  write,
  MAX_HISTORY,
  type Body,
  type CustomDish,
  type Diary,
  type Mode,
  type Pool,
  type Prefs,
  type Spin,
} from '@/lib/storage';
import { BIAS_TAGS, weatherBias, type WeatherBias } from '@/lib/weather';
import { Reel, type ReelHandle } from '@/components/Reel';
import { DishCard } from '@/components/DishCard';
import { CafeMode } from '@/components/CafeMode';
import { Filters } from '@/components/Filters';
import { Panels } from '@/components/Panels';
import { ResultDialog } from '@/components/ResultDialog';

const toggleIn = (list: string[], id: string) =>
  list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

// Two labels used only here, so they stay out of the shared copy table.
const MODES: { id: Mode; vi: string; en: string; icon: string }[] = [
  { id: 'food', vi: 'Món ăn', en: 'Food', icon: '🍜' },
  { id: 'cafe', vi: 'Quán cà phê', en: 'Cafés', icon: '☕' },
];

export default function App() {
  const [prefs, setPrefs] = useState<Prefs>(defaultPrefs);
  const [pool, setPool] = useState<Pool>(emptyPool);
  const [history, setHistory] = useState<Spin[]>([]);
  const [diary, setDiary] = useState<Diary>(emptyDiary);
  const [body, setBody] = useState<Body>(defaultBody);
  const [weather, setWeather] = useState<WeatherBias | null>(null);
  const [mode, setMode] = useState<Mode>('food');
  const [ready, setReady] = useState(false);
  const [storageBlocked, setStorageBlocked] = useState(false);

  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Dish | null>(null);
  const [room, setRoom] = useState('');
  const [groupDish, setGroupDish] = useState<Dish | null>(null);
  const [shareNote, setShareNote] = useState('');
  const [copyNote, setCopyNote] = useState('');

  const reel = useRef<ReelHandle<Dish>>(null);
  const sfx = useMemo(() => new Sfx(), []);
  const t = copy[prefs.lang];

  // ---- persistence -------------------------------------------------------
  useEffect(() => {
    setPrefs(loadPrefs());
    setPool(loadPool());
    setHistory(loadHistory());
    setDiary(loadDiary());
    setBody(loadBody());
    setMode(loadMode());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready && !write('prefs', prefs)) setStorageBlocked(true);
  }, [ready, prefs]);
  useEffect(() => {
    if (ready && !write('pool', pool)) setStorageBlocked(true);
  }, [ready, pool]);
  useEffect(() => {
    if (ready && !write('history', history)) setStorageBlocked(true);
  }, [ready, history]);
  useEffect(() => {
    if (ready && !write('diary', diary)) setStorageBlocked(true);
  }, [ready, diary]);
  useEffect(() => {
    if (ready && !write('body', body)) setStorageBlocked(true);
  }, [ready, body]);
  useEffect(() => {
    if (ready && !write('mode', mode)) setStorageBlocked(true);
  }, [ready, mode]);

  // One anonymous request per city — a fixed centre coordinate, never the
  // user's location. Aborted if the city changes before it lands.
  useEffect(() => {
    const stop = new AbortController();
    void weatherBias(prefs.city, stop.signal).then(setWeather);
    return () => stop.abort();
  }, [prefs.city]);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = prefs.lang;
    root.dataset.theme = prefs.theme;
    document.title = `${t.brand} — ${t.tagline}`;
  }, [prefs.lang, prefs.theme, t]);

  // ---- audio lifecycle ---------------------------------------------------
  useEffect(() => {
    sfx.setMuted(!prefs.sound);
  }, [sfx, prefs.sound]);

  useEffect(() => {
    const onVisibility = () => (document.hidden ? sfx.suspend() : sfx.resume());
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      sfx.dispose();
    };
  }, [sfx]);

  // ---- pool --------------------------------------------------------------
  const all = useMemo(() => [...dishes, ...pool.custom.map(toDish)], [pool.custom]);
  const byId = useMemo(() => new Map(all.map((d) => [d.id, d])), [all]);
  const favorites = useMemo(() => new Set(pool.favorites), [pool.favorites]);

  const eligible = useMemo(() => {
    const blocked = new Set(pool.blocked);
    return all.filter(
      (d) =>
        !blocked.has(d.id) &&
        (prefs.kcalCap === 0 || d.kcal <= prefs.kcalCap) &&
        (prefs.meal === 'any' || d.meals.includes(prefs.meal)) &&
        (prefs.cuisines.length === 0 || prefs.cuisines.includes(d.cuisine)) &&
        prefs.include.every((tag) => d.tags.includes(tag)) &&
        !prefs.exclude.some((tag) => d.tags.includes(tag)),
    );
  }, [all, pool.blocked, prefs.kcalCap, prefs.meal, prefs.cuisines, prefs.include, prefs.exclude]);

  // Dishes drawn inside the no-repeat window get damped in the weighting.
  const recent = useMemo(() => {
    if (!prefs.noRepeatDays) return new Set<string>();
    const since = Date.now() - prefs.noRepeatDays * 86_400_000;
    return new Set(history.filter((h) => h.at >= since).map((h) => h.id));
  }, [history, prefs.noRepeatDays]);

  // Weather nudges through the same boost channel as favourites: on a rainy
  // day every soupy dish is temporarily as likely as a favourite. Reusing the
  // one mechanism keeps a second tuning knob out of the selector.
  const boosted = useMemo(() => {
    const set = new Set(favorites);
    const tags = weather ? BIAS_TAGS[weather.kind] : [];
    if (tags.length) {
      for (const dish of all) {
        if (tags.some((tag) => dish.tags.includes(tag))) set.add(dish.id);
      }
    }
    return set;
  }, [favorites, weather, all]);

  // The budget caps the pool before anything is weighted, so a dish priced
  // above it can never be drawn — only then is the mean aimed below the cap.
  const affordable = useMemo(() => withinBudget(eligible, prefs.budget), [eligible, prefs.budget]);

  const selector = useMemo(
    () => buildSelector(affordable, prefs.budget * BUDGET_MEAN_RATIO, boosted, recent),
    [affordable, prefs.budget, boosted, recent],
  );

  // ---- deep links --------------------------------------------------------
  // Declared after the loading effect, so on mount a link overrides the
  // stored mode rather than the other way round.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const invited = params.get('room');
    const shared = params.get('d');
    const wanted = params.get('mode');
    if (wanted === 'cafe' || wanted === 'food') setMode(wanted);
    if (invited) setRoom(invited.slice(0, 24));
    if (shared) {
      // Resolve against the catalogue only: a link must never be able to
      // inject a dish that is not part of this build.
      const dish = dishes.find((d) => d.id === shared);
      if (dish) {
        setMode('food');
        setResult(dish);
      }
    }
  }, []);

  // ---- actions -----------------------------------------------------------
  const record = useCallback((dish: Dish) => {
    setHistory((prev) =>
      [...prev, { id: dish.id, at: Date.now(), price: dish.price }].slice(-MAX_HISTORY),
    );
  }, []);

  const spin = useCallback(() => {
    if (spinning || !selector) return;
    sfx.unlock();
    setShareNote('');
    const winner = selector.pick();
    reel.current?.run(
      winner,
      () => selector.pick(),
      () => {
        setResult(winner);
        record(winner);
      },
    );
  }, [spinning, selector, sfx, record]);

  const groupSpin = useCallback(() => {
    if (spinning || !selector || !room.trim()) return;
    sfx.unlock();
    // Same room code on the same day gives everyone the same draw, with no
    // server involved.
    const dish = selector.pick(mulberry32(roomSeed(room)));
    setGroupDish(dish);
    reel.current?.run(
      dish,
      () => selector.pick(),
      () => {
        setResult(dish);
        record(dish);
      },
    );
  }, [spinning, selector, room, sfx, record]);

  const patch = useCallback((next: Partial<Prefs>) => setPrefs((prev) => ({ ...prev, ...next })), []);

  const toggleFavorite = useCallback((id: string) => {
    setPool((p) => ({
      ...p,
      favorites: toggleIn(p.favorites, id),
      blocked: p.blocked.filter((x) => x !== id),
    }));
  }, []);

  const toggleBlock = useCallback((id: string) => {
    setPool((p) => ({
      ...p,
      blocked: toggleIn(p.blocked, id),
      favorites: p.favorites.filter((x) => x !== id),
    }));
  }, []);

  const addCustom = useCallback((dish: Omit<CustomDish, 'id'>) => {
    setPool((p) => ({ ...p, custom: [...p.custom, { ...dish, id: newCustomId() }] }));
  }, []);

  const removeCustom = useCallback((id: string) => {
    setPool((p) => ({
      ...p,
      custom: p.custom.filter((c) => c.id !== id),
      favorites: p.favorites.filter((x) => x !== id),
      blocked: p.blocked.filter((x) => x !== id),
    }));
  }, []);

  const copyText = useCallback(
    async (text: string, note: (value: string) => void) => {
      try {
        await navigator.clipboard.writeText(text);
        note(t.copied);
      } catch {
        // Clipboard is blocked in some embedded views; show the URL rather
        // than failing silently.
        note(text);
      }
      setTimeout(() => note(''), 2500);
    },
    [t.copied],
  );

  const shareResult = useCallback(() => {
    if (!result) return;
    void copyText(`${location.origin}${location.pathname}?d=${encodeURIComponent(result.id)}`, setShareNote);
  }, [result, copyText]);

  const copyInvite = useCallback(() => {
    void copyText(
      `${location.origin}${location.pathname}?room=${encodeURIComponent(room.trim())}`,
      setCopyNote,
    );
  }, [room, copyText]);

  // Space or Enter spins the dish reel. Café mode registers its own handler
  // while it is mounted, so each key press drives only the reel on screen.
  useEffect(() => {
    if (mode !== 'food') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' && e.code !== 'Enter') return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON' || tag === 'SELECT') return;
      if (document.querySelector('dialog[open]')) return;
      e.preventDefault();
      spin();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [spin, mode]);

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            {mode === 'cafe' ? '☕' : '🍜'}
          </span>
          <div>
            <strong>{t.brand}</strong>
            <small>{t.tagline}</small>
          </div>
        </div>
        <div className="topbar-actions">
          <button
            type="button"
            className="ghost-button"
            aria-pressed={prefs.sound}
            onClick={() => patch({ sound: !prefs.sound })}
          >
            {prefs.sound ? '🔊' : '🔇'} <span className="hide-sm">{t.sound}</span>
          </button>
          <button
            type="button"
            className="ghost-button"
            onClick={() => patch({ theme: prefs.theme === 'dark' ? 'light' : 'dark' })}
            aria-label={t.theme}
          >
            {prefs.theme === 'dark' ? '🌙' : '☀️'} <span className="hide-sm">{t.theme}</span>
          </button>
          <button
            type="button"
            className="ghost-button"
            onClick={() => patch({ lang: prefs.lang === 'vi' ? 'en' : 'vi' })}
          >
            {t.language}
          </button>
        </div>
      </header>

      <main>
        {storageBlocked && (
          <p className="banner" role="status">
            {t.storageWarning}
          </p>
        )}

        {/* Locked while the dish reel runs: switching would unmount it with the
            animation still pending and leave the spin button stuck disabled. */}
        <div className="mode-switch" role="tablist" aria-label={`${MODES[0][prefs.lang]} / ${MODES[1][prefs.lang]}`}>
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={mode === m.id}
              className={mode === m.id ? 'on' : ''}
              disabled={spinning}
              onClick={() => setMode(m.id)}
            >
              <span aria-hidden="true">{m.icon}</span> {m[prefs.lang]}
            </button>
          ))}
        </div>

        {mode === 'food' ? (
          <>
            <Reel
              handle={reel}
              idle={affordable}
              sfx={sfx}
              onSpinningChange={setSpinning}
              renderCard={(dish) => <DishCard dish={dish} lang={prefs.lang} />}
              keyOf={(dish) => dish.id}
              revealLevel={(dish) => dish.rarity}
            />

            <div className="spin-bar">
              <button type="button" className="spin-button" disabled={spinning || !selector} onClick={spin}>
                {spinning ? t.spinning : result ? t.spinAgain : t.spin}
              </button>
              {result && !spinning && (
                <button type="button" className="link-button" onClick={() => setResult(result)}>
                  {dishName(result, prefs.lang)} ↗
                </button>
              )}
            </div>

            {!selector && (
              <p className="banner" role="status">
                {t.emptyPool}
              </p>
            )}

            <Filters
              prefs={prefs}
              patch={patch}
              poolSize={affordable.length}
              poolAverage={selector?.expectedPrice ?? 0}
              poolKcal={
                affordable.length
                  ? Math.round(affordable.reduce((sum, d) => sum + d.kcal, 0) / affordable.length)
                  : 0
              }
              weatherNote={
                weather
                  ? `${weather.kind === 'rain' ? t.weatherRain : weather.kind === 'hot' ? t.weatherHot : t.weatherMild} · ${Math.round(weather.tempC)}°C`
                  : ''
              }
              disabled={spinning}
            />

            <Panels
              lang={prefs.lang}
              all={all}
              pool={pool}
              history={history}
              byId={byId}
              onToggleFavorite={toggleFavorite}
              onToggleBlock={toggleBlock}
              onAddCustom={addCustom}
              onRemoveCustom={removeCustom}
              onClearHistory={() => setHistory([])}
              room={room}
              onRoomChange={setRoom}
              onGroupSpin={groupSpin}
              groupDish={groupDish}
              onCopyInvite={copyInvite}
              copyNote={copyNote}
              diary={diary}
              setDiary={setDiary}
              body={body}
              setBody={setBody}
            />
          </>
        ) : (
          <CafeMode lang={prefs.lang} prefs={prefs} patch={patch} sfx={sfx} />
        )}
      </main>

      <footer>
        <span>
          {t.brand} · {all.length} {t.dishes} · {cafes.length} {t.cafes}
        </span>
        <span className="muted">
          {prefs.lang === 'vi'
            ? 'Giá chỉ mang tính tham khảo. Dữ liệu lưu trên máy bạn.'
            : 'Prices are indicative. Your data stays on your device.'}
        </span>
      </footer>

      <ResultDialog
        dish={result}
        lang={prefs.lang}
        favorite={result ? favorites.has(result.id) : false}
        onFavorite={() => result && toggleFavorite(result.id)}
        onBlock={() => {
          if (!result) return;
          toggleBlock(result.id);
          setResult(null);
        }}
        onShare={shareResult}
        onAgain={() => {
          setResult(null);
          setTimeout(spin, 120);
        }}
        onClose={() => setResult(null)}
        shareNote={shareNote}
      />
    </div>
  );
}
