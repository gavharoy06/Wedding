export default function Footer() {
  return (
    <footer className="relative z-10 w-full glass-container border-t border-white/40">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 py-stack-lg px-container-padding max-w-7xl mx-auto">
        <div>
          <div className="font-display text-3xl text-primary mb-2">To'yxona</div>
          <p className="text-on-surface-variant text-sm max-w-xs">
            Markaziy Osiyodagi eng nufuzli marosimlarni tashkil etamiz.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-stack-lg items-center text-on-surface-variant">
          <a href="#" className="hover:text-secondary transition-colors">Maxfiylik siyosati</a>
          <a href="#" className="hover:text-secondary transition-colors">Foydalanish shartlari</a>
          <a href="#" className="hover:text-secondary transition-colors">Aloqa</a>
        </div>

        <div className="text-on-surface-variant text-sm opacity-60">
          © 2024 To'yxona. Barcha huquqlar himoyalangan.
        </div>
      </div>
    </footer>
  );
}
