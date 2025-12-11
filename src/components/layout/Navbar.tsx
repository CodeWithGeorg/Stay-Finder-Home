import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { RegionSelector } from '@/components/RegionSelector';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Home, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { user, profile, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center shadow-soft group-hover:shadow-card transition-shadow">
              <Home className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-serif text-xl font-semibold text-foreground">StayNest</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <ThemeToggle />
            <RegionSelector />
            <Link to="/apartments" className="text-muted-foreground hover:text-foreground transition-colors">
              Browse Apartments
            </Link>
            {user && (
              <Link to="/bookings" className="text-muted-foreground hover:text-foreground transition-colors">
                My Bookings
              </Link>
            )}
            {role === 'admin' && (
              <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
                Admin Dashboard
              </Link>
            )}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/profile" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {profile?.name || 'Profile'}
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/auth?mode=signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t animate-fade-in">
            <div className="flex flex-col gap-3">
              <div className="px-4 pb-2 flex items-center gap-3">
                <ThemeToggle />
                <RegionSelector />
              </div>
              <Link
                to="/apartments"
                className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Browse Apartments
              </Link>
              {user && (
                <Link
                  to="/bookings"
                  className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Bookings
                </Link>
              )}
              {role === 'admin' && (
                <Link
                  to="/admin"
                  className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Dashboard
                </Link>
              )}
              <div className="border-t pt-3 mt-2">
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      {profile?.name || 'Profile'}
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2 w-full text-left text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2 px-4">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link to="/auth" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                    </Button>
                    <Button size="sm" className="flex-1" asChild>
                      <Link to="/auth?mode=signup" onClick={() => setIsMenuOpen(false)}>Get Started</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
