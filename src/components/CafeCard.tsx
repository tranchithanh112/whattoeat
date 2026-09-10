import { memo } from 'react';
import { cafeEmoji, type Cafe } from '@/lib/cafes';
import { hueOf } from './DishCard';

/**
 * A cup where the dishes have a plate, tinted by the same hue-from-id rule so
 * the two reels read as one app. The steam is CSS only; the emoji inside is
 * the café's most characterful vibe.
 */
export function Cup({ cafe, size = 'md' }: { cafe: Cafe; size?: 'md' | 'lg' }) {
  return (
    <div className={`cup cup-${size}`} style={{ ['--h' as string]: hueOf(cafe.id) }} aria-hidden="true">
      <span className="steam">
        <i />
        <i />
        <i />
      </span>
      <span className="saucer" />
      <span className="cup-handle" />
      <span className="cup-body">
        <span className="cup-emoji">{cafeEmoji(cafe)}</span>
      </span>
    </div>
  );
}

export const CafeCard = memo(function CafeCard({ cafe }: { cafe: Cafe }) {
  return (
    <div className="dish-card cafe-card">
      <span className="tier">{cafe.area}</span>
      <Cup cafe={cafe} />
      <div className="card-copy">
        <strong>{cafe.name}</strong>
        <span className="card-kcal">~{cafe.km} km</span>
      </div>
    </div>
  );
});
