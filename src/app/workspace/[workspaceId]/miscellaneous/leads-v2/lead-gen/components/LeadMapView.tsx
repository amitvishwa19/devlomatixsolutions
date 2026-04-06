"use client";
import { useEffect, useRef, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Phone, Globe, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Lead } from '../data/mockLeads';
import 'leaflet/dist/leaflet.css';

interface LeadMapViewProps {
  leads: Lead[];
  onSelectLead?: (lead: Lead) => void;
}

// Fix default marker icons
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

// Geocode approximation from address using city/state/country
const geocodeCache = new Map<string, [number, number] | null>();

function getLeadCoords(lead: Lead): [number, number] | null {
  const key = `${lead.city},${lead.state},${lead.country}`;
  if (geocodeCache.has(key)) return geocodeCache.get(key)!;
  // We'll rely on OpenStreetMap Nominatim for geocoding
  return null;
}

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions.map(([lat, lng]) => [lat, lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [positions, map]);
  return null;
}

const LeadMapView = ({ leads, onSelectLead }: LeadMapViewProps) => {
  const [geocodedLeads, setGeocodedLeads] = useState<{ lead: Lead; coords: [number, number] }[]>([]);
  const [isGeocoding, setIsGeocoding] = useState(false);

  useEffect(() => {
    if (leads.length === 0) return;
    
    let cancelled = false;
    setIsGeocoding(true);

    const geocodeLeads = async () => {
      const results: { lead: Lead; coords: [number, number] }[] = [];
      const uniqueLocations = new Map<string, Lead[]>();

      // Group leads by location for batch-ish geocoding
      leads.forEach((lead) => {
        const key = [lead.address, lead.city, lead.state, lead.country].filter(Boolean).join(', ');
        if (!uniqueLocations.has(key)) uniqueLocations.set(key, []);
        uniqueLocations.get(key)!.push(lead);
      });

      for (const [address, addressLeads] of uniqueLocations) {
        if (cancelled) break;
        if (geocodeCache.has(address)) {
          const coords = geocodeCache.get(address);
          if (coords) addressLeads.forEach((lead) => results.push({ lead, coords }));
          continue;
        }

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
            { headers: { 'User-Agent': 'LeadFinder/1.0' } }
          );
          const data = await res.json();
          if (data.length > 0) {
            const coords: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            geocodeCache.set(address, coords);
            addressLeads.forEach((lead) => results.push({ lead, coords }));
          } else {
            geocodeCache.set(address, null);
          }
        } catch {
          geocodeCache.set(address, null);
        }

        // Rate limit Nominatim
        await new Promise((r) => setTimeout(r, 300));
      }

      if (!cancelled) {
        setGeocodedLeads(results);
        setIsGeocoding(false);
      }
    };

    geocodeLeads();
    return () => { cancelled = true; };
  }, [leads]);

  const positions = useMemo(
    () => geocodedLeads.map((g) => g.coords),
    [geocodedLeads]
  );

  if (leads.length === 0) {
    return (
      <div className="glass-card rounded-xl p-12 text-center animate-fade-in">
        <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No leads to map</h3>
        <p className="text-muted-foreground">Search for leads first to see them on the map.</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden animate-fade-in">
      {isGeocoding && (
        <div className="px-4 py-2 bg-primary/10 text-primary text-sm flex items-center gap-2">
          <span className="h-3 w-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          Geocoding {leads.length} leads...
        </div>
      )}
      <div className="h-[500px] w-full">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {positions.length > 0 && <FitBounds positions={positions} />}
          {geocodedLeads.map(({ lead, coords }, i) => (
            <Marker key={`${lead.id}-${i}`} position={coords}>
              <Popup>
                <div className="min-w-[200px] text-sm">
                  <h4 className="font-bold text-foreground mb-1">{lead.businessName}</h4>
                  <p className="text-muted-foreground text-xs mb-2">{lead.category}</p>
                  {lead.phone && <p className="text-xs">📞 {lead.phone}</p>}
                  {lead.website && <p className="text-xs">🌐 {lead.website}</p>}
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs">⭐ {lead.rating}</span>
                    <span className="text-xs text-muted-foreground">({lead.reviews} reviews)</span>
                  </div>
                  {onSelectLead && (
                    <button
                      onClick={() => onSelectLead(lead)}
                      className="mt-2 text-xs text-primary hover:underline"
                    >
                      View Details →
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <div className="px-4 py-2 text-xs text-muted-foreground border-t border-border">
        {geocodedLeads.length} of {leads.length} leads mapped • Powered by OpenStreetMap
      </div>
    </div>
  );
};

export default LeadMapView;
