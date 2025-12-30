
import Link from 'next/link';
import { cn } from '@/lib/utils';

const services = [
    { name: 'Netflix', id: '8', logo: 'https://image.tmdb.org/t/p/w500/wwemzKWzjKYJFfCeiB57q3r4Bcm.png', href:'/discover/8' },
    { name: 'Disney+', id: '337', logo: 'https://www.pngall.com/wp-content/uploads/13/Disney-Plus-Logo-PNG.png', href:'/discover/337' },
    { name: 'Amazon Prime Video', id: '9', logo: 'https://image.tmdb.org/t/p/w500/ifhbNuuVnlwYy5oXA5VIb2YR8AZ.png', href:'/discover/9' },
    { name: 'Hulu', id: '453', logo: 'https://w7.pngwing.com/pngs/751/977/png-transparent-hulu-hd-logo.png', href:'/discover/453' },
    { name: 'Max', id: '1899', logo: 'https://image.tmdb.org/t/p/w500/Aau221n5XF221n5XF2r7s4S2U3iP9qfOa.png', href:'/discover/1899' },
    { name: 'Apple TV+', id: '2552', logo: 'https://image.tmdb.org/t/p/w500/fP2c54tbyQ3hX333w9yv3D2iO73.png', href:'/discover/2552' },
];

interface StreamingServiceSelectorProps {
  className?: string;
  style?: React.CSSProperties;
}

export function StreamingServiceSelector({ className, style }: StreamingServiceSelectorProps) {
  return (
    <section className={cn("animate-fade-in-up", className)} style={style}>
      <h2 className="mb-4 font-headline text-2xl font-bold">Browse by Service</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {services.map((service) => (
          <Link key={service.id} href={service.href} className="group">
            <div className="relative flex items-center justify-center p-6 rounded-lg transition-all duration-300 ease-in-out aspect-video md:hover:scale-105">
              <div
                className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-80 transition-all duration-300 md:group-hover:scale-110"
                style={{ backgroundImage: `url(${service.logo})` }}
              ></div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
