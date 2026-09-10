import { useMemo, useState } from 'react';
import type { Dish } from '@/lib/dishes';
import { copy, dishName, priceLabel, type Lang } from '@/lib/i18n';
import { tdee, MAX_DIARY, type Body, type Diary } from '@/lib/storage';

const PORTIONS = [0.5, 1, 1.5, 2];
const ACTIVITY = [1.2, 1.375, 1.55, 1.725, 1.9];

type Props = {
  lang: Lang;
  all: Dish[];
  byId: Map<string, Dish>;
  diary: Diary;
  setDiary: (next: Diary) => void;
  body: Body;
  setBody: (next: Body) => void;
};

export function DiaryTab({ lang, all, byId, diary, setDiary, body, setBody }: Props) {
  const t = copy[lang];
  const [search, setSearch] = useState('');
  const [portion, setPortion] = useState(1);

  const matches = useMemo(() => {
    const q = search.trim().toLocaleLowerCase();
    if (!q) return [];
    return all
      .filter((d) => dishName(d, lang).toLocaleLowerCase().includes(q) || d.en.toLowerCase().includes(q))
      .slice(0, 12);
  }, [all, search, lang]);

  const totals = useMemo(() => {
    let kcal = 0;
    let price = 0;
    for (const item of diary.items) {
      const dish = byId.get(item.id);
      if (!dish) continue;
      kcal += dish.kcal * item.portion;
      price += dish.price * item.portion;
    }
    return { kcal: Math.round(kcal), price: Math.round(price) };
  }, [diary.items, byId]);

  const need = tdee(body);
  const target = body.target || need;
  const left = target - totals.kcal;
  const pct = Math.min(100, Math.round((totals.kcal / Math.max(1, target)) * 100));

  const add = (dish: Dish) => {
    if (diary.items.length >= MAX_DIARY) return;
    setDiary({ ...diary, items: [...diary.items, { id: dish.id, portion, at: Date.now() }] });
    setSearch('');
  };

  return (
    <div className="panel">
      <div className="stat-grid">
        <div className="stat">
          <span>{t.consumed}</span>
          <strong>
            {totals.kcal} {t.kcal}
          </strong>
        </div>
        <div className="stat">
          <span>{t.target}</span>
          <strong>
            {target} {t.kcal}
          </strong>
        </div>
        <div className="stat">
          <span>{left >= 0 ? t.remaining : t.over}</span>
          <strong className={left >= 0 ? '' : 'danger-text'}>
            {Math.abs(left)} {t.kcal}
          </strong>
        </div>
        <div className="stat">
          <span>{t.estSpend}</span>
          <strong>{priceLabel(totals.price, lang, true)}</strong>
        </div>
      </div>

      <div className="meter" role="img" aria-label={`${pct}%`}>
        <span style={{ width: `${pct}%` }} className={left >= 0 ? '' : 'over'} />
      </div>

      <div className="custom-form">
        <label>
          {t.search}
          <input type="search" value={search} placeholder={t.search} onChange={(e) => setSearch(e.target.value)} />
        </label>
        <label className="narrow">
          {t.portion}
          <select value={portion} onChange={(e) => setPortion(Number(e.target.value))}>
            {PORTIONS.map((p) => (
              <option key={p} value={p}>
                {p}×
              </option>
            ))}
          </select>
        </label>
      </div>

      {matches.length > 0 && (
        <div className="catalog">
          {matches.map((dish) => (
            <div key={dish.id} className="catalog-row">
              <span className="mini-emoji" aria-hidden="true">
                {dish.emoji}
              </span>
              <div className="catalog-copy">
                <strong>{dishName(dish, lang)}</strong>
                <small>
                  ~{dish.kcal} {t.kcal} · {priceLabel(dish.price, lang, true)}
                </small>
              </div>
              <button
                type="button"
                className="icon"
                aria-label={`${t.diaryAdd} ${dishName(dish, lang)}`}
                onClick={() => add(dish)}
              >
                +
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="panel-head">
        <strong>{t.diaryTitle}</strong>
        {diary.items.length > 0 && (
          <button type="button" className="link-button" onClick={() => setDiary({ ...diary, items: [] })}>
            {t.diaryClear}
          </button>
        )}
      </div>

      {diary.items.length === 0 ? (
        <p className="hint">{t.diaryEmpty}</p>
      ) : (
        <div className="catalog">
          {diary.items.map((item, i) => {
            const dish = byId.get(item.id);
            return (
              <div key={`${item.at}-${i}`} className="catalog-row">
                <span className="mini-emoji" aria-hidden="true">
                  {dish?.emoji ?? '🍽️'}
                </span>
                <div className="catalog-copy">
                  <strong>
                    {dish ? dishName(dish, lang) : item.id}
                    {item.portion !== 1 && ` · ${item.portion}×`}
                  </strong>
                  <small>
                    ~{Math.round((dish?.kcal ?? 0) * item.portion)} {t.kcal}
                  </small>
                </div>
                <button
                  type="button"
                  className="icon"
                  aria-label={`${t.remove} ${dish ? dishName(dish, lang) : item.id}`}
                  onClick={() => setDiary({ ...diary, items: diary.items.filter((_, index) => index !== i) })}
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}

      <p className="hint">{t.kcalApprox}</p>

      <h3>{t.bodyTitle}</h3>
      <div className="custom-form">
        <label className="narrow">
          {t.sex}
          <select value={body.sex} onChange={(e) => setBody({ ...body, sex: e.target.value as 'm' | 'f' })}>
            <option value="m">{t.male}</option>
            <option value="f">{t.female}</option>
          </select>
        </label>
        <label className="narrow">
          {t.age}
          <input
            type="number"
            min={10}
            max={100}
            value={body.age}
            onChange={(e) => setBody({ ...body, age: Number(e.target.value) })}
          />
        </label>
        <label className="narrow">
          {t.height}
          <input
            type="number"
            min={120}
            max={220}
            value={body.height}
            onChange={(e) => setBody({ ...body, height: Number(e.target.value) })}
          />
        </label>
        <label className="narrow">
          {t.weight}
          <input
            type="number"
            min={25}
            max={250}
            value={body.weight}
            onChange={(e) => setBody({ ...body, weight: Number(e.target.value) })}
          />
        </label>
        <label>
          {t.activity}
          <select value={body.activity} onChange={(e) => setBody({ ...body, activity: Number(e.target.value) })}>
            {ACTIVITY.map((a, i) => (
              <option key={a} value={a}>
                {t.activityLevels[i]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="panel-head">
        <span>
          {t.tdeeResult}: <strong>{need}</strong> {t.kcal}
        </span>
        <button type="button" className="cta ghost" onClick={() => setBody({ ...body, target: need })}>
          {t.useTdee}
        </button>
      </div>
      <p className="hint">{t.tdeeNote}</p>
    </div>
  );
}
