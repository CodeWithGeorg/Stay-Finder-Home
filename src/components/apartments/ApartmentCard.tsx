import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRegion } from '@/contexts/RegionContext';
import type { Apartment } from '@/types/database';

interface ApartmentCardProps {
  apartment: Apartment;
  distance?: number;
}

export function ApartmentCard({ apartment, distance }: ApartmentCardProps) {
  const { formatPrice } = useRegion();

  return (
    <Link
      to={`/apartments/${apartment.id}`}
      className="group block bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={apartment.image_main_url || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'}
          alt={apartment.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Price Badge */}
        <div className="absolute top-3 right-3">
          <Badge className="bg-card/90 backdrop-blur-sm text-foreground shadow-soft px-3 py-1">
            {formatPrice(apartment.price_per_day)}/night
          </Badge>
        </div>

        {/* Distance Badge */}
        {distance !== undefined && (
          <div className="absolute bottom-3 left-3">
            <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm shadow-soft">
              {distance < 1 ? `${(distance * 1000).toFixed(0)}m away` : `${distance.toFixed(1)}km away`}
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {apartment.name}
          </h3>
          <div className="flex items-center gap-1 text-sm">
            <Star className="w-4 h-4 fill-primary text-primary" />
            <span className="font-medium">4.9</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="line-clamp-1">{apartment.location_text || 'Location not specified'}</span>
        </div>

        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
          {apartment.description || 'A beautiful place to stay.'}
        </p>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Bed className="w-4 h-4" />
            <span>{apartment.bedrooms} {apartment.bedrooms === 1 ? 'bed' : 'beds'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="w-4 h-4" />
            <span>{apartment.bathrooms} {apartment.bathrooms === 1 ? 'bath' : 'baths'}</span>
          </div>
        </div>

        {/* Amenities Preview */}
        {apartment.amenities && apartment.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t">
            {apartment.amenities.slice(0, 3).map((amenity) => (
              <Badge key={amenity} variant="secondary" className="text-xs">
                {amenity}
              </Badge>
            ))}
            {apartment.amenities.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{apartment.amenities.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
