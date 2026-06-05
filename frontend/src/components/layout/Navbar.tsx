import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="fixed top-0 w-full z-50 bg-surface/40 backdrop-blur-[30px] border-b border-white/40">
      <nav className="flex justify-between items-center px-container-padding h-20 max-w-7xl mx-auto">
        <Link to="/" className="font-display text-3xl font-bold text-primary">
          To'yxona
        </Link>

        <div className="hidden md:flex gap-stack-lg items-center">
          <Link
            to="/venues"
            className="font-body text-secondary font-bold border-b-2 border-secondary"
          >
            To'yxonalar
          </Link>
          <a href="#" className="font-body text-on-surface-variant hover:text-secondary transition-colors">
            Biz haqimizda
          </a>
          <Link
            to="/register/owner"
            className="bg-secondary text-on-secondary px-stack-lg py-3 rounded-full text-xs font-bold tracking-widest uppercase hover:scale-105 active:scale-95 transition-all shadow-lg shadow-secondary/20"
          >
            Hamkor bo'lish
          </Link>
        </div>

        <button className="md:hidden text-primary">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </nav>
    </header>
  );
}
