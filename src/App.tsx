import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { dishes, type Dish } from '@/lib/dishes';
import { buildSelector } from '@/lib/selector';
import { mulberry32, roomSeed } from '@/lib/rng';
import { Sfx } from '@/lib/audio';
import { copy, dishName } from '@/lib/i18n';
import {
  defaultPrefs,
  emptyPool,
  loadHistory,
  loadPool,
  loadPrefs,
  newCustomId,
  toDish,
  write,
  MAX_HISTORY,
  type CustomDish,
  type Pool,
  type Prefs,
  type Spin,
} from '@/lib/storage';
import { Reel, type ReelHandle } from '@/components/Reel';
import { Filters } from '@/components/Filters';
import { Panels } from '@/components/Panels';
import { ResultDialog } from '@/components/ResultDialog';

const toggleIn = (list: string[], id: string) =>
  list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

export default function App() {
  const [prefs, setPrefs] = useState<Prefs>(defaultPrefs);
  const [pool, setPool] = useState<Pool>(emptyPool);
  const [history, setHistory] = useState<Spin[]>([]);
  const [ready, setReady] = useState(false);
  const [storageBlocked, setStorageBlocked] = useState(false);

  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Dish | null>(null);
  const [room, setRoom] = useState('');
  const [groupDish, setGroupDish] = useState<Dish | null>(null);
  const [shareNote, setShareNote] = useState('');
  const [copyNote, setCopyNote] = useState('');

  const reel = useRef<ReelHandle>(null);
  const sfx = useMemo(() => new Sfx(), []);
  const t = copy[prefs.lang];

  // ---- persistence -------------------------------------------------------
  useEffect(() => {
    setPrefs(loadPrefs());
    setPool(loadPool());
    setHistory(loadHistory());
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
        (prefs.meal === 'any' || d.meals.includes(prefs.meal)) &&
        (prefs.cuisines.length === 0 || prefs.cuisines.includes(d.cuisine)) &&
        prefs.include.every((tag) => d.tags.includes(tag)) &&
        !prefs.exclude.some((tag) => d.tags.includes(tag)),
    );
  }, [all, pool.blocked, prefs.meal, prefs.cuisines, prefs.include, prefs.exclude]);

  const selector = useMemo(
    () => buildSelector(eligible, prefs.budget, favorites),
    [eligible, prefs.budget, favorites],
  );

  // ---- deep links --------------------------------------------------------
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const invited = params.get('room');
    const shared = params.get('d');
    if (invited) setRoom(invited.slice(0, 24));
    if (shared) {
      // Resolve against the catalogue only: a link must never be able to
      // inject a dish that is not part of this build.
      const dish = dishes.find((d) => d.id === shared);
      if (dish) setResult(dish);
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

  // Space or Enter spins, as long as focus is not inside a control.
  useEffect(() => {
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
  }, [spin]);

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            🍜
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

        <Reel handle={reel} lang={prefs.lang} idle={eligible} sfx={sfx} onSpinningChange={setSpinning} />

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
          poolSize={eligible.length}
          poolAverage={selector?.expectedPrice ?? 0}
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
        />
      </main>

      <footer>
        <span>
          {t.brand} · {all.length} {t.dishes}
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
