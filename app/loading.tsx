// ============================================================================
// LOADING — esqueleto mientras llega una pantalla.
//
// Antes no existía en ninguna de las 50 rutas: al entrar a una ruta dinámica
// (/mundo/[id], /mision/[id], /boss/[id], /reinos/[region]…) el navegador se
// quedaba con la pantalla anterior y luego saltaba de golpe a la nueva.
//
// Reproduce la silueta del armazón —cabecera, contenido, barra inferior— para
// que el salto al contenido real no mueva nada de sitio. No es un componente de
// cliente: no necesita estado, y así no suma nada al JS que baja el jugador.
// ============================================================================

/** Barra gris con el pulso de carga. */
function Hueso({ className = "" }: { className?: string }) {
  return <div className={`hueso ${className}`} aria-hidden="true" />;
}

export default function Loading() {
  return (
    <div className="shell" data-lock="true" data-variant="app">
      {/* Cabecera */}
      <div className="shell-header py-2">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Hueso className="h-[44px] w-24 shrink-0" />
          <Hueso className="h-6 w-40" />
          <div className="flex-1" />
          <Hueso className="h-6 w-28 hidden sm:block" />
        </div>
      </div>

      {/* Contenido */}
      <main className="shell-main" aria-busy="true" aria-live="polite">
        <span className="sr-only">Cargando la pantalla…</span>
        <div className="flex-1 flex flex-col gap-3 py-3 max-w-7xl w-full mx-auto">
          <Hueso className="h-8 w-2/3 max-w-sm" />
          <Hueso className="h-4 w-1/2 max-w-xs" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Hueso key={i} className="h-24" />
            ))}
          </div>
        </div>
      </main>

      {/* Barra inferior */}
      <div className="shell-navspace" aria-hidden="true" />
      <div className="shell-nav">
        <div className="flex items-stretch justify-around gap-1 h-full px-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <Hueso key={i} className="h-9 flex-1 self-center" />
          ))}
        </div>
      </div>
    </div>
  );
}
