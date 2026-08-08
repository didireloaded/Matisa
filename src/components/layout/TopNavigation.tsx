import { useState } from "react";
import { Bell, MessageCircle, Sun, Moon, MapPin, ChevronDown, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";

const NAMIBIAN_CITIES = [
  "Windhoek",
  "Swakopmund",
  "Walvis Bay",
  "Oshakati",
  "Rundu",
  "Lüderitz",
  "Katima Mulilo",
];

export function TopNavigation() {
  const navigate = useNavigate();
  const { isOutdoorMode, toggleOutdoorMode } = useTheme();
  const [selectedCity, setSelectedCity] = useState(() => {
    return localStorage.getItem("matisa_user_city") || "Windhoek";
  });
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  const handleSelectCity = (city: string) => {
    setSelectedCity(city);
    localStorage.setItem("matisa_user_city", city);
    setIsCityModalOpen(false);
    toast.success(`Location set to ${city}, Namibia`);
  };

  return (
    <>
      <header
        className="sticky top-0 z-40 grid grid-cols-3 items-center px-5 pb-3 bg-gradient-to-b from-[#06101D] via-[#06101D]/90 to-transparent backdrop-blur-md"
        style={{
          paddingTop: "calc(12px + env(safe-area-inset-top))",
        }}
      >
        {/* 1. Left Action: Outdoor Sunlight Mode Toggle */}
        <div className="flex items-center justify-start">
          <button
            onClick={toggleOutdoorMode}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition active:scale-95 border ${
              isOutdoorMode
                ? "bg-amber-500/20 text-amber-500 border-amber-500/30"
                : "bg-white/10 text-white/80 border-white/10 hover:bg-white/20"
            }`}
            title={isOutdoorMode ? "Switch to Sleek Dark Mode" : "Switch to Sunlight Outdoor Mode"}
            aria-label="Toggle Outdoor Sunlight Contrast Mode"
          >
            {isOutdoorMode ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>

        {/* 2. Absolute Centered Brand Title & Location Selector Pill */}
        <div className="flex flex-col items-center justify-center gap-0.5">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1 hover:opacity-90 transition active:scale-95"
          >
            <span className="text-lg font-extrabold tracking-tight text-white font-display">
              Matisa
            </span>
          </button>
          <button
            onClick={() => setIsCityModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 text-white/90 hover:text-white text-[10px] font-bold border border-white/15 transition active:scale-95"
          >
            <MapPin size={9} className="text-[#24A3C7]" />
            <span>{selectedCity}</span>
            <ChevronDown size={9} className="text-white/50" />
          </button>
        </div>

        {/* 3. Right Header Actions */}
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => navigate("/activity")}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition active:scale-95 border border-white/10"
            aria-label="Notifications"
          >
            <Bell size={17} />
          </button>

          <button
            onClick={() => navigate("/messages")}
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition active:scale-95 border border-white/10"
            aria-label="Messages"
          >
            <MessageCircle size={17} />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.9)]" />
          </button>
        </div>
      </header>

      {/* Real City Selector Modal */}
      {isCityModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-xs rounded-[28px] glass-panel-elevated p-5 bg-[#06101D] text-white border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-[#24A3C7]" />
                <h3 className="text-sm font-bold">Select Your City</h3>
              </div>
              <button
                onClick={() => setIsCityModalOpen(false)}
                className="p-1 text-white/50 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {NAMIBIAN_CITIES.map((city) => {
                const isSelected = city === selectedCity;
                return (
                  <button
                    key={city}
                    onClick={() => handleSelectCity(city)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                      isSelected
                        ? "bg-[#24A3C7] text-white font-bold"
                        : "hover:bg-white/10 text-white/80"
                    }`}
                  >
                    <span>{city}, Namibia</span>
                    {isSelected && <Check size={14} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TopNavigation;
