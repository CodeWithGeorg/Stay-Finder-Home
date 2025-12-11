import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Loader2, CheckCircle, XCircle, Clock, Calendar, User, MapPin } from 'lucide-react';
import type { Booking, Apartment, Profile } from '@/types/database';

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, className: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Approved', icon: CheckCircle, className: 'bg-green-100 text-green-800' },
  declined: { label: 'Declined', icon: XCircle, className: 'bg-red-100 text-red-800' },
};

interface BookingWithDetails extends Booking {
  apartment: Apartment;
  profile: Profile;
}

export default function AdminBookings() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);
  const [adminMessage, setAdminMessage] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'declined'>('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          apartment:apartments(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch profiles separately
      const bookingsWithProfiles = await Promise.all(
        (data || []).map(async (booking) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', booking.user_id)
            .maybeSingle();
          return { ...booking, profile } as BookingWithDetails;
        })
      );
      
      setBookings(bookingsWithProfiles);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (status: 'approved' | 'declined') => {
    if (!selectedBooking) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status,
          admin_message: adminMessage || null,
        })
        .eq('id', selectedBooking.id);

      if (error) throw error;

      toast({
        title: `Booking ${status}`,
        description: `The booking has been ${status} successfully.`,
      });
      setSelectedBooking(null);
      setAdminMessage('');
      fetchBookings();
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to update booking status.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredBookings = bookings.filter(
    (b) => filter === 'all' || b.status === filter
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl font-bold">Booking Requests</h2>
        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'declined'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'pending' && bookings.filter(b => b.status === 'pending').length > 0 && (
                <Badge className="ml-2 bg-yellow-500">
                  {bookings.filter(b => b.status === 'pending').length}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-card rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left p-4 font-medium">Guest</th>
                <th className="text-left p-4 font-medium">Apartment</th>
                <th className="text-left p-4 font-medium">Dates</th>
                <th className="text-left p-4 font-medium">Total</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => {
                const status = statusConfig[booking.status];
                const StatusIcon = status.icon;

                return (
                  <tr key={booking.id} className="border-t hover:bg-secondary/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                          <User className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{booking.profile?.name || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">{booking.profile?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={booking.apartment?.image_main_url || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=100'}
                          alt={booking.apartment?.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium">{booking.apartment?.name}</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {booking.apartment?.location_text}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {format(new Date(booking.date_start), 'MMM d')} -{' '}
                          {format(new Date(booking.date_end), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold">${booking.total_price}</span>
                    </td>
                    <td className="p-4">
                      <Badge className={status.className}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {booking.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() => setSelectedBooking(booking)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive border-destructive hover:bg-red-50"
                              onClick={() => setSelectedBooking(booking)}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Decline
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredBookings.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No bookings found.
          </div>
        )}
      </div>

      {/* Action Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => {
        setSelectedBooking(null);
        setAdminMessage('');
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Respond to Booking Request</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4 pt-4">
              <div className="p-4 bg-secondary/50 rounded-lg">
                <p className="font-medium">{selectedBooking.apartment?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(selectedBooking.date_start), 'MMM d')} -{' '}
                  {format(new Date(selectedBooking.date_end), 'MMM d, yyyy')}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Guest: {selectedBooking.profile?.name} ({selectedBooking.profile?.email})
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Message to Guest (optional)
                </label>
                <Textarea
                  value={adminMessage}
                  onChange={(e) => setAdminMessage(e.target.value)}
                  placeholder="Add a note for the guest..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  onClick={() => handleStatusUpdate('approved')}
                  disabled={isUpdating}
                >
                  {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleStatusUpdate('declined')}
                  disabled={isUpdating}
                >
                  {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <XCircle className="w-4 h-4 mr-2" />
                  Decline
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
