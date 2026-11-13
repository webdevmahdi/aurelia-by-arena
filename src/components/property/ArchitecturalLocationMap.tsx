import { Compass, ExternalLink, MapPin } from 'lucide-react';
import type { ProjectDTO } from '@/types/api';

export function ArchitecturalLocationMap({
  location,
  projectName,
}: {
  location: ProjectDTO['location'];
  projectName: string;
}) {
  const hasCoords =
    typeof location.lat === 'number' && typeof location.lng === 'number';

  const mapsHref = hasCoords
    ? `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${location.address}, ${location.city}, ${location.country}`
      )}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 border border-[var(--border-hairline)] bg-elevated">
      {/* Left: Address & Coordinates Monograph */}
      <div className="lg:col-span-5 p-7 sm:p-10 flex flex-col justify-between gap-8 border-b lg:border-b-0 lg:border-r border-[var(--border-hairline)]">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-bronze">
            <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Principal Address</span>
          </div>
          <h3 className="font-serif text-3xl text-ink">
            {location.city}, {location.country}
          </h3>
          <p className="text-sm text-ink-secondary leading-relaxed">
            {location.address}
          </p>
        </div>

        <div className="space-y-5 pt-6 border-t border-[var(--border-hairline)]">
          {hasCoords && (
            <dl className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <dt className="uppercase tracking-[0.16em] text-ink-muted">Latitude</dt>
                <dd className="text-ink font-medium tabular-nums mt-1">
                  {location.lat!.toFixed(4)}° N
                </dd>
              </div>
              <div>
                <dt className="uppercase tracking-[0.16em] text-ink-muted">Longitude</dt>
                <dd className="text-ink font-medium tabular-nums mt-1">
                  {Math.abs(location.lng!).toFixed(4)}°{' '}
                  {location.lng! >= 0 ? 'E' : 'W'}
                </dd>
              </div>
            </dl>
          )}

          <a
            href={mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 border border-ink text-ink text-xs uppercase tracking-[0.16em] hover:bg-ink hover:text-ivory transition-colors"
          >
            <span>Open Cartographic Directions</span>
            <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
          </a>
        </div>
      </div>

      {/* Right: Architectural Site Plan / Topographic Cartography Plate */}
      <div className="lg:col-span-7 relative bg-[#EFE9DD] min-h-[320px] overflow-hidden flex items-center justify-center p-6">
        <svg
          viewBox="0 0 720 400"
          className="w-full h-full max-h-[360px]"
          role="img"
          aria-label={`Architectural site locator map for ${projectName} at ${location.address}`}
        >
          <rect width="720" height="400" fill="#EFE9DD" />
          {/* Topographic contour lines */}
          <path
            d="M0 90 Q 210 55, 420 110 T 720 85"
            stroke="#181715"
            strokeOpacity="0.1"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M0 165 Q 240 120, 450 185 T 720 155"
            stroke="#181715"
            strokeOpacity="0.12"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M0 285 Q 200 245, 430 300 T 720 265"
            stroke="#181715"
            strokeOpacity="0.1"
            strokeWidth="1"
            fill="none"
          />
          {/* Urban arterial grid */}
          <g stroke="#181715" strokeOpacity="0.14" strokeWidth="1">
            <line x1="120" y1="0" x2="175" y2="400" />
            <line x1="340" y1="0" x2="365" y2="400" />
            <line x1="560" y1="0" x2="530" y2="400" />
            <line x1="0" y1="210" x2="720" y2="192" />
          </g>
          {/* Architectural Plot Envelope */}
          <rect
            x="312"
            y="156"
            width="96"
            height="72"
            fill="#8C6D46"
            fillOpacity="0.16"
            stroke="#8C6D46"
            strokeWidth="1.5"
          />
          <circle cx="360" cy="192" r="26" stroke="#8C6D46" strokeDasharray="3 3" fill="none" />
          <circle cx="360" cy="192" r="5.5" fill="#181715" />
          <circle cx="360" cy="192" r="2.5" fill="#FAF7F2" />

          {/* Site Label */}
          <rect x="260" y="108" width="200" height="32" fill="#181715" />
          <text
            x="360"
            y="128"
            textAnchor="middle"
            fill="#F3EFE7"
            fontFamily="Georgia, serif"
            fontSize="12"
            letterSpacing="2"
          >
            {projectName.toUpperCase()}
          </text>

          {/* Scale bar */}
          <line x1="36" y1="368" x2="156" y2="368" stroke="#181715" strokeWidth="1.5" />
          <line x1="36" y1="362" x2="36" y2="374" stroke="#181715" strokeWidth="1.5" />
          <line x1="156" y1="362" x2="156" y2="374" stroke="#181715" strokeWidth="1.5" />
          <text x="36" y="355" fill="#4E4A44" fontSize="10" letterSpacing="1.5">
            0 — 250m PRECINCT RADIUS
          </text>
        </svg>

        <div className="absolute top-4 right-4 px-3 py-1.5 bg-elevated/90 border border-[var(--border-hairline)] inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-ink-secondary">
          <Compass className="w-3.5 h-3.5 text-bronze" strokeWidth={1.5} />
          <span>True North Up</span>
        </div>
      </div>
    </div>
  );
}
