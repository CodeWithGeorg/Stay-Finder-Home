import { useEffect, useState } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  Home, Building2, Calendar, Users, Settings, 
  Menu, X, LogOut, Loader2, BarChart3
} from 'lucide-react';

const sidebarLinks = [
  { icon: BarChart3, label: 'Overview', path: '/admin' },
  { icon: Building2, label: 'Apartments', path: '/admin/apartments' },
  { icon: Calendar, label: 'Bookings', path: '/admin/bookings' },
];

export default function AdminDashboard() {
  const { user, role, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalApartments: 0,
    totalBookings: 0,
    pendingBookings: 0,
    revenue: 0,
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth');
      } else if (role !== 'admin') {
        navigate('/');
      }
    }
  }, [user, role, authLoading, navigate]);

  useEffect(() => {
    if (role === 'admin') {
      fetchStats();
    }
  }, [role]);

  const fetchStats = async () => {
    try {
      const [apartmentsRes, bookingsRes] = await Promise.all([
        supabase.from('apartments').select('id', { count: 'exact' }),
        supabase.from('bookings').select('id, status, total_price'),
      ]);

      const bookings = bookingsRes.data || [];
      const pendingBookings = bookings.filter(b => b.status === 'pending').length;
      const revenue = bookings
        .filter(b => b.status === 'approved')
        .reduce((sum, b) => sum + (b.total_price || 0), 0);

      setStats({
        totalApartments: apartmentsRes.count || 0,
        totalBookings: bookings.length,
        pendingBookings,
        revenue,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || !user || role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isOverview = location.pathname === '/admin';

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-300
        lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center shadow-soft">
                <Home className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <span className="font-serif text-lg font-semibold block">StayNest</span>
                <span className="text-xs text-muted-foreground">Admin Panel</span>
              </div>
            </Link>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 p-4 space-y-1">
            {sidebarLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }
                  `}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-foreground/20 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b">
          <div className="flex items-center justify-between px-4 h-16">
            <button
              className="lg:hidden p-2 text-foreground"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="font-serif text-lg font-semibold">
              {isOverview ? 'Dashboard' : location.pathname.split('/').pop()?.charAt(0).toUpperCase() + location.pathname.split('/').pop()?.slice(1)}
            </h1>
            <div className="w-10" />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          {isOverview ? (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card rounded-xl p-6 border shadow-soft">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Apartments</p>
                      <p className="text-2xl font-bold">{stats.totalApartments}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-6 border shadow-soft">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Bookings</p>
                      <p className="text-2xl font-bold">{stats.totalBookings}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-6 border shadow-soft">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold">{stats.pendingBookings}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-6 border shadow-soft">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Revenue</p>
                      <p className="text-2xl font-bold">${stats.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link 
                  to="/admin/apartments"
                  className="bg-card rounded-xl p-6 border shadow-soft hover:shadow-card transition-shadow group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">Manage Apartments</h3>
                      <p className="text-sm text-muted-foreground">Add, edit, or remove listings</p>
                    </div>
                  </div>
                </Link>

                <Link 
                  to="/admin/bookings"
                  className="bg-card rounded-xl p-6 border shadow-soft hover:shadow-card transition-shadow group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">Manage Bookings</h3>
                      <p className="text-sm text-muted-foreground">Review and approve requests</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}
