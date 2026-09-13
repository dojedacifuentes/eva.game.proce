"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { CAMPAÑA, getBoss, type Acto, type Boss, type Mision } from "@/data/campaign";
import { bossVencido, leerProgreso } from "@/lib/eva";
import { sfx } from "@/lib/audio";

// ============================================================================
// MAPA DE FLUJO — la campaña como un flujo de nodos sobre un plano cenital.
//
// Sustituye al mapa de perfil urbano (GameWorldMap + MapCity): un SVG de 800×620
// escalado entero a la pantalla, con nodos de 36 px y etiquetas de 10,5 px que
// en un teléfono quedaban diminutas, parallax por puntero y ocho animaciones
// infinitas por nodo.
//
// Ahora, como en un editor de automatizaciones:
//  · Cada misión y cada jefe es un NODO con puerto de entrada y de salida.
//  · Los CABLES muestran el recorrido: verdes los ya ejecutados, animado sólo el
//    que entra al nodo actual, grises los pendientes.
//  · Cada acto es un DISTRITO de la ciudad vista desde arriba (manzanas).
//  · El trazado se calcula para el ancho real: 1 acto por fila en el teléfono,
//    2 en tableta, 3 en escritorio. Nada se escala: el texto mide lo que dice.
//  · Los nodos son botones HTML (foco, lector de pantalla, 44 px de toque); el
//    SVG sólo dibuja distritos y cables.
// ============================================================================

type Estado = "hecho" | "actual" | "disponible" | "pendiente";

type NodoFlujo = {
  id: string;
  tipo: "mision" | "jefe";
  acto: Acto;
  actoIdx: number;
  /** Posición dentro del acto: 0-2 misiones, después el jefe. */
  slot: number;
  numero: number;
  titulo: string;
  corto: string;
  icono: string;
  href: string;
  estado: Estado;
  mision?: Mision;
  boss?: Boss;
};

const COLOR_ACTO: Record<string, { c: string; txt: string }> = {
  jurisdiccion: { c: "#4BE7FF", txt: "#4BE7FF" },
  emplazamiento: { c: "#7AD4E6", txt: "#7AD4E6" },
  prueba: { c: "#D7B46A", txt: "#E3C27E" },
  sentencia: { c: "#E8E4DA", txt: "#F2F2F0" },
  recursos: { c: "#8A5CFF", txt: "#B39BFF" },
  juicio_ejecutivo: { c: "#FF8A3D", txt: "#FFA76B" },
  examen: { c: "#FF4FCF", txt: "#FF85DC" },
};
export const colorActo = (zona: string) => COLOR_ACTO[zona] ?? COLOR_ACTO.jurisdiccion;

/** Mundo explorable de cada acto. */
const RUTA_ZONA: Record<string, string> = {
  jurisdiccion: "/mundo/jurisdiccion",
  emplazamiento: "/mundo/emplazamiento",
  prueba: "/mundo/prueba",
  sentencia: "/mundo/sentencia",
  recursos: "/mundo/recursos",
  juicio_ejecutivo: "/mundo/juicio_ejecutivo",
};

const TIPO: Record<string, { icono: string; nombre: string }> = {
  investigacion: { icono: "🔍", nombre: "Investigación" },
  arcade: { icono: "🎮", nombre: "Arcade" },
  boss: { icono: "⚔️", nombre: "Simulación oral" },
  npc: { icono: "🧑‍⚖️", nombre: "Mentoría" },
  puzzle: { icono: "🧩", nombre: "Puzzle" },
  dialogo: { icono: "💬", nombre: "Diálogo" },
  examen: { icono: "📋", nombre: "Examen" },
  ejecutivo: { icono: "💼", nombre: "Campaña" },
};

/** «INICIACIÓN PROCESAL» → «Iniciación procesal». */
export function tituloFrase(s: string): string {
  const t = s.toLocaleLowerCase("es");
  return t.charAt(0).toLocaleUpperCase("es") + t.slice(1);
}

