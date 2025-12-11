import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ApartmentCard } from '@/components/apartments/ApartmentCard';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useRegion } from '@/contexts/RegionContext';
import type { Apartment } from '@/types/database';

export function FeaturedApartments() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { region } = useRegion();

  useEffect(() => {
    fetchFeaturedApartments();
  }, [region]);

  const fetchFeaturedApartments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('apartments')
        .select('*')
        .eq('status', 'active')
        .eq('region', region)
        .limit(6);

      if (error) throw error;
      setApartments(data as Apartment[]);
    } catch (error) {
      console.error('Error fetching apartments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-20 bg-gradient-warm">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-primary font-medium text-sm uppercase tracking-wider">Explore</span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mt-2">Featured Stays</h2>
            <p className="text-muted-foreground mt-3 max-w-lg">
              Handpicked properties that offer exceptional experiences and unforgettable memories.
            </p>
          </div>
          <Button variant="outline" asChild className="self-start md:self-auto">
            <Link to="/apartments" className="flex items-center gap-2">
              View All Properties
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : apartments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apartments.map((apartment, index) => (
              <div
                key={apartment.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ApartmentCard apartment={apartment} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <p>No apartments available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}
