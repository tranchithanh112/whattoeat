import type { Cuisine, Meal, Tag } from '@/lib/dishes';
import { copy, cuisineLabel, mealLabel, priceLabel, tagLabel } from '@/lib/i18n';
import type { Prefs } from '@/lib/storage';

const CUISINES: Cuisine[] = ['vn', 'cn', 'jp', 'kr', 'th', 'sea', 'in', 'mid', 'eu', 'us', 'mx'];
const TAGS: Tag[] = ['veg', 'spicy', 'soup', 'dry', 'rice', 'noodle', 'bread', 'grill', 'fried', 'light', 'seafood'];
const MEALS: (Meal | 'any')[] = ['any', 'sang', 'trua', 'toi'];

type Props = {
  prefs: Prefs;
  patch: (next: Partial<Prefs>) => void;
  poolSize: number;
  poolAverage: number;
  poolKcal: number;
  weatherNote: string;
  disabled: boolean;
};

/** Toggle membership of `value` in `list`, keeping the remaining order stable. */
const toggle = <T,>(list: T[], value: T): T[] =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

export function Filters({ prefs, patch, poolSize, poolAverage, poolKcal, weatherNote, disabled }: Props) {
  const t = copy[prefs.lang];
  const clean =
    !prefs.cuisines.length && !prefs.include.length && !prefs.exclude.length && prefs.meal === 'any';

  return (
    <section className="filters" aria-label={t.settings}>
      <div className="filter-row budget-row">
        <div className="budget-head">
          <label htmlFor="budget">{t.budget}</label>
          <output htmlFor="budget" className="budget-value">
            {priceLabel(prefs.budget, prefs.lang)}
          </output>
        </div>
        <input
          id="budget"
          type="range"
          min={15}
          max={250}
          step={5}
          value={prefs.budget}
          disabled={disabled}
          onChange={(e) => patch({ budget: Number(e.target.value) })}
        />
        <div className="budget-foot">
          <small>{t.budgetHint}</small>
          <small>
            {poolSize} {t.dishes} · {t.poolAverage} {priceLabel(poolAverage, prefs.lang, true)} · ~
            {poolKcal} {t.kcal}
          </small>
        </div>
      </div>

      <div className="filter-row budget-row">
        <div className="budget-head">
          <label htmlFor="kcalcap">{t.kcalCap}</label>
          <output htmlFor="kcalcap" className="budget-value">
            {prefs.kcalCap === 0 ? t.kcalCapOff : `${prefs.kcalCap} ${t.kcal}`}
          </output>
        </div>
        <input
          id="kcalcap"
          type="range"
          min={0}
          max={1200}
          step={50}
          value={prefs.kcalCap}
          disabled={disabled}
          onChange={(e) => patch({ kcalCap: Number(e.target.value) })}
        />
        <div className="budget-foot">
          <small>{t.kcalApprox}</small>
          {weatherNote && <small>{weatherNote}</small>}
        </div>
      </div>

      <div className="filter-row">
        <span className="filter-label">{t.noRepeat}</span>
        <div className="segmented" role="group" aria-label={t.noRepeat}>
          {[0, 3, 7, 14].map((days) => (
            <button
              key={days}
              type="button"
              className={prefs.noRepeatDays === days ? 'on' : ''}
              aria-pressed={prefs.noRepeatDays === days}
              disabled={disabled}
              onClick={() => patch({ noRepeatDays: days })}
            >
              {days === 0 ? t.noRepeatOff : `${days} ${t.lastDays}`}
            </button>
          ))}
        </div>
        {prefs.noRepeatDays > 0 && <small className="hint">{t.noRepeatHint}</small>}
      </div>

      <div className="filter-row">
        <span className="filter-label">{t.meal}</span>
        <div className="segmented" role="group" aria-label={t.meal}>
          {MEALS.map((meal) => (
            <button
              key={meal}
              type="button"
              className={prefs.meal === meal ? 'on' : ''}
              aria-pressed={prefs.meal === meal}
              disabled={disabled}
              onClick={() => patch({ meal })}
            >
              {mealLabel(meal, prefs.lang)}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-row">
        <span className="filter-label">{t.cuisine}</span>
        <div className="chips">
          <button
            type="button"
            className={`chip ${prefs.cuisines.length === 0 ? 'on' : ''}`}
            aria-pressed={prefs.cuisines.length === 0}
            disabled={disabled}
            onClick={() => patch({ cuisines: [] })}
          >
            {t.allCuisines}
          </button>
          {CUISINES.map((c) => (
            <button
              key={c}
              type="button"
              className={`chip ${prefs.cuisines.includes(c) ? 'on' : ''}`}
              aria-pressed={prefs.cuisines.includes(c)}
              disabled={disabled}
              onClick={() => patch({ cuisines: toggle(prefs.cuisines, c) })}
            >
              <span aria-hidden="true">{cuisineLabel[c].flag}</span> {cuisineLabel[c][prefs.lang]}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-row">
        <span className="filter-label">{t.include}</span>
        <div className="chips">
          {TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`chip ${prefs.include.includes(tag) ? 'on' : ''}`}
              aria-pressed={prefs.include.includes(tag)}
              disabled={disabled}
              onClick={() =>
                patch({
                  include: toggle(prefs.include, tag),
                  // A tag cannot be required and excluded at the same time.
                  exclude: prefs.exclude.filter((x) => x !== tag),
                })
              }
            >
              <span aria-hidden="true">{tagLabel[tag].icon}</span> {tagLabel[tag][prefs.lang]}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-row">
        <span className="filter-label">{t.exclude}</span>
        <div className="chips">
          {TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`chip danger ${prefs.exclude.includes(tag) ? 'on' : ''}`}
              aria-pressed={prefs.exclude.includes(tag)}
              disabled={disabled}
              onClick={() =>
                patch({
                  exclude: toggle(prefs.exclude, tag),
                  include: prefs.include.filter((x) => x !== tag),
                })
              }
            >
              <span aria-hidden="true">{tagLabel[tag].icon}</span> {tagLabel[tag][prefs.lang]}
            </button>
          ))}
        </div>
      </div>

      {!clean && (
        <button
          type="button"
          className="link-button"
          disabled={disabled}
          onClick={() => patch({ cuisines: [], include: [], exclude: [], meal: 'any' })}
        >
          {t.reset}
        </button>
      )}
    </section>
  );
}
