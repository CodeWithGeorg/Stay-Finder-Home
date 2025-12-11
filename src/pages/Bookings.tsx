import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useRegion } from '@/contexts/RegionContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Calendar, MapPin, Loader2, Clock, CheckCircle, XCircle, Home } from 'lucide-react';
import type { Booking, Apartment } from '@/types/database';

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, className: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Approved', icon: CheckCircle, className: 'bg-green-100 text-green-800' },
  declined: { label: 'Declined', icon: XCircle, className: 'bg-red-100 text-red-800' },
};

export default function Bookings() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { formatPrice } = useRegion();
  const [bookings, setBookings] = useState<(Booking & { apartment: Apartment })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          apartment:apartments(*)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data as (Booking & { apartment: Apartment })[]);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Header */}
        <section className="bg-secondary/30 border-b py-8">
          <div className="container mx-auto px-4">
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">My Bookings</h1>
            <p className="text-muted-foreground">View and manage your booking requests</p>
          </div>
        </section>

        {/* Bookings List */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((booking, index) => {
                  const status = statusConfig[booking.status];
                  const StatusIcon = status.icon;
                  
                  return (
                    <div
                      key={booking.id}
                      className="bg-card rounded-xl border shadow-soft overflow-hidden animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex flex-col md:flex-row">
                        {/* Image */}
                        <div className="md:w-64 h-48 md:h-auto flex-shrink-0">
                          <img
                            src={booking.apartment?.image_main_url || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400'}
                            alt={booking.apartment?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-6">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                            <div>
                              <Link 
                                to={`/apartments/${booking.apartment_id}`}
                                className="font-serif text-xl font-semibold hover:text-primary transition-colors"
                              >
                                {booking.apartment?.name}
                              </Link>
                              <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                                <MapPin className="w-4 h-4" />
                                <span>{booking.apartment?.location_text || 'Location not specified'}</span>
                              </div>
                            </div>
                            <Badge className={status.className}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.label}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground block mb-1">Check-in</span>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-primary" />
                                <span className="font-medium">{format(new Date(booking.date_start), 'MMM d, yyyy')}</span>
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground block mb-1">Check-out</span>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-primary" />
                                <span className="font-medium">{format(new Date(booking.date_end), 'MMM d, yyyy')}</span>
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground block mb-1">Total</span>
                              <span className="text-xl font-bold text-primary">{formatPrice(booking.total_price || 0)}</span>
                            </div>
                          </div>

                          {booking.admin_message && (
                            <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
                              <span className="text-sm font-medium">Message from host:</span>
                              <p className="text-sm text-muted-foreground mt-1">{booking.admin_message}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <Home className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start exploring our apartments and book your next stay!
                </p>
                <Button asChild>
                  <Link to="/apartments">Browse Apartments</Link>
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