/** Etiqueta breve para debajo del nodo. El título completo va en el detalle. */
function corto(titulo: string): string {
  let t = titulo;
  if (t.includes(" — ")) t = t.split(" — ")[0];
  if (t.includes(": ")) t = t.split(": ")[1];
  t = t.replace(/^(El|La|Los|Las)\s+/u, "");
  return t.charAt(0).toLocaleUpperCase("es") + t.slice(1);
}

function construirNodos(misionesCompletadas: string[], logrosIds: string[]): NodoFlujo[] {
  const p = leerProgreso(misionesCompletadas, logrosIds);
  const idxActual = CAMPAÑA.findIndex((a) => a.numero === p.actoActual.numero);
  const nodos: NodoFlujo[] = [];

  CAMPAÑA.forEach((acto, ai) => {
    acto.misiones.forEach((m, k) => {
      const hecho = misionesCompletadas.includes(m.id);
      const estado: Estado = hecho
        ? "hecho"
        : p.misionActual?.id === m.id
          ? "actual"
          : ai <= idxActual ? "disponible" : "pendiente";
      nodos.push({
        id: m.id,
        tipo: "mision",
        acto,
        actoIdx: ai,
        slot: k,
        numero: k + 1,
        titulo: m.titulo,
        corto: corto(m.titulo),
        icono: TIPO[m.tipo]?.icono ?? "📌",
        href: `/mision/${m.id}`,
        estado,
        mision: m,
      });
    });

    const boss = getBoss(acto.bossId) ?? undefined;
    const todas = acto.misiones.every((m) => misionesCompletadas.includes(m.id));
    const estado: Estado = bossVencido(acto.bossId, logrosIds)
      ? "hecho"
      : !p.misionActual && p.actoActual.numero === acto.numero
        ? "actual"
        : todas ? "disponible" : "pendiente";
    nodos.push({
      id: `jefe-${acto.numero}`,
      tipo: "jefe",
      acto,
      actoIdx: ai,
      slot: acto.misiones.length,
      numero: acto.misiones.length + 1,
      titulo: boss?.nombre ?? "Jefe del acto",
      corto: corto(boss?.nombre ?? "Jefe"),
      icono: boss?.icono ?? "⚔️",
      href: `/boss/${acto.bossId}`,
      estado,
      boss,
    });
  });
  return nodos;
}

// ── Trazado ─────────────────────────────────────────────────────────────────
const PAD = 10;
const CABECERA = 30;   // rótulo del distrito
const HUECO = 16;      // espacio para la marca «AQUÍ»
const ETIQUETA = 38;   // dos líneas de 13 px
const CALLE = 22;      // franja entre filas por donde giran los cables

type Pos = { cx: number; top: number; cy: number; w: number; fila: number };
type Geo = {
  ancho: number;
  alto: number;
  nodo: number;
  colW: number;
  filaH: number;
  pos: Map<string, Pos>;
  distritos: { acto: Acto; x: number; y: number; w: number; h: number }[];
};

function calcular(ancho: number, nodos: NodoFlujo[]): Geo {
  // Tres actos por fila desde ~900 px: la campaña entera cabe en el escritorio
  // sin desplazar.
  const actosPorFila = ancho >= 900 ? 3 : ancho >= 640 ? 2 : 1;
  const colW = (ancho - PAD * 2) / (actosPorFila * 4);
  const nodo = Math.round(Math.max(48, Math.min(64, colW * 0.6)));
  const filaH = CABECERA + HUECO + nodo + 8 + ETIQUETA + CALLE;
  const filas = Math.ceil(CAMPAÑA.length / actosPorFila);

  const pos = new Map<string, Pos>();
  for (const n of nodos) {
    const fila = Math.floor(n.actoIdx / actosPorFila);
    const col = (n.actoIdx % actosPorFila) * 4 + n.slot;
    const top = PAD + fila * filaH + CABECERA + HUECO;
    const w = n.tipo === "jefe" ? Math.round(nodo * 1.2) : nodo;
    pos.set(n.id, { cx: PAD + colW * (col + 0.5), top, cy: top + nodo / 2, w, fila });
  }

  const distritos = CAMPAÑA.map((acto, ai) => {
    const fila = Math.floor(ai / actosPorFila);
    const col = (ai % actosPorFila) * 4;
    return {
      acto,
      x: PAD + colW * col + 2,
      y: PAD + fila * filaH,
      w: colW * 4 - 4,
      h: filaH - CALLE,
    };
  });

  // 56 px extra al final: los controles flotantes nunca tapan la última fila.
  return { ancho, alto: PAD * 2 + filas * filaH - CALLE + 56, nodo, colW, filaH, pos, distritos };
}

