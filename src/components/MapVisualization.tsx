import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { cn } from '../lib/utils';

// Fix for default marker icons in Leaflet using CDN links
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapVisualizationProps {
  userLocation?: { latitude: number; longitude: number };
  destination?: { latitude: number; longitude: number; name: string };
  className?: string;
}

const RecenterMap: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export const MapVisualization: React.FC<MapVisualizationProps> = ({ userLocation, destination, className }) => {
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    if (userLocation && destination) {
      const R = 6371; // Earth's radius in km
      const dLat = (destination.latitude - userLocation.latitude) * Math.PI / 180;
      const dLon = (destination.longitude - userLocation.longitude) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(userLocation.latitude * Math.PI / 180) * Math.cos(destination.latitude * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const d = R * c;
      setDistance(d);
    }
  }, [userLocation, destination]);

  if (!userLocation && !destination) return null;

  const center: [number, number] = destination 
    ? [destination.latitude, destination.longitude] 
    : userLocation 
      ? [userLocation.latitude, userLocation.longitude] 
      : [0, 0];

  const zoom = 13;

  return (
    <div className={cn("w-full h-64 rounded-xl overflow-hidden border border-outline-variant/20 shadow-lg relative", className)}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }} 
        zoomControl={false}
        aria-label="Interactive map showing locations"
        role="region"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {userLocation && (
          <Marker 
            position={[userLocation.latitude, userLocation.longitude]}
            alt="Your current location marker"
          >
            <Popup aria-label="Your current location">You are here</Popup>
          </Marker>
        )}
        {destination && (
          <Marker 
            position={[destination.latitude, destination.longitude]}
            alt={`Destination marker for ${destination.name}`}
          >
            <Popup aria-label={`Destination: ${destination.name}`}>{destination.name}</Popup>
          </Marker>
        )}
        {userLocation && destination && (
          <Polyline 
            positions={[
              [userLocation.latitude, userLocation.longitude],
              [destination.latitude, destination.longitude]
            ]}
            color="var(--primary)"
            dashArray="5, 10"
          />
        )}
        <RecenterMap center={center} zoom={zoom} />
      </MapContainer>

      {distance !== null && (
        <div 
          className="absolute bottom-4 left-4 z-[1000] bg-surface-container-highest/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-primary/30 shadow-xl"
          aria-live="polite"
          role="status"
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-0.5">Estimated Distance</p>
          <p className="text-sm font-headline font-bold text-white" aria-label={`Estimated distance is ${distance < 1 ? `${(distance * 1000).toFixed(0)} meters` : `${distance.toFixed(1)} kilometers`}`}>
            {distance < 1 ? `${(distance * 1000).toFixed(0)} m` : `${distance.toFixed(1)} km`}
          </p>
        </div>
      )}
    </div>
  );
};
