import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useRegion } from '@/contexts/RegionContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays, addDays } from 'date-fns';
import { 
  MapPin, Bed, Bath, Star, CalendarIcon, Loader2, 
  ChevronLeft, Wifi, Car, UtensilsCrossed, Waves,
  Flame, Mountain, Users, Check
} from 'lucide-react';
import type { Apartment, Booking } from '@/types/database';

const amenityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'WiFi': Wifi,
  'Parking': Car,
  'Kitchen': UtensilsCrossed,
  'Pool': Waves,
  'Fireplace': Flame,
  'Mountain View': Mountain,
};

export default function ApartmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { formatPrice } = useRegion();
  
  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  useEffect(() => {
    if (id) {
      fetchApartment();
      fetchBookedDates();
    }
  }, [id]);

  const fetchApartment = async () => {
    try {
      const { data, error } = await supabase
        .from('apartments')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      setApartment(data as Apartment);
    } catch (error) {
      console.error('Error fetching apartment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBookedDates = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('date_start, date_end')
        .eq('apartment_id', id)
        .in('status', ['pending', 'approved']);

      if (error) throw error;

      const dates: Date[] = [];
      data?.forEach((booking: { date_start: string; date_end: string }) => {
        let current = new Date(booking.date_start);
        const end = new Date(booking.date_end);
        while (current <= end) {
          dates.push(new Date(current));
          current = addDays(current, 1);
        }
      });
      setBookedDates(dates);
    } catch (error) {
      console.error('Error fetching booked dates:', error);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to book this apartment.',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    if (!dateRange.from || !dateRange.to || !apartment) {
      toast({
        title: 'Select dates',
        description: 'Please select check-in and check-out dates.',
        variant: 'destructive',
      });
      return;
    }

    setIsBooking(true);
    const nights = differenceInDays(dateRange.to, dateRange.from);
    const totalPrice = nights * apartment.price_per_day;

    try {
      const { error } = await supabase.from('bookings').insert({
        user_id: user.id,
        apartment_id: apartment.id,
        date_start: format(dateRange.from, 'yyyy-MM-dd'),
        date_end: format(dateRange.to, 'yyyy-MM-dd'),
        total_price: totalPrice,
        status: 'pending',
      });

      if (error) throw error;

      toast({
        title: 'Booking submitted!',
        description: 'Your booking request has been sent for approval.',
      });
      navigate('/bookings');
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: 'Booking failed',
        description: 'There was an error processing your booking. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsBooking(false);
    }
  };

  const isDateDisabled = (date: Date) => {
    return bookedDates.some(
      (bookedDate) => 
        date.toDateString() === bookedDate.toDateString()
    ) || date < new Date();
  };

  const nights = dateRange.from && dateRange.to 
    ? differenceInDays(dateRange.to, dateRange.from)
    : 0;
  const totalPrice = apartment ? nights * apartment.price_per_day : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!apartment) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Apartment not found</h1>
            <p className="text-muted-foreground mb-4">The apartment you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/apartments')}>Browse Apartments</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Back Button */}
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        {/* Hero Image */}
        <section className="container mx-auto px-4 mb-8">
          <div className="relative aspect-[21/9] rounded-2xl overflow-hidden">
            <img
              src={apartment.image_main_url || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200'}
              alt={apartment.name}
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* Content */}
        <section className="container mx-auto px-4 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Details */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">{apartment.name}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{apartment.location_text || 'Location not specified'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-secondary px-3 py-1.5 rounded-full">
                    <Star className="w-4 h-4 fill-primary text-primary" />
                    <span className="font-semibold">4.9</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Bed className="w-5 h-5" />
                    <span>{apartment.bedrooms} {apartment.bedrooms === 1 ? 'bedroom' : 'bedrooms'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="w-5 h-5" />
                    <span>{apartment.bathrooms} {apartment.bathrooms === 1 ? 'bathroom' : 'bathrooms'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <span>Up to {(apartment.bedrooms || 1) * 2} guests</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-8">
                <h2 className="font-serif text-xl font-semibold mb-4">About this place</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {apartment.description || 'Experience comfort and convenience in this beautiful apartment. Perfect for travelers looking for a home away from home.'}
                </p>
              </div>

              {apartment.amenities && apartment.amenities.length > 0 && (
                <div className="border-t pt-8">
                  <h2 className="font-serif text-xl font-semibold mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {apartment.amenities.map((amenity) => {
                      const Icon = amenityIcons[amenity] || Check;
                      return (
                        <div key={amenity} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                          <Icon className="w-5 h-5 text-primary" />
                          <span>{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Booking Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-card rounded-2xl shadow-card p-6 border">
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-3xl font-bold">{formatPrice(apartment.price_per_day)}</span>
                  <span className="text-muted-foreground">/ night</span>
                </div>

                {/* Date Selection */}
                <div className="space-y-4 mb-6">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start h-14">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, 'MMM d')} - {format(dateRange.to, 'MMM d')}
                            </>
                          ) : (
                            format(dateRange.from, 'MMM d, yyyy')
                          )
                        ) : (
                          <span className="text-muted-foreground">Select dates</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={{ from: dateRange.from, to: dateRange.to }}
                        onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                        disabled={isDateDisabled}
                        numberOfMonths={2}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Price Breakdown */}
                {nights > 0 && (
                  <div className="space-y-3 mb-6 p-4 bg-secondary/50 rounded-xl">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {formatPrice(apartment.price_per_day)} x {nights} nights
                      </span>
                      <span>{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service fee</span>
                      <span>{formatPrice(0)}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between font-semibold">
                      <span>Total</span>
                      <span>{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                )}

                <Button 
                  variant="hero" 
                  size="xl" 
                  className="w-full"
                  onClick={handleBooking}
                  disabled={isBooking || nights === 0}
                >
                  {isBooking && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {nights > 0 ? 'Request to Book' : 'Select Dates'}
                </Button>

                <p className="text-center text-sm text-muted-foreground mt-4">
                  You won't be charged yet
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
