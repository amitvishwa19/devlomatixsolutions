'use client';

import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { useTheme } from 'next-themes';
import { Loader2, AlertCircle, Compass, Layers, ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Dark Mode Map Style JSON for Google Maps JavaScript API
const GOOGLE_MAPS_DARK_STYLE = [
    { elementType: 'geometry', stylers: [{ color: '#181b26' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
    { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#334155' }] },
    { featureType: 'administrative.province', elementType: 'geometry.stroke', stylers: [{ color: '#334155' }] },
    { featureType: 'landscape.man_made', elementType: 'geometry.stroke', stylers: [{ color: '#1e293b' }] },
    { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#111827' }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
    { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
    { featureType: 'poi.park', elementType: 'geometry.fill', stylers: [{ color: '#064e3b' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#273449' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#cbd5e1' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3b82f6' }] },
    { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1d4ed8' }] },
    { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#475569' }] },
];

/**
 * Loads Google Maps JavaScript API script singleton
 */
let googleMapsPromise = null;
function loadGoogleMapsScript(apiKey) {
    if (typeof window === 'undefined') return Promise.reject(new Error('Window not available'));
    if (window.google && window.google.maps) return Promise.resolve(window.google.maps);

    if (!googleMapsPromise) {
        googleMapsPromise = new Promise((resolve, reject) => {
            const existingScript = document.getElementById('google-maps-js-sdk');
            if (existingScript) {
                const interval = setInterval(() => {
                    if (window.google && window.google.maps) {
                        clearInterval(interval);
                        resolve(window.google.maps);
                    }
                }, 50);
                return;
            }

            const script = document.createElement('script');
            script.id = 'google-maps-js-sdk';
            script.type = 'text/javascript';
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
            script.async = true;
            script.defer = true;

            script.onload = () => {
                if (window.google && window.google.maps) {
                    resolve(window.google.maps);
                } else {
                    reject(new Error('Google Maps SDK loaded but google.maps not found'));
                }
            };

            script.onerror = (err) => {
                googleMapsPromise = null;
                reject(new Error('Failed to load Google Maps script. Check your API key or network connection.'));
            };

            document.head.appendChild(script);
        });
    }

    return googleMapsPromise;
}

const GoogleTeamMapView = forwardRef(function GoogleTeamMapView(
    {
        teamMembers = [],
        selectedUserId = 'all',
        onSelectUser = null,
        className = '',
        showTrails = true,
    },
    ref
) {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const overlaysRef = useRef([]);
    const polylinesRef = useRef([]);
    const infoWindowRef = useRef(null);

    const [isLoaded, setIsLoaded] = useState(false);
    const [loadError, setLoadError] = useState(null);
    const [mapTypeId, setMapTypeId] = useState('roadmap');

    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    const apiKey =
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
        'AIzaSyBqWg-_Ye6N0jba9cx81tNzU_zNmaJ9Vd0';

    // ─── Initialize Map ──────────────────────────────────────────────────────────
    useEffect(() => {
        let isMounted = true;

        loadGoogleMapsScript(apiKey)
            .then((maps) => {
                if (!isMounted || !mapContainerRef.current) return;

                if (!mapInstanceRef.current) {
                    const defaultCenter = { lat: 28.6139, lng: 77.2090 }; // Center (New Delhi Hub)
                    const map = new maps.Map(mapContainerRef.current, {
                        center: defaultCenter,
                        zoom: 12,
                        mapTypeId: mapTypeId,
                        styles: isDark ? GOOGLE_MAPS_DARK_STYLE : [],
                        disableDefaultUI: true,
                        zoomControl: false,
                        mapTypeControl: false,
                        scaleControl: true,
                        streetViewControl: false,
                        rotateControl: true,
                        fullscreenControl: false,
                        gestureHandling: 'greedy',
                    });

                    infoWindowRef.current = new maps.InfoWindow();
                    mapInstanceRef.current = map;
                }

                setIsLoaded(true);
            })
            .catch((err) => {
                console.error('[GOOGLE_MAPS_LOAD_ERROR]', err);
                if (isMounted) setLoadError(err.message);
            });

        return () => {
            isMounted = false;
        };
    }, [apiKey]);

    // ─── Update Theme Style ──────────────────────────────────────────────────────
    useEffect(() => {
        if (mapInstanceRef.current && window.google?.maps) {
            mapInstanceRef.current.setOptions({
                styles: isDark ? GOOGLE_MAPS_DARK_STYLE : [],
            });
        }
    }, [isDark]);

    // ─── Update Map Type ─────────────────────────────────────────────────────────
    const handleSetMapType = useCallback((type) => {
        setMapTypeId(type);
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setMapTypeId(type);
        }
    }, []);

    // ─── Fit Bounds to All Users ─────────────────────────────────────────────────
    const fitAllUsers = useCallback(() => {
        if (!mapInstanceRef.current || !window.google?.maps || !teamMembers.length) return;

        const bounds = new window.google.maps.LatLngBounds();
        let validPoints = 0;

        teamMembers.forEach((user) => {
            if (user.latestLocation?.lat && user.latestLocation?.lng) {
                bounds.extend({
                    lat: Number(user.latestLocation.lat),
                    lng: Number(user.latestLocation.lng),
                });
                validPoints++;
            }
        });

        if (validPoints > 0) {
            mapInstanceRef.current.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });
            if (validPoints === 1) {
                mapInstanceRef.current.setZoom(15);
            }
        }
    }, [teamMembers]);

    // ─── Center on a specific user ───────────────────────────────────────────────
    const centerOnUser = useCallback((userId) => {
        if (!mapInstanceRef.current || !window.google?.maps) return;
        const target = teamMembers.find((u) => u.id === userId);
        if (target?.latestLocation?.lat && target?.latestLocation?.lng) {
            const pos = {
                lat: Number(target.latestLocation.lat),
                lng: Number(target.latestLocation.lng),
            };
            mapInstanceRef.current.panTo(pos);
            mapInstanceRef.current.setZoom(16);
        }
    }, [teamMembers]);

    // ─── Expose Imperative Controls to Parent ───────────────────────────────────
    useImperativeHandle(ref, () => ({
        fitAllUsers,
        centerOnUser,
        setMapType: handleSetMapType,
        zoomIn: () => mapInstanceRef.current?.setZoom((mapInstanceRef.current.getZoom() || 12) + 1),
        zoomOut: () => mapInstanceRef.current?.setZoom((mapInstanceRef.current.getZoom() || 12) - 1),
    }), [fitAllUsers, centerOnUser, handleSetMapType]);

    // ─── Render HTML Overlay Markers & Polylines ─────────────────────────────────
    useEffect(() => {
        if (!isLoaded || !mapInstanceRef.current || !window.google?.maps) return;

        const maps = window.google.maps;
        const map = mapInstanceRef.current;

        // 1. Clear previous overlays & polylines
        overlaysRef.current.forEach((ov) => {
            if (ov && ov.setMap) ov.setMap(null);
        });
        overlaysRef.current = [];

        polylinesRef.current.forEach((poly) => {
            if (poly && poly.setMap) poly.setMap(null);
        });
        polylinesRef.current = [];

        // 2. Custom HTML Overlay Class
        class HTMLMarkerOverlay extends maps.OverlayView {
            constructor(user, isSelected, onClick) {
                super();
                this.user = user;
                this.isSelected = isSelected;
                this.onClick = onClick;
                this.div = null;
                this.position = new maps.LatLng(
                    Number(user.latestLocation.lat),
                    Number(user.latestLocation.lng)
                );
            }

            onAdd() {
                const div = document.createElement('div');
                div.style.position = 'absolute';
                div.style.cursor = 'pointer';
                div.style.zIndex = this.isSelected ? '100' : '50';
                div.style.transform = 'translate(-50%, -100%)';

                const u = this.user;
                const isDriving = u.isDriving;
                const isWalking = u.activity === 'walking';
                const speedText = u.speedKmH ? `${u.speedKmH} km/h` : (isWalking ? 'Walking' : 'Idle');
                const platformBadge = u.platform === 'mobile' ? '📱 Mobile' : '💻 Web';
                const pulseRing = u.isOnline ? `<span class="absolute -inset-1 rounded-full animate-ping opacity-30" style="background-color: ${u.color};"></span>` : '';

                // Activity icon SVG (Walking Human vs Driving Vehicle)
                const activityIconSvg = isDriving
                    ? `<svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 3c-.1.2-.1.5-.1.8V16c0 .6.4 1 1 1h2m14 0a2 2 0 11-4 0m4 0a2 2 0 10-4 0m-8 0a2 2 0 11-4 0m4 0a2 2 0 10-4 0"/></svg>`
                    : `<svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>`;

                div.innerHTML = `
                    <div class="relative flex flex-col items-center group transition-all duration-200 ${this.isSelected ? 'scale-110' : 'hover:scale-105'}">
                        <!-- Email & Device Badge Header -->
                        <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white shadow-lg backdrop-blur-md mb-1 border border-white/20 whitespace-nowrap" style="background-color: ${u.color}ee;">
                            <span>${u.email || u.name}</span>
                            <span class="opacity-75 text-[9px] px-1 py-0.2 bg-black/30 rounded">${platformBadge}</span>
                        </div>

                        <!-- Pin Core & Avatar -->
                        <div class="relative flex items-center justify-center">
                            ${pulseRing}
                            <div class="w-10 h-10 rounded-full flex items-center justify-center shadow-xl border-2 border-white dark:border-slate-800 transition-transform" style="background-color: ${u.color};">
                                ${activityIconSvg}
                            </div>
                            
                            <!-- Speed Badge Pill (Bottom-right) -->
                            <div class="absolute -bottom-1 -right-2 bg-slate-900/90 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full border border-slate-700 shadow-sm">
                                ${speedText}
                            </div>
                        </div>

                        <!-- Pin Tip Indicator -->
                        <div class="w-2.5 h-2.5 rotate-45 -mt-1 rounded-sm shadow-md" style="background-color: ${u.color};"></div>
                    </div>
                `;

                div.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.onClick(u);
                });

                this.div = div;
                const panes = this.getPanes();
                panes.overlayMouseTarget.appendChild(div);
            }

            draw() {
                if (!this.div) return;
                const projection = this.getProjection();
                if (!projection) return;
                const point = projection.fromLatLngToDivPixel(this.position);
                if (point) {
                    this.div.style.left = `${point.x}px`;
                    this.div.style.top = `${point.y}px`;
                }
            }

            onRemove() {
                if (this.div && this.div.parentNode) {
                    this.div.parentNode.removeChild(this.div);
                    this.div = null;
                }
            }
        }

        // 3. Mount Overlays
        teamMembers.forEach((user) => {
            if (!user.latestLocation?.lat || !user.latestLocation?.lng) return;

            const isSelected = selectedUserId === user.id || selectedUserId === 'all';
            const overlay = new HTMLMarkerOverlay(user, selectedUserId === user.id, (clickedUser) => {
                if (onSelectUser) onSelectUser(clickedUser.id);

                // Open InfoWindow
                const content = `
                    <div style="font-family: system-ui, -apple-system, sans-serif; padding: 6px; min-width: 220px; color: #0f172a;">
                        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
                            <strong style="font-size: 13px; font-weight: 700;">${clickedUser.name}</strong>
                            <span style="font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 9999px; background: ${clickedUser.color}20; color: ${clickedUser.color};">
                                ${clickedUser.role}
                            </span>
                        </div>
                        <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">
                            ✉️ ${clickedUser.email}
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px; background: #f8fafc; padding: 6px; border-radius: 6px; border: 1px solid #e2e8f0;">
                            <div>
                                <span style="color: #64748b; display: block; font-size: 9px; text-transform: uppercase;">Status</span>
                                <span style="font-weight: 600; text-transform: capitalize;">${clickedUser.activity}</span>
                            </div>
                            <div>
                                <span style="color: #64748b; display: block; font-size: 9px; text-transform: uppercase;">Speed</span>
                                <span style="font-weight: 600;">${clickedUser.speedKmH} km/h</span>
                            </div>
                            <div>
                                <span style="color: #64748b; display: block; font-size: 9px; text-transform: uppercase;">Platform</span>
                                <span style="font-weight: 600; text-transform: capitalize;">${clickedUser.platform}</span>
                            </div>
                            <div>
                                <span style="color: #64748b; display: block; font-size: 9px; text-transform: uppercase;">Distance</span>
                                <span style="font-weight: 600;">${clickedUser.distanceKm} km</span>
                            </div>
                        </div>
                        ${clickedUser.device ? `<div style="font-size: 10px; color: #64748b; margin-top: 6px;">📱 Device: ${clickedUser.device}</div>` : ''}
                    </div>
                `;

                infoWindowRef.current.setContent(content);
                infoWindowRef.current.setPosition({
                    lat: Number(clickedUser.latestLocation.lat),
                    lng: Number(clickedUser.latestLocation.lng),
                });
                infoWindowRef.current.open(map);
            });

            overlay.setMap(map);
            overlaysRef.current.push(overlay);
        });

        // 4. Render Trails / Polylines
        if (showTrails) {
            teamMembers.forEach((user) => {
                const shouldShow = selectedUserId === 'all' || selectedUserId === user.id;
                if (!shouldShow || !user.trail || user.trail.length < 2) return;

                const path = user.trail.map((pt) => ({
                    lat: Number(pt.lat),
                    lng: Number(pt.lng),
                }));

                const polyline = new maps.Polyline({
                    path,
                    geodesic: true,
                    strokeColor: user.color || '#3b82f6',
                    strokeOpacity: selectedUserId === user.id ? 0.95 : 0.6,
                    strokeWeight: selectedUserId === user.id ? 4 : 3,
                    map,
                });

                polylinesRef.current.push(polyline);
            });
        }
    }, [isLoaded, teamMembers, selectedUserId, onSelectUser, showTrails]);

    return (
        <div className={`relative w-full h-full min-h-[500px] overflow-hidden rounded-2xl border border-border bg-muted/20 ${className}`}>
            {/* Map Container Target */}
            <div ref={mapContainerRef} className="w-full h-full min-h-[500px]" />

            {/* Loading Overlay */}
            {!isLoaded && !loadError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-30 gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-xs font-semibold text-muted-foreground">
                        Initializing Google Maps Telemetry SDK...
                    </p>
                </div>
            )}

            {/* Error Banner */}
            {loadError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/95 z-30 p-6 text-center gap-3">
                    <AlertCircle className="w-10 h-10 text-destructive" />
                    <h3 className="text-sm font-bold text-foreground">Google Maps Failed to Load</h3>
                    <p className="text-xs text-muted-foreground max-w-md">{loadError}</p>
                    <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
                        <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                        Reload Page
                    </Button>
                </div>
            )}

            {/* Floating Map Controls Toolbar */}
            {isLoaded && (
                <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 bg-background/90 backdrop-blur-md p-1.5 rounded-xl border border-border shadow-lg">
                    {/* Layer Type Switcher */}
                    <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg">
                        <button
                            type="button"
                            onClick={() => handleSetMapType('roadmap')}
                            className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                                mapTypeId === 'roadmap' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Map
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSetMapType('satellite')}
                            className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                                mapTypeId === 'satellite' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Satellite
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSetMapType('terrain')}
                            className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                                mapTypeId === 'terrain' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Terrain
                        </button>
                    </div>

                    <div className="flex items-center justify-between gap-1 pt-1 border-t border-border/50">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => mapInstanceRef.current?.setZoom((mapInstanceRef.current.getZoom() || 12) + 1)}
                            title="Zoom In"
                        >
                            <ZoomIn className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => mapInstanceRef.current?.setZoom((mapInstanceRef.current.getZoom() || 12) - 1)}
                            title="Zoom Out"
                        >
                            <ZoomOut className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={fitAllUsers}
                            title="Fit All Team Members"
                        >
                            <Maximize2 className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
});

export default GoogleTeamMapView;
