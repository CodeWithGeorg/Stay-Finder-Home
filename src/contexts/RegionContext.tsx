import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Region = 'kenya' | 'usa';

interface RegionConfig {
  currency: string;
  currencySymbol: string;
  locale: string;
}

const regionConfigs: Record<Region, RegionConfig> = {
  kenya: {
    currency: 'KES',
    currencySymbol: 'KSh',
    locale: 'en-KE',
  },
  usa: {
    currency: 'USD',
    currencySymbol: '$',
    locale: 'en-US',
  },
};

interface RegionContextType {
  region: Region;
  setRegion: (region: Region) => void;
  config: RegionConfig;
  formatPrice: (price: number) => string;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export function RegionProvider({ children }: { children: ReactNode }) {
  const [region, setRegionState] = useState<Region>(() => {
    const saved = localStorage.getItem('selectedRegion');
    return (saved as Region) || 'kenya';
  });

  const setRegion = (newRegion: Region) => {
    setRegionState(newRegion);
    localStorage.setItem('selectedRegion', newRegion);
  };

  const config = regionConfigs[region];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <RegionContext.Provider value={{ region, setRegion, config, formatPrice }}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  const context = useContext(RegionContext);
  if (context === undefined) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
}
