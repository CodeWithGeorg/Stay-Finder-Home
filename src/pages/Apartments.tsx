import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ApartmentCard } from '@/components/apartments/ApartmentCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, MapPin, Loader2, X, Navigation } from 'lucide-react';
import { useRegion } from '@/contexts/RegionContext';
import type { Apartment } from '@/types/database';

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function Apartments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [apartments, setApartments] = useState<(Apartment & { distance?: number })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const { region, formatPrice } = useRegion();

  useEffect(() => {
    fetchApartments();
  }, [region]);

  const fetchApartments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('apartments')
        .select('*')
        .eq('status', 'active')
        .eq('region', region);

      if (error) throw error;
      setApartments(data as Apartment[]);
    } catch (error) {
      console.error('Error fetching apartments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsLocating(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLocating(false);
        }
      );
    }
  };

  const filteredApartments = apartments
    .map((apt) => {
      if (userLocation && apt.latitude && apt.longitude) {
        return {
          ...apt,
          distance: calculateDistance(userLocation.lat, userLocation.lng, apt.latitude, apt.longitude),
        };
      }
      return apt;
    })
    .filter((apt) => {
      const matchesSearch = !searchQuery || 
        apt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.location_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesPrice = apt.price_per_day >= priceRange[0] && apt.price_per_day <= priceRange[1];
      
      return matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      if (userLocation && a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }
      return 0;
    });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Header */}
        <section className="bg-secondary/30 border-b py-8">
          <div className="container mx-auto px-4">
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">Browse Apartments</h1>
            <p className="text-muted-foreground">Find your perfect stay from our curated collection</p>
          </div>
        </section>

        {/* Filters */}
        <section className="border-b bg-card sticky top-16 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Location Button */}
              <Button
                variant={userLocation ? 'default' : 'outline'}
                onClick={getUserLocation}
                disabled={isLocating}
                className="gap-2"
              >
                {isLocating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Navigation className="w-4 h-4" />
                )}
                {userLocation ? 'Location enabled' : 'Use my location'}
              </Button>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
                {(priceRange[0] > 0 || priceRange[1] < (region === 'kenya' ? 50000 : 500)) && (
                  <Badge variant="secondary" className="ml-1">1</Badge>
                )}
              </Button>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t animate-fade-in">
                <div className="max-w-sm">
                  <label className="text-sm font-medium mb-3 block">
                    Price Range: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}/night
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    min={0}
                    max={region === 'kenya' ? 50000 : 500}
                    step={region === 'kenya' ? 500 : 10}
                    className="mb-4"
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Results */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            {/* Results Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                {filteredApartments.length} {filteredApartments.length === 1 ? 'apartment' : 'apartments'} found
                {userLocation && ' (sorted by distance)'}
              </p>
              {(searchQuery || priceRange[0] > 0 || priceRange[1] < (region === 'kenya' ? 50000 : 500)) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setPriceRange([0, region === 'kenya' ? 50000 : 500]);
                  }}
                  className="text-muted-foreground"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear filters
                </Button>
              )}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredApartments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredApartments.map((apartment, index) => (
                  <div
                    key={apartment.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <ApartmentCard apartment={apartment} distance={apartment.distance} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <MapPin className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No apartments found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search query
                </p>
                <Button variant="outline" onClick={() => {
                  setSearchQuery('');
                  setPriceRange([0, region === 'kenya' ? 50000 : 500]);
                }}>
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
