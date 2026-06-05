// Orqa fonda harakatlanuvchi yorug'lik effektlari
export default function AmbientGlow() {
  return (
    <>
      <div className="ambient-glow top-[-100px] left-[-100px] animate-pulse-slow" />
      <div
        className="ambient-glow bottom-[-100px] right-[-100px] animate-pulse-slow"
        style={{ animationDelay: '-4s' }}
      />
    </>
  );
}
