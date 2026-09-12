"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sfx, startAmbientReino, stopAmbient } from "@/lib/audio";
import { getRegion } from "@/data/reinos/regiones";
import { desafiosPorRegion, TIPO_DESAFIO_META } from "@/data/reinos/desafios";
import { getBoss } from "@/data/reinos/bosses";
import { articulosPorRegion, getArticulo, RAREZA_META } from "@/data/reinos/articulos";
import { useReinos } from "@/store/useReinos";
import DesafioEngine from "@/components/reinos/DesafioEngine";
import BossBattle from "@/components/reinos/BossBattle";
import RegionScenery from "@/components/reinos/RegionScenery";
import ReinoSprite from "@/components/reinos/ReinoSprite";
import { rangoDe } from "@/data/reinos/rangos";

const VIDAS_INICIALES = 3;

type Encuentro = { tipo: "desafio"; id: string } | { tipo: "boss" } | null;

export default function RegionPage(props: { params: Promise<{ region: string }> }) {
  const params = use(props.params);
  const region = getRegion(params.region);

  const resolverDesafio = useReinos((s) => s.resolverDesafio);
  const desafiosResueltos = useReinos((s) => s.desafiosResueltos);
  const bossesDerrotados = useReinos((s) => s.bossesDerrotados);
  const xp = useReinos((s) => s.xp);

  const [mounted, setMounted] = useState(false);
  const [vidas, setVidas] = useState(VIDAS_INICIALES);
  const [encuentro, setEncuentro] = useState<Encuentro>(null);
  const [derrota, setDerrota] = useState(false);
  const [ambiente, setAmbiente] = useState(false);
  const [racha, setRacha] = useState(0);
  const [nivelToast, setNivelToast] = useState<number | null>(null);
  const [articuloToast, setArticuloToast] = useState<string | null>(null);
  const prevNivel = useRef<number | null>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => () => stopAmbient(), []);
  // baseline de nivel tras hidratación (evita un toast falso al cargar)
  useEffect(() => {
    const t = setTimeout(() => { prevNivel.current = rangoDe(useReinos.getState().xp).nivel; }, 350);
    return () => clearTimeout(t);
  }, []);
  // detecta subida de nivel
  useEffect(() => {
    if (prevNivel.current === null) return;
    const n = rangoDe(xp).nivel;
    if (n > prevNivel.current) {
      prevNivel.current = n;
      setNivelToast(n);
      sfx.powerUp?.();
      const tt = setTimeout(() => setNivelToast(null), 3500);
      return () => clearTimeout(tt);
    }
    prevNivel.current = n;
  }, [xp]);

  const desafios = useMemo(() => (region ? desafiosPorRegion(region.id) : []), [region]);
  const boss = region ? getBoss(region.bossId) : undefined;
  const arts = region ? articulosPorRegion(region.id) : [];

  if (!region) {
    return (
      <div className="min-h-screen px-6 py-20 max-w-3xl mx-auto text-center">
        <div className="text-5xl mb-4">🧭</div>
        <h1 className="font-display-grave text-2xl text-doc-aged mb-3">Región desconocida</h1>
        <Link href="/reinos" className="btn text-xs">◂ Volver al overworld</Link>
      </div>
    );
  }

  const resueltosRegion = desafios.filter((d) => mounted && desafiosResueltos.includes(d.id)).length;
  const todosResueltos = mounted && desafios.every((d) => desafiosResueltos.includes(d.id));
  const bossVencido = mounted && boss ? bossesDerrotados.includes(boss.id) : false;

  const toggleAmbiente = () => {
    if (ambiente) { stopAmbient(); setAmbiente(false); }
    else { startAmbientReino(region.id); setAmbiente(true); }
    sfx.click?.();
  };

  const perderVida = () => {
    setVidas((v) => {
      const nv = v - 1;
      if (nv <= 0) setTimeout(() => setDerrota(true), 400);
      return Math.max(0, nv);
    });
  };

  const reagrupar = () => { setVidas(VIDAS_INICIALES); setDerrota(false); setEncuentro(null); sfx.confirm?.(); };

  // ── ENCUENTRO ACTIVO ──────────────────────────────────────────────────────
  const renderEncuentro = () => {
    if (!encuentro) return null;
    if (encuentro.tipo === "boss" && boss) {
      return <BossBattle boss={boss} onClose={() => { setEncuentro(null); sfx.click?.(); }} />;
    }
    if (encuentro.tipo === "desafio") {
      const d = desafios.find((x) => x.id === encuentro.id);
      if (!d) return null;
      return (
        <DesafioEngine
          desafio={d}
          yaResuelto={mounted && desafiosResueltos.includes(d.id)}
          onCorrect={() => {
            const nueva = racha + 1;
            setRacha(nueva);
            if (nueva >= 3) sfx.combo?.(nueva);
            const bonus = nueva >= 3 ? (nueva - 2) * 5 : 0; // +5 cristales por acierto encadenado (desde el 3º)
            const artId = d.recompensa.articuloId;
            const esArticuloNuevo = !!artId && !useReinos.getState().articulosDesbloqueados.includes(artId);
            resolverDesafio(d.id, { ...d.recompensa, cristales: d.recompensa.cristales + bonus });
            if (esArticuloNuevo && artId) {
              setArticuloToast(artId);
              setTimeout(() => sfx.unlock?.(), 220);
              setTimeout(() => setArticuloToast(null), 4200);
            }
          }}
          onWrong={() => { setRacha(0); perderVida(); }}
          onClose={() => { setEncuentro(null); sfx.click?.(); }}
        />
      );
    }
    return null;
  };

  return (
    <div data-reino={region.id} style={{ background: `radial-gradient(1100px 600px at 50% -10%, ${region.paleta.ambient}, transparent 60%)` }}>
      <div className="min-h-screen px-4 md:px-8 py-6 max-w-5xl mx-auto">
        {/* Header de región */}
        <header className="flex items-start justify-between flex-wrap gap-3 mb-5">
          <div className="flex items-center gap-3">
            <Link href="/reinos" className="btn text-xs" onClick={() => sfx.click?.()}>◂ Overworld</Link>
            <button onClick={toggleAmbiente} className="btn text-[10px] px-3 py-1.5" title="Música temática de la región">
              {ambiente ? "♪ Ambiente ON" : "♪ Ambiente"}
            </button>
          </div>
          {/* Vidas + racha */}
          <div className="flex items-center gap-2">
            {racha >= 2 && (
              <span key={racha} className="reino-combo-pop reino-chip font-mono-terminal text-[10px] px-2 py-0.5">🔥 Racha ×{racha}</span>
            )}
            <span className="font-mono-terminal text-[9px] uppercase tracking-widest text-doc-aged/40">Vida</span>
            <div className="flex gap-1">
              {Array.from({ length: VIDAS_INICIALES }).map((_, i) => (
                <span key={i} className={`text-lg ${i < vidas ? "" : "grayscale opacity-30"} ${i < vidas && vidas === 1 ? "reino-flash-red rounded-full" : ""}`}>
                  {i < vidas ? "❤️" : "🖤"}
                </span>
              ))}
            </div>
          </div>
        </header>

        {/* Título de región — sobre el escenario decorado del mundo */}
        <div className="relative overflow-hidden rounded-xl mb-6 -mx-1 px-4 pt-5 pb-5 border border-doc-aged/10">
          <RegionScenery region={region.id} />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-4xl inline-block reino-bob">{region.icono}</span>
              <div>
                <div className="font-mono-terminal text-[10px] uppercase tracking-[.25em] reino-fg">
                  Región {region.orden} · {region.materia}
                </div>
                <h1 className="font-display-grave text-3xl md:text-4xl text-doc-aged leading-none" style={{ textShadow: "0 2px 10px rgba(0,0,0,.75)" }}>{region.nombre}</h1>
              </div>
            </div>
            <p className="reino-explain text-doc-aged/80 text-sm md:text-[15px] max-w-2xl leading-relaxed mt-2" style={{ textShadow: "0 1px 6px rgba(0,0,0,.85)" }}>{region.descripcion}</p>
            <div className="font-mono-terminal text-[9px] text-doc-aged/50 mt-2 uppercase tracking-wider">
              Estética: {region.estetica}
            </div>
          </div>
        </div>

        {/* Progreso de la región */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-1.5 bg-bg-steel rounded-full overflow-hidden">
            <div className="h-full reino-bar rounded-full transition-all duration-500" style={{ width: `${desafios.length ? (resueltosRegion / desafios.length) * 100 : 0}%` }} />
          </div>
          <span className="font-mono-terminal text-[10px] reino-fg">{resueltosRegion}/{desafios.length} desafíos</span>
          {bossVencido && <span className="font-mono-terminal text-[10px]" style={{ color: "var(--zona-cautelares)" }}>👑 conquistada</span>}
        </div>

        {/* Encuentro o lista */}
        <AnimatePresence mode="wait">
          {encuentro ? (
            <motion.div key="enc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {renderEncuentro()}
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Enemigos / desafíos */}
              <div className="font-mono-terminal text-[9px] uppercase tracking-widest text-doc-aged/40 mb-3">
                ENEMIGOS DE LA REGIÓN
              </div>
              <div className="grid sm:grid-cols-2 gap-3 mb-8">
                {desafios.map((d) => {
                  const done = mounted && desafiosResueltos.includes(d.id);
                  const meta = TIPO_DESAFIO_META[d.tipo];
                  return (
                    <button
                      key={d.id}
                      onClick={() => { sfx.confirm?.(); setEncuentro({ tipo: "desafio", id: d.id }); }}
                      onMouseEnter={() => sfx.hover?.()}
                      className="reino-card p-4 text-left relative"
                    >
                      {done && <span className="absolute top-2 right-2 text-[9px] font-mono-terminal" style={{ color: "var(--zona-cautelares)" }}>✓ vencido</span>}
                      <div className="flex items-center gap-3">
                        <span className="text-3xl shrink-0">{d.iconoEnemigo}</span>
                        <div className="min-w-0 flex-1">
                          <div className="font-display-grave text-base text-doc-aged leading-tight">{d.enemigo}</div>
                          <div className="font-mono-terminal text-[9px] uppercase tracking-wider reino-fg mt-0.5">
                            {meta.icono} {meta.label} · <span style={{ color: "var(--reino-secondary)" }}>{"★".repeat(d.dificultad)}</span>
                          </div>
                          <div className="font-mono-terminal text-[8px] text-doc-aged/45 mt-0.5 truncate">{meta.verbo}</div>
                        </div>
                        <span className="font-mono-terminal text-[9px] shrink-0" style={{ color: done ? "var(--zona-cautelares)" : "var(--reino-primary)" }}>{done ? "↻" : "▸"}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Jefe de región */}
              <div className="font-mono-terminal text-[9px] uppercase tracking-widest text-doc-aged/40 mb-3">JEFE DE LA REGIÓN</div>
              {boss && (
                <button
                  onClick={() => {
                    if (!todosResueltos) { sfx.warning?.(); return; }
                    sfx.confirm?.(); setEncuentro({ tipo: "boss" });
                  }}
                  onMouseEnter={() => todosResueltos && sfx.hover?.()}
                  disabled={!todosResueltos}
                  className="reino-card w-full p-5 text-left relative overflow-hidden"
                  style={{ opacity: todosResueltos ? 1 : 0.55, cursor: todosResueltos ? "pointer" : "not-allowed" }}
                >
                  <div className="flex items-center gap-4">
                    <span className="shrink-0">
                      {todosResueltos ? (
                        <span className="reino-float inline-block"><ReinoSprite bossId={boss.id} size={58} /></span>
                      ) : (
                        <span className="text-5xl grayscale inline-block">🔒</span>
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono-terminal text-[9px] uppercase tracking-widest reino-fg">⚔ {boss.arquetipo}</div>
                      <div className="font-display-grave text-xl md:text-2xl text-doc-aged">{boss.nombre}</div>
                      <div className="reino-explain text-doc-aged/70 text-[13px] mt-1">{boss.problemaJuridico}</div>
                    </div>
                    {bossVencido ? (
                      <span className="font-mono-terminal text-[9px] shrink-0" style={{ color: "var(--zona-cautelares)" }}>👑 DERROTADO</span>
                    ) : (
                      <span className="font-mono-terminal text-[9px] reino-fg shrink-0">
                        {todosResueltos ? "ENTRAR ▸" : `Supera ${desafios.length} desafíos`}
                      </span>
                    )}
                  </div>
                </button>
              )}

              {/* Artículos de la región */}
              <div className="mt-8">
                <div className="font-mono-terminal text-[9px] uppercase tracking-widest text-doc-aged/40 mb-2">
                  ARTÍCULOS DE ESTA REGIÓN · <Link href="/reinos/biblioteca" className="reino-fg underline">ver biblioteca</Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  {arts.map((a) => (
                    <span key={a.id} className="reino-chip font-mono-terminal text-[10px] px-2 py-1">{a.icono} {a.etiqueta}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toast: subiste de nivel */}
      <AnimatePresence>
        {nivelToast !== null && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed left-1/2 -translate-x-1/2 bottom-6 z-50 px-5 py-3 text-center reino-card"
            style={{ borderColor: "rgba(236,201,75,.55)", boxShadow: "0 0 30px rgba(236,201,75,.25)" }}
          >
            <div className="text-2xl mb-0.5 reino-crown-glow inline-block">⬆️</div>
            <div className="font-mono-terminal text-[9px] uppercase tracking-[.3em]" style={{ color: "#ecc94b" }}>¡Subiste de nivel!</div>
            <div className="font-display-grave text-lg text-doc-aged">Nivel {nivelToast} · {rangoDe(xp).titulo}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast: ¡artículo legendario obtenido! (premio de colección) */}
      <AnimatePresence>
        {articuloToast && (() => {
          const art = getArticulo(articuloToast);
          if (!art) return null;
          const rar = RAREZA_META[art.rareza];
          return (
            <motion.div
              initial={{ opacity: 0, y: 34, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 22 }}
              transition={{ type: "spring", stiffness: 140, damping: 15 }}
              className="fixed left-1/2 -translate-x-1/2 bottom-24 z-50 px-5 py-3 reino-card flex items-center gap-3 max-w-[20rem]"
              data-reino={art.region}
              style={{ borderColor: `${rar.color}88`, boxShadow: `0 0 32px ${rar.color}40` }}
            >
              <span className="text-3xl shrink-0" style={{ filter: `drop-shadow(0 0 8px ${rar.color}aa)` }}>{art.icono}</span>
              <div className="min-w-0">
                <div className="font-mono-terminal text-[9px] uppercase tracking-[.25em]" style={{ color: rar.color }}>✦ {rar.label} obtenido</div>
                <div className="font-display-grave text-base text-doc-aged leading-tight truncate">{art.etiqueta}</div>
                <div className="font-serif-juridica text-doc-aged/55 text-[11px] italic truncate">{art.titulo}</div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Overlay de derrota (sin vidas) */}
      <AnimatePresence>
        {derrota && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: "rgba(6,7,11,0.85)", backdropFilter: "blur(3px)" }}
          >
            <motion.div initial={{ scale: 0.9, y: 10 }} animate={{ scale: 1, y: 0 }} className="reino-card p-6 md:p-8 max-w-md text-center">
              <div className="text-5xl mb-3">💔</div>
              <h2 className="font-display-grave text-2xl text-doc-aged mb-2">Te retiras a curar heridas</h2>
              <p className="font-serif-juridica text-doc-aged/60 text-sm mb-5">
                Perdiste toda tu vida en {region.nombre}. No pierdes progreso: los desafíos ya superados quedan guardados.
                Reagrúpate y vuelve al ataque.
              </p>
              <button onClick={reagrupar} className="btn btn-cautelar text-sm px-6 py-3">↻ Reagruparse (vida completa)</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
