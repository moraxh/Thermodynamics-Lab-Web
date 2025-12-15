'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { CONTACT_INFO } from '@lib/constants';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix para los iconos de Leaflet en Next.js
const fixLeafletIcons = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
};

export default function MapComponent() {
  const lat = parseFloat(CONTACT_INFO.address.coordinates.lat);
  const lon = parseFloat(CONTACT_INFO.address.coordinates.lon);

  useEffect(() => {
    fixLeafletIcons();
  }, []);

  return (
    <MapContainer
      center={[lat, lon]}
      zoom={15}
      scrollWheelZoom={false}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      <Marker position={[lat, lon]}>
        <Popup>
          <div className="text-center">
            <strong className="block mb-1">{CONTACT_INFO.address.line3}</strong>
            <span className="text-xs text-gray-600">
              {CONTACT_INFO.address.line1}
              <br />
              {CONTACT_INFO.address.line2}
            </span>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
