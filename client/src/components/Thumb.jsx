import { useState } from 'react';
// Shows the photo if imageUrl loads, otherwise a graceful emoji fallback.
export default function Thumb({ food, size = 90 }) {
  const [bad, setBad] = useState(false);
  return (
    <div className="thumb" style={{ width: size, height: size, fontSize: size * 0.5 }}>
      {food.imageUrl && !bad ? <img src={food.imageUrl} alt={food.name} onError={() => setBad(true)} /> : <span role="img" aria-label={food.name}>{food.emoji || '🍽️'}</span>}
    </div>
  );
}
