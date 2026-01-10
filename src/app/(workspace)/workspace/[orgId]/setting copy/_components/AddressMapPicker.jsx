import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Search, X, Key } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function AddressMapPicker({ value, onChange }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  
  const [open, setOpen] = useState(false);
  const [mapboxToken, setMapboxToken] = useState(() => 
    localStorage.getItem("mapbox_token") || ""
  );
  const [showTokenInput, setShowTokenInput] = useState(!mapboxToken);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAddress, setSelectedAddress] = useState(value);
  const [coordinates, setCoordinates] = useState(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const saveToken = () => {
    if (mapboxToken.trim()) {
      localStorage.setItem("mapbox_token", mapboxToken.trim());
      setShowTokenInput(false);
      toast({
        title: "Token Saved",
        description: "Mapbox token has been saved. The map will now load.",
      });
    }
  };

  const clearToken = () => {
    localStorage.removeItem("mapbox_token");
    setMapboxToken("");
    setShowTokenInput(true);
    map.current?.remove();
    map.current = null;
    setIsMapReady(false);
  };

  const reverseGeocode = async (lng, lat) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        setSelectedAddress(data.features[0].place_name);
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
    }
  };

  const initializeMap = useCallback(() => {
    if (!mapContainer.current || !mapboxToken || map.current) return;

    try {
      mapboxgl.accessToken = mapboxToken;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [-74.006, 40.7128], // Default to NYC
        zoom: 12,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      marker.current = new mapboxgl.Marker({ color: "#0ea5e9", draggable: true })
        .setLngLat([-74.006, 40.7128])
        .addTo(map.current);

      marker.current.on("dragend", async () => {
        const lngLat = marker.current?.getLngLat();
        if (lngLat) {
          setCoordinates({ lat: lngLat.lat, lng: lngLat.lng });
          await reverseGeocode(lngLat.lng, lngLat.lat);
        }
      });

      map.current.on("click", async (e) => {
        const { lng, lat } = e.lngLat;
        marker.current?.setLngLat([lng, lat]);
        setCoordinates({ lat, lng });
        await reverseGeocode(lng, lat);
      });

      map.current.on("load", () => {
        setIsMapReady(true);
      });

      map.current.on("error", () => {
        toast({
          title: "Map Error",
          description: "Invalid Mapbox token. Please check and try again.",
          variant: "destructive",
        });
        clearToken();
      });
    } catch (error) {
      console.error("Map initialization error:", error);
      clearToken();
    }
  }, [mapboxToken]);

  useEffect(() => {
    if (open && mapboxToken && !showTokenInput) {
      // Small delay to ensure dialog is mounted
      const timer = setTimeout(initializeMap, 100);
      return () => clearTimeout(timer);
    }
  }, [open, mapboxToken, showTokenInput, initializeMap]);

  useEffect(() => {
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  const searchAddress = async () => {
    if (!searchQuery.trim() || !mapboxToken) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${mapboxToken}&limit=1`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        const address = data.features[0].place_name;

        map.current?.flyTo({ center: [lng, lat], zoom: 15 });
        marker.current?.setLngLat([lng, lat]);
        setSelectedAddress(address);
        setCoordinates({ lat, lng });
      } else {
        toast({
          title: "Address Not Found",
          description: "Could not find the specified address.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const handleConfirm = () => {
    onChange(selectedAddress, coordinates || undefined);
    setOpen(false);
    toast({
      title: "Address Updated",
      description: "Hospital address has been updated.",
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter address or select on map"
          className="bg-surface-1 border-border flex-1"
        />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" className="gap-2">
              <MapPin className="h-4 w-4" />
              Select on Map
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl h-[600px] bg-card border-border p-0 overflow-hidden">
            <DialogHeader className="p-4 border-b border-border">
              <DialogTitle>Select Hospital Location</DialogTitle>
            </DialogHeader>

            {showTokenInput ? (
              <div className="p-6 space-y-4">
                <div className="p-4 rounded-xl bg-surface-2 border border-border/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Key className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground">Mapbox Token Required</h4>
                      <p className="text-xs text-muted-foreground">
                        Enter your Mapbox public token to enable map features
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get your free token at{" "}
                    <a
                      href="https://mapbox.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      mapbox.com
                    </a>{" "}
                    → Dashboard → Tokens
                  </p>
                  <div className="flex gap-2">
                    <Input
                      value={mapboxToken}
                      onChange={(e) => setMapboxToken(e.target.value)}
                      placeholder="pk.eyJ1Ijo..."
                      className="bg-surface-1 border-border flex-1"
                    />
                    <Button onClick={saveToken} disabled={!mapboxToken.trim()}>
                      Save Token
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                {/* Search Bar */}
                <div className="p-4 border-b border-border flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && searchAddress()}
                      placeholder="Search for an address..."
                      className="pl-10 bg-surface-1 border-border"
                    />
                  </div>
                  <Button onClick={searchAddress} type="button">
                    Search
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearToken}
                    title="Change Mapbox token"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Map */}
                <div className="flex-1 relative">
                  <div ref={mapContainer} className="absolute inset-0" />
                  {!isMapReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-surface-2">
                      <p className="text-muted-foreground">Loading map...</p>
                    </div>
                  )}
                </div>

                {/* Selected Address & Confirm */}
                <div className="p-4 border-t border-border space-y-3">
                  <div className="p-3 rounded-lg bg-surface-2">
                    <p className="text-xs text-muted-foreground mb-1">Selected Address</p>
                    <p className="text-sm text-foreground">
                      {selectedAddress || "Click on the map or search for an address"}
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleConfirm} disabled={!selectedAddress}>
                      Confirm Location
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
