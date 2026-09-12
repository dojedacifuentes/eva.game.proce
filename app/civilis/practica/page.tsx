"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { sfx } from "@/lib/audio";
import { CASOS_CIVIL, getCaso } from "@/data/civilis/casos";
import ClasificadorCivil from "@/components/civilis/ClasificadorCivil";

export default function PracticaPage() {
  const [casoId, setCasoId] = useState<string | null>(null);
  const [vistos, setVistos] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [racha, setRacha] = useState(0);
  const [mejorRacha, setMejorRacha] = useState(0);
  const [acerto, setAcerto] = useState(false);

  const pick = (excl?: string) => {
    const pool = CASOS_CIVIL.filter((c) => c.id !== excl);
    return pool[Math.floor(Math.random() * pool.length)].id;
  };

  useEffect(() => { setCasoId(pick()); }, []);

  const caso = casoId ? getCaso(casoId) : undefined;

  // avanza al siguiente caso, contabilizando el resultado del actual
  const avanzar = () => {
    setVistos((v) => v + 1);
    if (acerto) {
      setAciertos((a) => a + 1);
      setRacha((r) => { const n = r + 1; setMejorRacha((m) => Math.max(m, n)); return n; });
    } else {
      setRacha(0);
    }
    setAcerto(false);
    setCasoId((prev) => pick(prev ?? undefined));
  };

  return (
    <div className="px-3 md:px-6 py-4 max-w-2xl mx-auto pb-16">
      <header className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <Link href="/civilis" className="civ-btn text-xs px-3 py-1.5" onClick={() => sfx.click?.()}>◂ Mapa</Link>
        <div className="flex items-center gap-2 font-mono-terminal text-[11px]">
          <span className="civ-card px-2 py-1">✓ {aciertos}/{vistos}</span>
          <span className="civ-card px-2 py-1">🔥 {racha}</span>
          <span className="civ-card px-2 py-1">★ {mejorRacha}</span>
        </div>
      </header>

      <div className="mb-4">
        <h1 className="civ-heading text-2xl md:text-4xl">Práctica libre</h1>
        <p className="font-serif-juridica opacity-70 text-sm mt-1">Casos al azar de todo el Reino. Sin fin: clasifica y encadena rachas.</p>
      </div>

      {caso ? (
        <ClasificadorCivil key={caso.id} caso={caso} onResuelto={() => setAcerto(true)} onClose={avanzar} />
      ) : (
        <div className="civ-panel p-8 text-center font-mono-terminal text-sm opacity-60">Barajando casos…</div>
      )}

      <div className="text-center mt-4">
        <button onClick={() => { avanzar(); sfx.click?.(); }} className="civ-btn px-4 py-2 text-xs">↻ Saltar caso</button>
      </div>
    </div>
  );
}
