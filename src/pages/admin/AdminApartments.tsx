import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useRegion } from '@/contexts/RegionContext';
import { Plus, Pencil, Trash2, Loader2, MapPin } from 'lucide-react';
import type { Apartment, ApartmentRegion } from '@/types/database';

export default function AdminApartments() {
  const { toast } = useToast();
  const { formatPrice } = useRegion();
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingApartment, setEditingApartment] = useState<Apartment | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location_text: '',
    latitude: '',
    longitude: '',
    price_per_day: '',
    bedrooms: '1',
    bathrooms: '1',
    image_main_url: '',
    amenities: '',
    region: 'kenya' as ApartmentRegion,
  });

  useEffect(() => {
    fetchApartments();
  }, []);

  const fetchApartments = async () => {
    try {
      const { data, error } = await supabase
        .from('apartments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApartments(data as Apartment[]);
    } catch (error) {
      console.error('Error fetching apartments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      location_text: '',
      latitude: '',
      longitude: '',
      price_per_day: '',
      bedrooms: '1',
      bathrooms: '1',
      image_main_url: '',
      amenities: '',
      region: 'kenya',
    });
    setEditingApartment(null);
  };

  const handleEdit = (apartment: Apartment) => {
    setEditingApartment(apartment);
    setFormData({
      name: apartment.name,
      description: apartment.description || '',
      location_text: apartment.location_text || '',
      latitude: apartment.latitude?.toString() || '',
      longitude: apartment.longitude?.toString() || '',
      price_per_day: apartment.price_per_day.toString(),
      bedrooms: apartment.bedrooms.toString(),
      bathrooms: apartment.bathrooms.toString(),
      image_main_url: apartment.image_main_url || '',
      amenities: apartment.amenities?.join(', ') || '',
      region: apartment.region || 'kenya',
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price_per_day) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    const amenitiesArray = formData.amenities
      .split(',')
      .map(a => a.trim())
      .filter(a => a.length > 0);

    const apartmentData = {
      name: formData.name,
      description: formData.description || null,
      location_text: formData.location_text || null,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      price_per_day: parseFloat(formData.price_per_day),
      bedrooms: parseInt(formData.bedrooms),
      bathrooms: parseInt(formData.bathrooms),
      image_main_url: formData.image_main_url || null,
      amenities: amenitiesArray.length > 0 ? amenitiesArray : null,
      region: formData.region,
    };

    try {
      if (editingApartment) {
        const { error } = await supabase
          .from('apartments')
          .update(apartmentData)
          .eq('id', editingApartment.id);

        if (error) throw error;
        toast({ title: 'Apartment updated successfully' });
      } else {
        const { error } = await supabase
          .from('apartments')
          .insert(apartmentData);

        if (error) throw error;
        toast({ title: 'Apartment created successfully' });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchApartments();
    } catch (error) {
      console.error('Error saving apartment:', error);
      toast({
        title: 'Error',
        description: 'Failed to save apartment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this apartment?')) return;

    try {
      const { error } = await supabase
        .from('apartments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Apartment deleted successfully' });
      fetchApartments();
    } catch (error) {
      console.error('Error deleting apartment:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete apartment.',
        variant: 'destructive',
      });
    }
  };

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
        <h2 className="font-serif text-2xl font-bold">Apartments</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Apartment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif">
                {editingApartment ? 'Edit Apartment' : 'Add New Apartment'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Sunset Beach Villa"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="A beautiful apartment with stunning views..."
                    rows={3}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location_text}
                    onChange={(e) => setFormData({ ...formData, location_text: e.target.value })}
                    placeholder="Miami Beach, FL"
                  />
                </div>
                <div>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="25.7617"
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="-80.1918"
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price per Day *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price_per_day}
                    onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value })}
                    placeholder="150"
                  />
                </div>
                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="image">Main Image URL</Label>
                  <Input
                    id="image"
                    value={formData.image_main_url}
                    onChange={(e) => setFormData({ ...formData, image_main_url: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="amenities">Amenities (comma separated)</Label>
                  <Input
                    id="amenities"
                    value={formData.amenities}
                    onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                    placeholder="WiFi, Pool, Kitchen, Air Conditioning"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="region">Region *</Label>
                  <Select 
                    value={formData.region} 
                    onValueChange={(value: ApartmentRegion) => setFormData({ ...formData, region: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      <SelectItem value="kenya">🇰🇪 Kenya (KSh)</SelectItem>
                      <SelectItem value="usa">🇺🇸 USA ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingApartment ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Apartments Table */}
      <div className="bg-card rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left p-4 font-medium">Apartment</th>
                <th className="text-left p-4 font-medium">Location</th>
                <th className="text-left p-4 font-medium">Price</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {apartments.map((apartment) => (
                <tr key={apartment.id} className="border-t hover:bg-secondary/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={apartment.image_main_url || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=100'}
                        alt={apartment.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium">{apartment.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {apartment.bedrooms} bed · {apartment.bathrooms} bath
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{apartment.location_text || 'Not set'}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-semibold">{formatPrice(apartment.price_per_day)}</span>
                    <span className="text-muted-foreground text-sm">/night</span>
                  </td>
                  <td className="p-4">
                    <Badge variant={apartment.status === 'active' ? 'default' : 'secondary'}>
                      {apartment.status}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(apartment)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(apartment.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {apartments.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No apartments yet. Add your first listing!
          </div>
        )}
      </div>
    </div>
  );
}
