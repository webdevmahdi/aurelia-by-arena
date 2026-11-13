import { MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '@/app/store/hooks';
import { openConversionModal } from '@/components/conversion/conversionSlice';
import { useGetProjectsQuery } from '@/features/projects/projectsApi';
import { buildWhatsAppConciergeUrl } from '@/lib/format';

export function SiteFooter() {
  const dispatch = useAppDispatch();
  const { data } = useGetProjectsQuery({ limit: 12 });
  const projects = data?.items ?? [];

  return (
    <footer className="bg-obsidian text-ivory border-t border-[var(--border-on-dark)]">
      <div className="container-wide py-20 lg:py-24 space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12">
          {/* Column 1: Brand Statement */}
          <div className="lg:col-span-4 space-y-5">
            <div>
              <span className="block font-serif text-2xl tracking-[0.24em] uppercase text-ivory">
                Aurelia
              </span>
              <span className="block text-[10px] uppercase tracking-[0.28em] text-brass mt-1">
                Developments
              </span>
            </div>
            <p className="text-sm text-ivory-muted leading-relaxed max-w-sm">
              Architectural residential developments conceived with quarry-numbered natural
              stone, enduring craftsmanship, and quiet permanence across the world’s premier
              addresses.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => dispatch(openConversionModal({ mode: 'SITE_VISIT' }))}
                className="px-4 py-2.5 bg-ivory text-ink text-xs uppercase tracking-[0.16em] hover:bg-bronze hover:text-ivory transition-colors cursor-pointer"
              >
                Book Private Viewing
              </button>
              <a
                href={buildWhatsAppConciergeUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-[var(--border-on-dark-strong)] text-xs uppercase tracking-[0.16em] text-ivory hover:border-ivory transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-brass" strokeWidth={1.5} />
                <span>WhatsApp Desk</span>
              </a>
            </div>
          </div>

          {/* Column 2: Portfolio (Live from API) */}
          <div className="lg:col-span-3 space-y-4">
            <h2 className="text-[11px] uppercase tracking-[0.22em] text-brass font-sans">
              Portfolio Developments
            </h2>
            <ul className="space-y-2.5 text-sm text-ivory-muted">
              {projects.map((project) => (
                <li key={project.id}>
                  <Link
                    to={`/projects/${project.slug}`}
                    className="hover:text-ivory transition-colors"
                  >
                    {project.name} — {project.location.city}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/projects"
                  className="text-xs uppercase tracking-[0.16em] text-ivory hover:text-brass transition-colors"
                >
                  View Complete Portfolio →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Navigation & Services */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-[11px] uppercase tracking-[0.22em] text-brass font-sans">
              Navigation
            </h2>
            <ul className="space-y-2.5 text-sm text-ivory-muted">
              <li>
                <Link to="/projects" className="hover:text-ivory transition-colors">
                  Developments
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-ivory transition-colors">
                  Residence Search
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-ivory transition-colors">
                  About Developer
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-ivory transition-colors">
                  Private Sales Office
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => dispatch(openConversionModal({ mode: 'BROCHURE' }))}
                  className="hover:text-ivory transition-colors cursor-pointer"
                >
                  Request Brochure
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Private Sales Galleries */}
          <div className="lg:col-span-3 space-y-4">
            <h2 className="text-[11px] uppercase tracking-[0.22em] text-brass font-sans">
              Private Sales Galleries
            </h2>
            <div className="space-y-4 text-xs text-ivory-muted leading-relaxed">
              <div>
                <p className="text-ivory uppercase tracking-[0.15em]">London Flagship</p>
                <p>14 Carlos Place, Mayfair, London W1K 2AR</p>
                <p className="tabular-nums">+44 20 7946 0821</p>
              </div>
              <div>
                <p className="text-ivory uppercase tracking-[0.15em]">Dubai Waterfront</p>
                <p>Jumeirah Bay Peninsula Pavilion, Dubai</p>
                <p className="tabular-nums">+971 4 512 9400</p>
              </div>
              <div>
                <p className="text-ivory uppercase tracking-[0.15em]">Private Advisory</p>
                <p>advisory@aureliadevelopments.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Colophon & Legal */}
        <div className="pt-8 border-t border-[var(--border-on-dark)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-ivory-muted">
          <p>
            © {new Date().getFullYear()} Aurelia Developments Ltd. All architectural plates,
            dimensions, and guide prices remain indicative and subject to contract.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-ivory transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-ivory transition-colors">
              Legal &amp; Disclaimers
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
