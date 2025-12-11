import { useRegion, Region } from '@/contexts/RegionContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin } from 'lucide-react';

const regions = [
  { value: 'kenya', label: 'Kenya', flag: '🇰🇪', currency: 'KSh' },
  { value: 'usa', label: 'USA', flag: '🇺🇸', currency: '$' },
];

export function RegionSelector() {
  const { region, setRegion } = useRegion();

  return (
    <Select value={region} onValueChange={(value) => setRegion(value as Region)}>
      <SelectTrigger className="w-[140px] bg-background border-border">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent className="bg-background border-border z-50">
        {regions.map((r) => (
          <SelectItem key={r.value} value={r.value}>
            <div className="flex items-center gap-2">
              <span>{r.flag}</span>
              <span>{r.label}</span>
              <span className="text-muted-foreground text-xs">({r.currency})</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
