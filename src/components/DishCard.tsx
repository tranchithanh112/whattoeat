import { memo } from 'react';
import type { Dish } from '@/lib/dishes';
import { dishName, dishSubtitle, priceLabel, copy, type Lang } from '@/lib/i18n';

// Dish art is generated, not photographed: a tinted plate plus the dish
// emoji. That keeps the whole app tiny and free of third-party image rights,
// and every dish — including ones the user types in — gets art for free.

function hueOf(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360;
  return h;
}

export function Plate({ dish, size = 'md' }: { dish: Dish; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div className={`plate plate-${size}`} style={{ ['--h' as string]: hueOf(dish.id) }} aria-hidden="true">
      <span className="plate-emoji">{dish.emoji}</span>
    </div>
  );
}

type Props = {
  dish: Dish;
  lang: Lang;
  size?: 'sm' | 'md' | 'lg';
  favorite?: boolean;
  onClick?: () => void;
};

export const DishCard = memo(function DishCard({ dish, lang, size = 'md', favorite, onClick }: Props) {
  const t = copy[lang];
  const body = (
    <>
      <span className="tier">{t.tiers[dish.rarity]}</span>
      {favorite && (
        <span className="card-fav" title={t.favorite} aria-label={t.favorite}>
          ★
        </span>
      )}
      <Plate dish={dish} size={size} />
      <div className="card-copy">
        <strong>{dishName(dish, lang)}</strong>
        <span>{size === 'sm' ? priceLabel(dish.price, lang, true) : dishSubtitle(dish, lang)}</span>
      </div>
    </>
  );

  const className = `dish-card size-${size} rarity-${dish.rarity}`;
  return onClick ? (
    <button type="button" className={className} onClick={onClick}>
      {body}
    </button>
  ) : (
    <div className={className}>{body}</div>
  );
});
