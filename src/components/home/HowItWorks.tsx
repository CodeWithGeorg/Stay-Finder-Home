import { Search, CalendarCheck, Key } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Discover',
    description: 'Browse our curated collection of premium apartments. Filter by location, price, and amenities to find your perfect match.',
  },
  {
    icon: CalendarCheck,
    title: 'Book',
    description: 'Select your dates and submit a booking request. Our team reviews and confirms within 24 hours.',
  },
  {
    icon: Key,
    title: 'Stay',
    description: 'Check in and enjoy your home away from home. We handle everything so you can focus on making memories.',
  },
];

export function HowItWorks() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">Simple Process</span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold mt-2">How It Works</h2>
          <p className="text-muted-foreground mt-4">
            Book your dream stay in just a few simple steps. We've made the process seamless so you can focus on planning your trip.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative text-center group animate-fade-in-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
              )}
              
              {/* Icon */}
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-card group-hover:shadow-glow transition-all duration-300 group-hover:scale-105">
                <step.icon className="w-10 h-10 text-primary-foreground" />
              </div>

              {/* Step Number */}
              <span className="inline-block w-8 h-8 rounded-full bg-secondary text-foreground font-bold text-sm leading-8 mb-4">
                {index + 1}
              </span>

              <h3 className="font-serif text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
