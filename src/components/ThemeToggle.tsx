import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const colorThemes = [
  { name: "coral", label: "Coral" },
  { name: "ocean", label: "Ocean" },
  { name: "forest", label: "Forest" },
  { name: "lavender", label: "Lavender" },
] as const;

type ThemeName = typeof colorThemes[number]["name"];

export function ThemeToggle() {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>("coral");

  useEffect(() => {
    const savedTheme = localStorage.getItem("color-theme") as ThemeName;
    if (savedTheme && colorThemes.some(t => t.name === savedTheme)) {
      setCurrentTheme(savedTheme);
      document.documentElement.setAttribute("data-color-theme", savedTheme);
    }
  }, []);

  const cycleTheme = () => {
    const currentIndex = colorThemes.findIndex(t => t.name === currentTheme);
    const nextIndex = (currentIndex + 1) % colorThemes.length;
    const nextTheme = colorThemes[nextIndex].name;
    
    setCurrentTheme(nextTheme);
    localStorage.setItem("color-theme", nextTheme);
    document.documentElement.setAttribute("data-color-theme", nextTheme);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      className="relative w-9 h-9 hover:bg-secondary transition-colors"
      title={`Current theme: ${colorThemes.find(t => t.name === currentTheme)?.label}`}
    >
      <Palette className="h-4 w-4 transition-transform duration-300 hover:rotate-12" />
      <span className="sr-only">Change color theme</span>
    </Button>
  );
}