function trazoCable(a: Pos, b: Pos, geo: Geo): string {
  const x1 = a.cx + a.w / 2 + 1;
  const x2 = b.cx - b.w / 2 - 1;
  if (a.fila === b.fila) return `M ${x1} ${a.cy} L ${x2} ${b.cy}`;
  // Cambio de fila: el cable baja por la calle y vuelve a entrar por la
  // izquierda, con esquinas redondeadas.
  const r = 9;
  const xa = Math.min(x1 + 15, geo.ancho - 3);
  const xb = Math.max(x2 - 15, 3);
  const yg = PAD + (a.fila + 1) * geo.filaH - CALLE / 2;
  return [
    `M ${x1} ${a.cy}`,
    `H ${xa - r}`, `Q ${xa} ${a.cy} ${xa} ${a.cy + r}`,
    `V ${yg - r}`, `Q ${xa} ${yg} ${xa - r} ${yg}`,
    `H ${xb + r}`, `Q ${xb} ${yg} ${xb} ${yg + r}`,
    `V ${b.cy - r}`, `Q ${xb} ${b.cy} ${xb + r} ${b.cy}`,
    `H ${x2}`,
  ].join(" ");
}

function nombreAccesible(n: NodoFlujo): string {
  const donde = n.tipo === "jefe"
    ? `Acto ${n.acto.numero}, jefe`
    : `Acto ${n.acto.numero}, misión ${n.numero} de ${n.acto.misiones.length}`;
  const estado = { hecho: n.tipo === "jefe" ? "Vencido" : "Completada", actual: "Tu siguiente paso", disponible: "Disponible", pendiente: "Más adelante" }[n.estado];
  return `${donde}: ${n.titulo}. ${estado}.`;
}

// ============================================================================

