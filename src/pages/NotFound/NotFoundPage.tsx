import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSeo } from '@/hooks/useSeo';

export default function NotFoundPage() {
  useSeo({
    title: 'Page Not Found — Aurelia Developments',
    description: 'The requested page could not be located within the Aurelia portfolio.',
  });

  return (
    <section className="py-28 lg:py-36">
      <div className="container-editorial text-center space-y-6">
        <p className="text-xs uppercase tracking-[0.24em] text-bronze">404 · Unlisted Plate</p>
        <h1 className="font-serif text-4xl sm:text-6xl text-ink">
          Address Not Found
        </h1>
        <p className="text-sm text-ink-secondary max-w-md mx-auto leading-relaxed">
          The page or residence link you requested may have moved or been archived.
          Explore our active developments below.
        </p>
        <div className="pt-4">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-ink text-ivory text-xs uppercase tracking-[0.18em] hover:bg-bronze transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Explore Portfolio</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
