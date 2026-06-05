import { Link } from 'react-router-dom';
import { useGetVenuesQuery } from './services/venueApi';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AmbientGlow from './components/layout/AmbientGlow';
import VenueCard from './components/venue/VenueCard';


export default function HomePage() {
  // Backend'dan tasdiqlangan to'yxonalarni olamiz
  const { data, isLoading, isError } = useGetVenuesQuery();
  // Faqat birinchi 3 tasini "Tanlangan" sifatida ko'rsatamiz
  const featured = data?.venues.slice(0, 3) ?? [];

  return (
    <>
      <AmbientGlow />
      <Navbar />

      <main className="relative z-10 pt-32 pb-section-gap px-4 md:px-0">
        <div className="max-w-6xl mx-auto glass-container rounded-[40px] p-container-padding shadow-2xl">
          {/* Hero */}
          <section className="text-center mb-section-gap">
            <div className="inline-block px-4 py-1 mb-stack-md bg-primary/10 rounded-full">
              <span className="text-xs font-bold text-primary tracking-[0.2em] uppercase">
                Bayramlarda oltin standart
              </span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-[#1c1b1b] mb-stack-lg">
              Orzuingizdagi to'yxona, <br className="hidden md:block" />
              bir bosishda
            </h1>
            <p className="max-w-2xl mx-auto text-on-surface-variant text-lg mb-stack-lg opacity-80">
              Eng nufuzli to'yxonalar va maxsus xizmatlar to'plamimiz bilan
              hashamatli to'y rejasini yarating.
            </p>
            <div className="flex flex-col md:flex-row justify-center gap-gutter">
              <Link
                to="/venues"
                className="bg-secondary text-on-secondary px-10 py-5 rounded-full text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 group"
              >
                To'yxonalarni ko'rish
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </Link>
              <Link
                to="/venues"
                className="glass-container border-white/60 text-secondary px-10 py-5 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-white/30 transition-colors"
              >
                Tur band qilish
              </Link>
            </div>
          </section>

          {/* Tanlangan to'yxonalar */}
          <section>
            <div className="flex justify-between items-end mb-stack-lg">
              <div>
                <h2 className="font-display text-3xl md:text-5xl font-semibold text-primary">
                  Tanlangan to'yxonalar
                </h2>
                <p className="text-on-surface-variant opacity-70">
                  Nafis arxitekturasi va a'lo xizmati uchun saralangan.
                </p>
              </div>
              <Link
                to="/venues"
                className="hidden md:flex items-center gap-1 text-secondary text-xs font-bold tracking-widest uppercase hover:underline"
              >
                Barchasini ko'rish
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              </Link>
            </div>

            {/* Holatlar: yuklanyapti / xato / bo'sh / ma'lumot */}
            {isLoading && (
              <p className="text-center text-on-surface-variant py-10">Yuklanmoqda...</p>
            )}
            {isError && (
              <p className="text-center text-error py-10">
                To'yxonalarni yuklashda xatolik yuz berdi.
              </p>
            )}
            {!isLoading && !isError && featured.length === 0 && (
              <p className="text-center text-on-surface-variant py-10">
                Hozircha to'yxonalar yo'q.
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              {featured.map((venue) => (
                <VenueCard key={venue.venue_id} venue={venue} />
              ))}
            </div>
          </section>

          {/* Statistika */}
          <section className="mt-section-gap grid grid-cols-2 md:grid-cols-4 gap-gutter text-center border-t border-white/20 pt-stack-lg">
            {[
              { value: '1.2k+', label: "O'tkazilgan to'ylar" },
              { value: '45', label: 'Nufuzli to\'yxonalar' },
              { value: '98%', label: 'Mamnun juftliklar' },
              { value: '24s', label: 'Javob vaqti' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-4xl md:text-5xl text-primary">{stat.value}</div>
                <div className="text-xs uppercase tracking-widest text-on-surface-variant opacity-60 mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
