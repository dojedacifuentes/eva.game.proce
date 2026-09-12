"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sfx } from "@/lib/audio";
import { useCivilis } from "@/store/useCivilis";
import { CASOS_CIVIL } from "@/data/civilis/casos";
import { construirPool, veredicto, type Profesor } from "@/data/civilis/examen";
import { getRegionCivil } from "@/data/civilis/regiones";
import type { CasoCivil } from "@/types/civilis";
import { useMezclaEstable } from "@/lib/useMezclaEstable";

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed % 2147483647; if (s <= 0) s += 2147483646;
  for (let i = a.length - 1; i > 0; i--) { s = (s * 16807) % 2147483647; const j = Math.floor((s / 2147483647) * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
const hashId = (id: string) => id.split("").reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7);

const PENAL = 18; // compostura perdida por error

export default function ExamenOral({ profesor }: { profesor: Profesor }) {
  const aprobarExamen = useCivilis((s) => s.aprobarExamen);
  const [fase, setFase] = useState<"intro" | "pregunta" | "fin">("intro");
  const [pool, setPool] = useState<CasoCivil[]>([]);
  const [idx, setIdx] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [compostura, setCompostura] = useState(100);
  const [elegida, setElegida] = useState<string | null>(null);
  const [premiado, setPremiado] = useState(false);

  const caso = pool[idx];
  const opciones = useMezclaEstable(caso?.id ?? "", () => (caso ? seededShuffle(caso.categorias, hashId(caso.id)) : []));
  const region = caso ? getRegionCivil(caso.region) : undefined;

  const comenzar = () => {
    setPool(construirPool(profesor, CASOS_CIVIL));
    setFase("pregunta");
    sfx.confirm?.();
  };

  const elegir = (id: string) => {
    if (elegida) return;
    setElegida(id);
    const ok = id === caso.correcta;
    if (ok) { setAciertos((a) => a + 1); sfx.confirm?.(); }
    else { setCompostura((c) => Math.max(0, c - PENAL)); sfx.warning?.(); }
  };

  const siguiente = () => {
    const colapso = compostura <= 0;
    if (idx + 1 >= pool.length || colapso) {
      // premiar si aprueba
      const v = veredicto(aciertos, pool.length);
      if (v.aprobado && !premiado && !colapso) {
        aprobarExamen(profesor.id, { xp: 80, oro: 60 });
        setPremiado(true);
        setTimeout(() => sfx.powerUp?.(), 250);
      }
      setFase("fin");
      return;
    }
    setIdx((i) => i + 1);
    setElegida(null);
    sfx.click?.();
  };

  // ── INTRO ──
  if (fase === "intro") {
    return (
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="civ-panel p-5 md:p-7 max-w-2xl mx-auto text-center" style={{ ["--civ-primary" as any]: profesor.color }}>
        <div className="text-6xl mb-3 civ-float inline-block" style={{ filter: `drop-shadow(0 0 14px ${profesor.color})` }}>{profesor.icono}</div>
        <div className="civ-tag">Examen de grado · Civil</div>
        <h1 className="civ-heading text-3xl mt-1" style={{ color: profesor.color }}>{profesor.nombre}</h1>
        <div className="font-mono-terminal text-[11px] opacity-60 mb-3">{profesor.titulo}</div>
        <p className="font-serif-juridica text-[15px] italic opacity-90 max-w-lg mx-auto">«{profesor.intro}»</p>
        <p className="font-mono-terminal text-[10px] opacity-50 mt-3">{profesor.estilo}</p>
        <p className="font-mono-terminal text-[10px] opacity-50 mt-1">{profesor.nPreguntas} preguntas · si pierdes la compostura, colapsas.</p>
        <div className="flex gap-3 justify-center mt-5">
          <Link href="/civilis/examen" className="civ-btn px-4 py-2 text-sm" onClick={() => sfx.click?.()}>◂ Otra comisión</Link>
          <button onClick={comenzar} className="civ-btn px-6 py-2.5 text-sm" style={{ color: profesor.color, borderColor: profesor.color }}>Comenzar examen ▸</button>
        </div>
      </motion.div>
    );
  }

  // ── FIN ──
  if (fase === "fin") {
    const v = veredicto(aciertos, pool.length);
    const colapso = compostura <= 0;
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="civ-panel p-6 md:p-8 max-w-2xl mx-auto text-center" style={{ ["--civ-primary" as any]: v.color }}>
        <div className="text-6xl mb-3">{colapso ? "💥" : v.aprobado ? "🎓" : "📉"}</div>
        <div className="civ-tag">Veredicto de la comisión</div>
        <h1 className="civ-heading text-2xl md:text-4xl mt-1" style={{ color: v.color }}>{colapso ? "Colapsaste bajo presión" : v.titulo}</h1>
        <p className="font-serif-juridica italic opacity-85 mt-2">{colapso ? "El profesor te quebró antes del final." : v.nota}</p>
        <div className="civ-card inline-flex items-center gap-4 px-5 py-3 mt-4 font-mono-terminal text-sm">
          <span>Aciertos: <b style={{ color: v.color }}>{aciertos}/{pool.length}</b></span>
          <span>Compostura: <b>{compostura}</b></span>
        </div>
        {v.aprobado && !colapso && <div className="font-mono-terminal text-[12px] civ-accent mt-3">+80 XP · 🪙 60 · Título: {v.nota}</div>}
        <div className="flex gap-3 justify-center mt-5">
          <Link href="/civilis" className="civ-btn px-4 py-2 text-sm" onClick={() => sfx.click?.()}>◂ Mapa</Link>
          <Link href="/civilis/examen" className="civ-btn px-5 py-2.5 text-sm" onClick={() => sfx.click?.()}>Rendir de nuevo ▸</Link>
        </div>
      </motion.div>
    );
  }

  // ── PREGUNTA ──
  const revelado = elegida !== null;
  const acerto = elegida === caso.correcta;
  return (
    <div className="max-w-2xl mx-auto" data-civ={caso.region}>
      {/* HUD del examen */}
      <div className="civ-panel p-3 mb-3" style={{ ["--civ-primary" as any]: profesor.color }}>
        <div className="flex items-center gap-3">
          <span className="text-2xl shrink-0" style={{ filter: `drop-shadow(0 0 8px ${profesor.color})` }}>{profesor.icono}</span>
          <div className="min-w-0 flex-1">
            <div className="civ-tag" style={{ color: profesor.color }}>{profesor.nombre} · pregunta {idx + 1}/{pool.length}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono-terminal text-[9px] opacity-60">Compostura</span>
              <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${compostura}%`, background: compostura > 40 ? "#5fb37a" : "#c65b6e" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* tarjeta del caso (palette de la región actual → Cabello salta de color) */}
      <motion.div key={caso.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="civ-panel p-4 md:p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{region?.icono}</span>
          <span className="civ-tag">{region?.nombre}</span>
        </div>
        <div className="civ-card p-3 mb-3">
          <p className="font-serif-juridica text-[15px] leading-relaxed">{caso.enunciado}</p>
        </div>
        <div className="civ-tag mb-2">{caso.pregunta}</div>
        <div className="space-y-2">
          {opciones.map((cat) => {
            let st: string | undefined;
            if (revelado) st = cat.id === caso.correcta ? "ok" : cat.id === elegida ? "bad" : "dim";
            return (
              <button key={cat.id} onClick={() => elegir(cat.id)} onMouseEnter={() => !revelado && sfx.hover?.()} disabled={revelado} data-state={st}
                className="civ-opt w-full px-3 py-2.5 font-serif-juridica text-[14px]">
                {cat.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {revelado && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
              <div className="civ-card p-3" style={{ borderColor: acerto ? "#5fb37a66" : "#c65b6e66" }}>
                <div className="civ-tag mb-1" style={{ color: acerto ? "#7ed79a" : "#f09aa8" }}>{acerto ? "✦ Correcto" : "✗ Incorrecto"} · {caso.articulo}</div>
                <p className="font-serif-juridica text-[13px] leading-relaxed opacity-90">{caso.explicacion}</p>
              </div>
              <p className="font-serif-juridica text-[13px] italic opacity-75 mt-2">«{profesor.saltos[idx % profesor.saltos.length]}»</p>
              <button onClick={siguiente} className="civ-btn w-full py-2.5 text-sm mt-2" style={{ color: profesor.color, borderColor: profesor.color }}>
                {idx + 1 >= pool.length || compostura <= 0 ? "Ver veredicto ▸" : "Siguiente pregunta ▸"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
