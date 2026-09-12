"use client";
import Link from "next/link";
import { useEffect, useState, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sfx } from "@/lib/audio";
import { useCivilis } from "@/store/useCivilis";
import { getRegionCivil } from "@/data/civilis/regiones";
import { casosPorRegion, getCaso } from "@/data/civilis/casos";
import { getBossDeRegion } from "@/data/civilis/bosses";
import { codexPorRegion } from "@/data/civilis/codex";
import ClasificadorCivil from "@/components/civilis/ClasificadorCivil";
import CivScenery from "@/components/civilis/CivScenery";

export default function RegionCivilPage(props: { params: Promise<{ region: string }> }) {
  const params = use(props.params);
  const region = getRegionCivil(params.region);
  const completarRegion = useCivilis((s) => s.completarRegion);
  const derrotarBoss = useCivilis((s) => s.derrotarBoss);
  const resueltos = useCivilis((s) => s.casosResueltos);
  const bossesDerrotados = useCivilis((s) => s.bossesDerrotados);
  const [mounted, setMounted] = useState(false);
  const [activo, setActivo] = useState<string | null>(null);
  useEffect(() => setMounted(true), []);

  if (!region) {
    return (
      <div className="px-6 py-20 max-w-3xl mx-auto text-center">
        <div className="text-5xl mb-4">🧭</div>
        <h1 className="civ-heading text-2xl mb-3">Región desconocida</h1>
        <Link href="/civilis" className="civ-btn px-4 py-2 text-sm">◂ Volver al mapa</Link>
      </div>
    );
  }

  const casos = casosPorRegion(region.id);
  const boss = getBossDeRegion(region.id);
  const codex = codexPorRegion(region.id);
  const hechos = mounted ? casos.filter((c) => resueltos.includes(c.id)).length : 0;
  const bossVencido = mounted && boss ? bossesDerrotados.includes(boss.id) : false;
  const casoActivo = activo ? getCaso(activo) : undefined;

  const onResuelto = () => {
    if (casos.length === 0) return;
    const st = useCivilis.getState();
    const todos = casos.every((c) => st.casosResueltos.includes(c.id));
    if (todos) {
      completarRegion(region.id);
      if (boss && !st.bossesDerrotados.includes(boss.id)) {
        derrotarBoss(boss.id, { oro: boss.recompensaOro, cartaId: boss.recompensaArticuloId });
        setTimeout(() => sfx.powerUp?.(), 250);
      }
    }
  };

  return (
    <div className="px-3 md:px-6 py-4 max-w-4xl mx-auto pb-16" data-civ={region.id}>
      <header className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <Link href="/civilis" className="civ-btn text-xs px-3 py-1.5" onClick={() => sfx.click?.()}>◂ Mapa</Link>
        <Link href="/civilis/codex" className="civ-btn text-xs px-3 py-1.5" onClick={() => sfx.click?.()}>📚 Codex</Link>
      </header>

      {/* intro de región */}
      <section className="civ-panel p-4 md:p-5 mb-4 relative overflow-hidden">
        <CivScenery region={region.id} color={region.paleta.primary} />
        <div className="relative z-[1] flex items-start gap-4">
          <motion.div className="text-5xl shrink-0 civ-float" style={{ filter: "drop-shadow(0 0 12px var(--civ-primary))" }}>{region.icono}</motion.div>
          <div className="min-w-0">
            <div className="civ-tag">{region.subtitulo}</div>
            <h1 className="civ-heading text-2xl md:text-4xl leading-tight">{region.nombre}</h1>
            <p className="font-serif-juridica opacity-75 text-sm mt-1 italic">{region.lore}</p>
          </div>
        </div>
        {/* progreso + jefe */}
        {boss && (
          <div className="civ-card p-3 mt-4 flex items-center gap-3 relative z-[1]">
            <span className="text-3xl shrink-0" style={{ filter: `drop-shadow(0 0 8px ${boss.color})` }}>{boss.icono}</span>
            <div className="min-w-0 flex-1">
              <div className="civ-tag" style={{ color: boss.color }}>{bossVencido ? "Jefe vencido ✓" : "Jefe de región"}</div>
              <div className="civ-heading text-base leading-tight">{boss.nombre}</div>
              <div className="font-mono-terminal text-[10px] opacity-55">{boss.titulo}</div>
            </div>
            {casos.length > 0 && (
              <div className="text-right shrink-0">
                <div className="font-mono-terminal text-[10px] opacity-60">{hechos}/{casos.length}</div>
                <div className="w-20 h-1.5 bg-black/40 rounded-full overflow-hidden mt-1">
                  <div className="h-full rounded-full" style={{ width: `${casos.length ? (hechos / casos.length) * 100 : 0}%`, background: boss.color }} />
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* clasificador activo o lista de encuentros */}
      <AnimatePresence mode="wait">
        {casoActivo ? (
          <ClasificadorCivil key={casoActivo.id} caso={casoActivo} onResuelto={onResuelto} onClose={() => { setActivo(null); sfx.click?.(); }} />
        ) : casos.length === 0 ? (
          <div className="civ-panel p-6 text-center">
            <div className="text-4xl mb-2">🚧</div>
            <div className="civ-heading text-lg">Casos en preparación</div>
            <p className="font-serif-juridica opacity-65 text-sm mt-1">Esta región se está construyendo. Su contenido jurídico llega en una próxima actualización.</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            <div className="civ-tag mb-1">Encuentros — clasifica para vencer</div>
            {casos.map((c) => {
              const ok = mounted && resueltos.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => { setActivo(c.id); sfx.click?.(); }}
                  onMouseEnter={() => sfx.hover?.()}
                  className="civ-card w-full p-3 flex items-center gap-3 text-left transition-transform hover:-translate-y-0.5"
                  style={ok ? { borderColor: "#5fb37a66" } : undefined}
                >
                  <span className="text-2xl shrink-0" style={{ filter: "drop-shadow(0 0 6px var(--civ-primary))" }}>{c.iconoEnemigo}</span>
                  <div className="min-w-0 flex-1">
                    <div className="civ-heading text-sm leading-tight">{c.enemigo}</div>
                    <div className="font-mono-terminal text-[10px] opacity-55">Dif. {c.dificultad} · +{c.recompensa.xp} XP</div>
                  </div>
                  {ok ? <span className="text-zona-cautelares text-sm shrink-0" style={{ color: "#5fb37a" }}>✓</span>
                      : <span className="civ-btn px-3 py-1 text-[11px] shrink-0">Enfrentar</span>}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* codex de la región */}
      {codex.length > 0 && (
        <div className="mt-5">
          <div className="civ-tag mb-2">Codex de la región</div>
          <div className="flex flex-wrap gap-2">
            {codex.map((e) => {
              const desbloq = mounted && useCivilis.getState().codexDesbloqueado.includes(e.id);
              return (
                <Link key={e.id} href="/civilis/codex" className="civ-card px-2.5 py-1.5 flex items-center gap-1.5" style={{ opacity: desbloq ? 1 : 0.4 }}>
                  <span className="text-base">{desbloq ? e.icono : "🔒"}</span>
                  <span className="font-mono-terminal text-[10px]">{desbloq ? e.institucion : "???"}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
