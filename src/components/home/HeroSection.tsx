import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Calendar, Users } from 'lucide-react';

export function HeroSection() {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/apartments${location ? `?search=${encodeURIComponent(location)}` : ''}`);
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80"
          alt="Beautiful modern apartment"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-foreground/20" />
      </div>

      {/* Content */}
      <div className="container relative z-10 px-4 py-20">
        <div className="max-w-3xl">
          <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 backdrop-blur-sm text-primary-foreground text-sm font-medium mb-6">
              ✨ Over 10,000+ premium stays
            </span>
          </div>
          
          <h1 
            className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6 animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            Find Your Perfect
            <span className="block text-primary">Home Away From Home</span>
          </h1>
          
          <p 
            className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-xl animate-fade-in-up"
            style={{ animationDelay: '0.3s' }}
          >
            Discover handpicked apartments and unique stays that match your lifestyle. Book instantly with confidence.
          </p>

          {/* Search Form */}
          <form 
            onSubmit={handleSearch}
            className="bg-card/95 backdrop-blur-md rounded-2xl p-4 md:p-6 shadow-hover animate-fade-in-up"
            style={{ animationDelay: '0.4s' }}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Where</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search destinations"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10 h-12 bg-secondary/50 border-0"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">When</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Add dates"
                    className="pl-10 h-12 bg-secondary/50 border-0"
                    readOnly
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">&nbsp;</label>
                <Button type="submit" variant="hero" size="lg" className="w-full h-12">
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </form>

          {/* Stats */}
          <div 
            className="flex flex-wrap gap-8 mt-10 animate-fade-in-up"
            style={{ animationDelay: '0.5s' }}
          >
            <div>
              <p className="text-3xl font-bold text-primary-foreground">10K+</p>
              <p className="text-primary-foreground/70 text-sm">Premium Listings</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-foreground">50K+</p>
              <p className="text-primary-foreground/70 text-sm">Happy Guests</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-foreground">100+</p>
              <p className="text-primary-foreground/70 text-sm">Destinations</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
