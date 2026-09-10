import { useMemo, useState } from 'react';
import type { Dish } from '@/lib/dishes';
import { copy, dishName, priceLabel, type Lang } from '@/lib/i18n';
import { MAX_CUSTOM, type CustomDish, type Pool, type Spin } from '@/lib/storage';
import { DishCard, Plate } from './DishCard';

type Tab = 'catalog' | 'custom' | 'history' | 'stats' | 'group';

type Props = {
  lang: Lang;
  all: Dish[];
  pool: Pool;
  history: Spin[];
  byId: Map<string, Dish>;
  onToggleFavorite: (id: string) => void;
  onToggleBlock: (id: string) => void;
  onAddCustom: (dish: Omit<CustomDish, 'id'>) => void;
  onRemoveCustom: (id: string) => void;
  onClearHistory: () => void;
  room: string;
  onRoomChange: (room: string) => void;
  onGroupSpin: () => void;
  groupDish: Dish | null;
  onCopyInvite: () => void;
  copyNote: string;
};

const DAY = 86_400_000;
const dayKey = (ms: number) => Math.floor(ms / DAY);

export function Panels(props: Props) {
  const { lang, all, pool, history, byId } = props;
  const t = copy[lang];
  const [tab, setTab] = useState<Tab>('catalog');
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('40');
  const [veg, setVeg] = useState(false);
  const [emoji, setEmoji] = useState('🍽️');
  const [formError, setFormError] = useState('');

  const favorites = useMemo(() => new Set(pool.favorites), [pool.favorites]);
  const blocked = useMemo(() => new Set(pool.blocked), [pool.blocked]);

  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase();
    const list = q
      ? all.filter((d) => dishName(d, lang).toLocaleLowerCase().includes(q) || d.en.toLowerCase().includes(q))
      : all;
    // Favourites first, blocked last, then by price — the order people
    // actually want when curating a pool.
    return [...list].sort((a, b) => {
      const rank = (d: Dish) => (favorites.has(d.id) ? 0 : blocked.has(d.id) ? 2 : 1);
      return (
        rank(a) - rank(b) || a.price - b.price || dishName(a, lang).localeCompare(dishName(b, lang), lang)
      );
    });
  }, [all, search, lang, favorites, blocked]);

  const stats = useMemo(() => {
    const spend = history.reduce((s, h) => s + h.price, 0);
    const counts = new Map<string, number>();
    for (const h of history) counts.set(h.id, (counts.get(h.id) ?? 0) + 1);
    let topId = '';
    let topCount = 0;
    for (const [id, n] of counts) {
      if (n > topCount) {
        topId = id;
        topCount = n;
      }
    }
    // Streak: consecutive days with a spin, ending today or yesterday.
    const days = new Set(history.map((h) => dayKey(h.at)));
    const today = dayKey(Date.now());
    let streak = 0;
    let cursor = days.has(today) ? today : today - 1;
    while (days.has(cursor)) {
      streak++;
      cursor--;
    }
    return { total: history.length, spend, topId, streak };
  }, [history]);

  const recent = history.slice(-30);
  const peak = Math.max(1, ...recent.map((h) => h.price));
  const topDish = stats.topId ? byId.get(stats.topId) : undefined;

  function submitCustom() {
    const value = Number(price);
    const clean = name.trim();
    if (!clean || clean.length > 60 || !Number.isInteger(value) || value < 5 || value > 999) {
      setFormError(
        lang === 'vi' ? 'Tên 1–60 ký tự, giá 5–999 nghìn.' : 'Name 1–60 characters, price 5–999 thousand.',
      );
      return;
    }
    if (pool.custom.length >= MAX_CUSTOM) {
      setFormError(lang === 'vi' ? `Tối đa ${MAX_CUSTOM} món.` : `Up to ${MAX_CUSTOM} dishes.`);
      return;
    }
    props.onAddCustom({ vi: clean, price: value, veg, emoji: emoji || '🍽️' });
    setName('');
    setFormError('');
  }

  const tabs: [Tab, string][] = [
    ['catalog', t.tabCatalog],
    ['custom', t.tabCustom],
    ['history', t.tabHistory],
    ['stats', t.tabStats],
    ['group', t.tabGroup],
  ];

  return (
    <section className="panels">
      <div className="tabbar" role="tablist" aria-label={t.settings}>
        {tabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={tab === id ? 'on' : ''}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'catalog' && (
        <div className="panel">
          <div className="panel-head">
            <input
              className="search"
              type="search"
              placeholder={t.search}
              aria-label={t.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <small>
              {all.length - blocked.size} / {all.length} {t.dishes}
              {blocked.size > 0 && ` · ${blocked.size} ${t.blockedNote}`}
            </small>
          </div>
          <p className="hint">{t.favoritesNote}</p>
          <div className="catalog">
            {filtered.map((dish) => (
              <div key={dish.id} className={`catalog-row ${blocked.has(dish.id) ? 'is-blocked' : ''}`}>
                <Plate dish={dish} size="sm" />
                <div className="catalog-copy">
                  <strong>{dishName(dish, lang)}</strong>
                  <small>{priceLabel(dish.price, lang, true)}</small>
                </div>
                <button
                  type="button"
                  className={`icon ${favorites.has(dish.id) ? 'on' : ''}`}
                  aria-pressed={favorites.has(dish.id)}
                  aria-label={`${favorites.has(dish.id) ? t.unfavorite : t.favorite}: ${dishName(dish, lang)}`}
                  onClick={() => props.onToggleFavorite(dish.id)}
                >
                  ★
                </button>
                <button
                  type="button"
                  className={`icon ${blocked.has(dish.id) ? 'on danger' : ''}`}
                  aria-pressed={blocked.has(dish.id)}
                  aria-label={`${blocked.has(dish.id) ? t.unblock : t.block}: ${dishName(dish, lang)}`}
                  onClick={() => props.onToggleBlock(dish.id)}
                >
                  ⊘
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'custom' && (
        <div className="panel">
          <div className="custom-form">
            <label>
              {t.dishName}
              <input value={name} maxLength={60} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="narrow">
              {t.price}
              <input
                type="number"
                inputMode="numeric"
                min={5}
                max={999}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </label>
            <label className="narrow">
              Emoji
              <input value={emoji} maxLength={4} onChange={(e) => setEmoji(e.target.value)} />
            </label>
            <label className="checkbox">
              <input type="checkbox" checked={veg} onChange={(e) => setVeg(e.target.checked)} />
              {t.vegetarian}
            </label>
            <button type="button" className="cta solid" onClick={submitCustom}>
              + {t.addDish}
            </button>
          </div>
          {formError && (
            <p className="hint danger" role="alert">
              {formError}
            </p>
          )}
          {pool.custom.length === 0 ? (
            <p className="hint">{t.noCustom}</p>
          ) : (
            <div className="catalog">
              {pool.custom.map((c) => (
                <div key={c.id} className="catalog-row">
                  <span className="mini-emoji" aria-hidden="true">
                    {c.emoji}
                  </span>
                  <div className="catalog-copy">
                    <strong>
                      {c.vi} {c.veg && '🌱'}
                    </strong>
                    <small>{priceLabel(c.price, lang, true)}</small>
                  </div>
                  <button
                    type="button"
                    className="icon"
                    aria-label={`${t.remove}: ${c.vi}`}
                    onClick={() => props.onRemoveCustom(c.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'history' && (
        <div className="panel">
          {history.length === 0 ? (
            <p className="hint">{t.noHistory}</p>
          ) : (
            <>
              <div className="panel-head">
                <small>
                  {history.length} {t.totalSpins.toLowerCase()}
                </small>
                <button type="button" className="link-button" onClick={props.onClearHistory}>
                  {t.clearHistory}
                </button>
              </div>
              <div className="catalog">
                {[...history].reverse().map((spin, i) => {
                  const dish = byId.get(spin.id);
                  return (
                    <div key={`${spin.at}-${i}`} className="catalog-row">
                      <span className="mini-emoji" aria-hidden="true">
                        {dish?.emoji ?? '🍽️'}
                      </span>
                      <div className="catalog-copy">
                        <strong>{dish ? dishName(dish, lang) : spin.id}</strong>
                        <small>
                          {new Date(spin.at).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </small>
                      </div>
                      <small className="row-price">{priceLabel(spin.price, lang, true)}</small>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'stats' && (
        <div className="panel">
          <div className="stat-grid">
            <div className="stat">
              <span>{t.totalSpins}</span>
              <strong>{stats.total}</strong>
            </div>
            <div className="stat">
              <span>{t.estSpend}</span>
              <strong>{priceLabel(stats.spend, lang, true)}</strong>
            </div>
            <div className="stat">
              <span>{t.streak}</span>
              <strong>
                {stats.streak} {t.days}
              </strong>
            </div>
            <div className="stat">
              <span>{t.topDish}</span>
              <strong>{topDish ? `${topDish.emoji} ${dishName(topDish, lang)}` : '—'}</strong>
            </div>
          </div>
          {recent.length > 0 && (
            <>
              <p className="hint">{t.last30}</p>
              <div className="spark" role="img" aria-label={t.last30}>
                {recent.map((h, i) => (
                  <span
                    key={`${h.at}-${i}`}
                    style={{ height: `${Math.max(8, (h.price / peak) * 100)}%` }}
                    title={priceLabel(h.price, lang, true)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'group' && (
        <div className="panel">
          <h3>{t.groupTitle}</h3>
          <p className="hint">{t.groupHint}</p>
          <div className="group-form">
            <label>
              {t.roomCode}
              <input
                value={props.room}
                maxLength={24}
                placeholder="team-backend"
                onChange={(e) => props.onRoomChange(e.target.value)}
              />
            </label>
            <button
              type="button"
              className="cta solid"
              disabled={!props.room.trim()}
              onClick={props.onGroupSpin}
            >
              {t.joinRoom}
            </button>
            <button
              type="button"
              className="cta ghost"
              disabled={!props.room.trim()}
              onClick={props.onCopyInvite}
            >
              {props.copyNote || t.copyInvite}
            </button>
          </div>
          {props.groupDish && (
            <div className="group-result">
              <span className="hint">{t.groupResult}</span>
              <DishCard dish={props.groupDish} lang={lang} />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
