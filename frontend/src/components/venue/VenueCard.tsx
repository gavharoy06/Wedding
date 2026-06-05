import { Link } from 'react-router-dom';
import type { Venue } from '../../types';

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

interface Props {
  venue: Venue;
}

export default function VenueCard({ venue }: Props) {
  // Backend rasm yo'lini to'liq URL'ga aylantiramiz
  const imageUrl = venue.primary_image
    ? `${API_ORIGIN}${venue.primary_image}`
    : 'https://via.placeholder.com/600x450?text=Rasm+yoq';

  return (
    <div className="group">
      <div className="relative overflow-hidden rounded-3xl glass-container h-[450px] transition-transform duration-500 hover:-translate-y-2">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent z-10" />
        <img
          src={imageUrl}
          alt={venue.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute bottom-0 left-0 p-stack-lg z-20 w-full">
          <h3 className="text-white font-display text-2xl mb-2">{venue.name}</h3>
          <p className="text-white/80 text-sm mb-1">
            {venue.district_name} • {venue.seats} o'rindiq
          </p>
          <p className="text-white font-bold mb-4">
            {Number(venue.price).toLocaleString()} so'm / o'rindiq
          </p>
          <Link
            to={`/venues/${venue.venue_id}`}
            className="block w-full text-center py-3 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-xl text-xs font-bold uppercase hover:bg-white hover:text-primary transition-all"
          >
            Batafsil ko'rish
          </Link>
        </div>
      </div>
    </div>
  );
}