export default function MapaFlujo({
  misionesCompletadas,
  logrosIds,
}: {
  misionesCompletadas: string[];
  logrosIds: string[];
}) {
  const lienzo = useRef<HTMLDivElement>(null);
  const [ancho, setAncho] = useState(0);
  const [vista, setVista] = useState<"mapa" | "lista">("mapa");
  const [sel, setSel] = useState<string | null>(null);

  const nodos = useMemo(() => construirNodos(misionesCompletadas, logrosIds), [misionesCompletadas, logrosIds]);
  const geo = useMemo(() => (ancho > 0 ? calcular(ancho, nodos) : null), [ancho, nodos]);
  const actual = nodos.find((n) => n.estado === "actual") ?? null;

  useEffect(() => {
    if (vista !== "mapa") return;
    const el = lienzo.current;
    if (!el) return;
    const medir = () => setAncho(el.clientWidth);
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, [vista]);

  const centrar = useCallback((suave: boolean) => {
    const el = lienzo.current;
    if (!el || !geo) return;
    const objetivo = actual ?? nodos.find((n) => n.estado !== "hecho") ?? nodos[nodos.length - 1];
    const p = geo.pos.get(objetivo.id);
    if (!p) return;
    el.scrollTo({ top: Math.max(0, p.cy - el.clientHeight * 0.4), behavior: suave ? "smooth" : "auto" });
  }, [geo, actual, nodos]);

  // Al abrir el mapa, la vista arranca en tu posición: no hay que buscarla.
  const centrado = useRef(false);
  useEffect(() => {
    if (vista !== "mapa") { centrado.current = false; return; }
    if (geo && !centrado.current) {
      centrado.current = true;
      centrar(false);
    }
  }, [geo, centrar, vista]);

  const cerrar = useCallback(() => setSel(null), []);
  const seleccionado = nodos.find((n) => n.id === sel) ?? null;

  return (
    <div className="flujo">
      <div className="flujo-controles">
        {vista === "mapa" && (
          <button
            type="button"
            className="flujo-boton"
            onClick={() => { sfx.click?.(); centrar(true); }}
            aria-label="Ir a tu posición en el mapa"
            title="Ir a tu posición"
          >
            <span aria-hidden="true">📍</span>
          </button>
        )}
        <button
          type="button"
          className="flujo-boton"
          aria-pressed={vista === "lista"}
          onClick={() => { sfx.click?.(); setSel(null); setVista(vista === "mapa" ? "lista" : "mapa"); }}
        >
          {vista === "mapa" ? "Lista" : "Mapa"}
        </button>
      </div>

      {vista === "mapa" ? (
        <div ref={lienzo} className="flujo-lienzo" role="group" aria-label="Mapa de la campaña. Cada nodo es una misión o un jefe.">
          {geo && (
            <div className="flujo-mundo" style={{ width: geo.ancho, height: geo.alto }}>
              <svg width={geo.ancho} height={geo.alto} aria-hidden="true" focusable="false">
                <defs>
                  {/* Manzanas vistas desde arriba: el distrito es un barrio. */}
                  <pattern id="flujo-manzanas" width="40" height="40" patternUnits="userSpaceOnUse">
                    <rect x="3" y="3" width="15" height="15" rx="2" fill="#8FA3BF" fillOpacity="0.07" />
                    <rect x="22" y="3" width="15" height="8" rx="2" fill="#8FA3BF" fillOpacity="0.07" />
                    <rect x="22" y="14" width="15" height="4" rx="1" fill="#8FA3BF" fillOpacity="0.05" />
                    <rect x="3" y="22" width="34" height="15" rx="2" fill="#8FA3BF" fillOpacity="0.07" />
                  </pattern>
                </defs>

                {geo.distritos.map((d) => {
                  const col = colorActo(d.acto.zona);
                  return (
                    <g key={d.acto.numero}>
                      <rect x={d.x} y={d.y} width={d.w} height={d.h} rx="14" fill="#0D121B" stroke={col.c} strokeOpacity="0.22" />
                      <rect x={d.x} y={d.y} width={d.w} height={d.h} rx="14" fill="url(#flujo-manzanas)" />
                      <rect x={d.x} y={d.y} width={d.w} height={d.h} rx="14" fill={col.c} fillOpacity="0.035" />
                    </g>
                  );
                })}

                {nodos.slice(1).map((b, i) => {
                  const a = nodos[i];
                  const pa = geo.pos.get(a.id)!;
                  const pb = geo.pos.get(b.id)!;
                  const d = trazoCable(pa, pb, geo);
                  const colB = colorActo(b.acto.zona).c;
                  const tipo = b.estado === "hecho" ? "hecho" : b.estado === "actual" ? "activo" : a.estado === "hecho" ? "listo" : "pendiente";
                  const stroke = { hecho: "#58F5B0", activo: colB, listo: colB, pendiente: "#33405A" }[tipo];
                  return (
                    <g key={b.id}>
                      {/* calzada bajo el cable */}
                      <path d={d} fill="none" stroke="#080B11" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
                      <path
                        d={d}
                        fill="none"
                        stroke={stroke}
                        strokeOpacity={tipo === "listo" ? 0.55 : tipo === "hecho" ? 0.75 : 1}
                        strokeWidth={tipo === "pendiente" ? 2 : 2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={tipo === "activo" ? "flujo-cable-activo" : undefined}
                      />
                    </g>
                  );
                })}
              </svg>

              {geo.distritos.map((d) => {
                const col = colorActo(d.acto.zona);
                const hechas = d.acto.misiones.filter((m) => misionesCompletadas.includes(m.id)).length;
                return (
                  <div
                    key={d.acto.numero}
                    className="flujo-distrito"
                    style={{ left: d.x + 10, top: d.y + 7, width: d.w - 20, "--color-txt": col.txt } as CSSProperties}
                  >
                    <span className="num">Acto {d.acto.numero}</span>
                    <span className="nombre" style={{ minWidth: 0 }}>{tituloFrase(d.acto.titulo)}</span>
                    <span className="cuenta ml-auto">{hechas}/{d.acto.misiones.length}</span>
                  </div>
                );
              })}

              {nodos.map((n) => {
                const p = geo.pos.get(n.id)!;
                const col = colorActo(n.acto.zona);
                return (
                  <button
                    key={n.id}
                    type="button"
                    className="flujo-nodo"
                    data-estado={n.estado}
                    data-tipo={n.tipo}
                    aria-pressed={sel === n.id}
                    aria-label={nombreAccesible(n)}
                    onClick={() => { sfx.click?.(); setSel(sel === n.id ? null : n.id); }}
                    style={{
                      left: p.cx,
                      top: p.top,
                      width: Math.max(geo.colW - 4, p.w + 8),
                      "--nodo": `${geo.nodo}px`,
                      "--color": col.c,
                    } as CSSProperties}
                  >
                    <span className="flujo-caja">
                      {n.estado === "actual" && <span className="flujo-aqui" aria-hidden="true">AQUÍ</span>}
                      <span className="icono" aria-hidden="true">{n.icono}</span>
                      <span className="flujo-puerto entrada" aria-hidden="true" />
                      <span className="flujo-puerto salida" aria-hidden="true" />
                      {n.estado === "hecho" && <span className="flujo-insignia" aria-hidden="true">✓</span>}
                    </span>
                    <span className="flujo-etiqueta" aria-hidden="true">{n.corto}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <ListaCampaña nodos={nodos} misionesCompletadas={misionesCompletadas} />
      )}

      {seleccionado && (
        <Detalle nodo={seleccionado} misionesCompletadas={misionesCompletadas} onCerrar={cerrar} />
      )}
    </div>
  );
}

// ── Detalle del nodo (hoja inferior sólida) ────────────────────────────────
function Detalle({
  nodo,
  misionesCompletadas,
  onCerrar,
}: {
  nodo: NodoFlujo;
  misionesCompletadas: string[];
  onCerrar: () => void;
}) {
  const titulo = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    titulo.current?.focus();
    const tecla = (e: KeyboardEvent) => { if (e.key === "Escape") onCerrar(); };
    document.addEventListener("keydown", tecla);
    return () => document.removeEventListener("keydown", tecla);
  }, [nodo.id, onCerrar]);

  const col = colorActo(nodo.acto.zona);
  const m = nodo.mision;
  const b = nodo.boss;
  const pendientes = nodo.acto.misiones.filter((x) => !misionesCompletadas.includes(x.id)).length;
  const rutaZona = RUTA_ZONA[nodo.acto.zona];

  const cta = nodo.tipo === "jefe"
    ? (nodo.estado === "hecho" ? "⚔ Volver a combatir" : "⚔ Combatir")
    : (nodo.estado === "hecho" ? "↻ Repetir misión" : "▶ Jugar misión");

  return (
    <section className="hoja" role="dialog" aria-modal="false" aria-labelledby="hoja-titulo">
      <div className="hoja-cabecera">
        <span className="fila-icono" style={{ "--acento": col.c } as CSSProperties} aria-hidden="true">{nodo.icono}</span>
        <div className="min-w-0 flex-1">
          <div className="rotulo" style={{ color: col.txt }}>
            Acto {nodo.acto.numero} · {nodo.tipo === "jefe" ? "Jefe del acto" : `Misión ${nodo.numero} de ${nodo.acto.misiones.length}`}
          </div>
          <h2 id="hoja-titulo" ref={titulo} tabIndex={-1} className="text-[18px] font-bold txt-fuerte leading-tight m-0 outline-none">
            {nodo.titulo}
          </h2>
        </div>
        <button type="button" onClick={onCerrar} className="cabecera-boton" aria-label="Cerrar detalle">
          <span aria-hidden="true">✕</span>
        </button>
      </div>

      <div className="hoja-cuerpo space-y-3">
        {m && (
          <>
            <p className="t-cuerpo txt-normal leading-snug m-0">{m.descripcion}</p>
            <div className="flex flex-wrap gap-2">
              <span className="chip">{TIPO[m.tipo]?.nombre ?? m.tipo}</span>
              <span className="chip" aria-label={`Dificultad ${m.dificultad} de 3`}>{"★".repeat(m.dificultad)}{"☆".repeat(3 - m.dificultad)}</span>
              <span className="chip chip-premio">+{m.recompensa.xp} XP · 🪙 {m.recompensa.monedas}</span>
              {m.recompensa.articulo && <span className="chip font-datos">{m.recompensa.articulo}</span>}
            </div>
          </>
        )}
        {b && (
          <>
            <p className="t-meta txt-suave m-0">{b.titulo}</p>
            <p className="t-cuerpo txt-normal leading-snug m-0">{b.descripcion}</p>
            <div className="flex flex-wrap gap-2">
              <span className="chip font-datos">{b.articulo}</span>
              <span className="chip chip-premio">+{b.recompensa.xp} XP · 🪙 {b.recompensa.monedas}</span>
            </div>
            {nodo.estado === "pendiente" && pendientes > 0 && (
              <p className="t-meta txt-suave m-0">
                Te {pendientes === 1 ? "queda 1 misión" : `quedan ${pendientes} misiones`} de este acto. Puedes enfrentarlo igual, pero llegarás con menos preparación.
              </p>
            )}
          </>
        )}
        {nodo.estado === "hecho" && (
          <p className="t-meta m-0" style={{ color: "#58F5B0" }}>
            ✓ {nodo.tipo === "jefe" ? "Vencido." : "Completada. Puedes repetirla para estudiar, sin duplicar la recompensa."}
          </p>
        )}
        {nodo.estado === "actual" && (
          <p className="t-meta m-0" style={{ color: col.txt }}>▶ Es tu siguiente paso en la campaña.</p>
        )}
      </div>

      <div className="hoja-pie">
        {rutaZona && nodo.tipo === "mision" && (
          <Link href={rutaZona} onClick={() => sfx.click?.()} className="btn-secundario">
            Explorar zona
          </Link>
        )}
        <Link
          href={nodo.href}
          onClick={() => sfx.confirm?.()}
          className="btn-primario"
          style={{ "--acento": col.c } as CSSProperties}
        >
          {cta}
        </Link>
      </div>
    </section>
  );
}

// ── Alternativa en lista (accesible y rápida de recorrer) ──────────────────
function ListaCampaña({ nodos, misionesCompletadas }: { nodos: NodoFlujo[]; misionesCompletadas: string[] }) {
  return (
    <div className="flujo-lienzo shell-scroll px-2 pt-3 pb-16 space-y-5" style={{ backgroundImage: "none" }} role="region" aria-label="Lista de misiones de la campaña" tabIndex={0}>
      {CAMPAÑA.map((acto, ai) => {
        const col = colorActo(acto.zona);
        const hechas = acto.misiones.filter((m) => misionesCompletadas.includes(m.id)).length;
        return (
          <section key={acto.numero} aria-labelledby={`lista-acto-${acto.numero}`}>
            <h3 id={`lista-acto-${acto.numero}`} className="flex items-baseline gap-2 mb-2 px-1 m-0">
              <span className="rotulo" style={{ color: col.txt }}>Acto {acto.numero}</span>
              <span className="text-[15px] font-semibold txt-fuerte">{tituloFrase(acto.titulo)}</span>
              <span className="font-datos t-meta txt-suave ml-auto">{hechas}/{acto.misiones.length}</span>
            </h3>
            <ul className="space-y-2 list-none p-0 m-0">
              {nodos.filter((n) => n.actoIdx === ai).map((n) => (
                <li key={n.id}>
                  <Link href={n.href} onClick={() => sfx.click?.()} className="fila" style={{ "--acento": col.c } as CSSProperties}>
                    <span className="fila-icono" aria-hidden="true">{n.icono}</span>
                    <span className="fila-texto">
                      <span className="fila-titulo">{n.titulo}</span>
                      <span className="fila-sub">{n.tipo === "jefe" ? "Jefe del acto" : n.mision?.descripcion}</span>
                    </span>
                    {n.estado === "hecho" ? (
                      <span className="fila-chevron" style={{ color: "#58F5B0" }}>
                        <span aria-hidden="true">✓</span>
                        <span className="sr-only">{n.tipo === "jefe" ? "Vencido" : "Completada"}</span>
                      </span>
                    ) : (
                      <span className="fila-chevron" aria-hidden="true">›</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
