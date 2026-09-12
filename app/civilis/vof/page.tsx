"use client";
import Link from "next/link";
import { sfx } from "@/lib/audio";
import VerdaderoFalso from "@/components/civilis/VerdaderoFalso";

export default function VoFPage() {
  return (
    <div className="px-3 md:px-6 py-4 max-w-2xl mx-auto pb-16">
      <header className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <Link href="/civilis" className="civ-btn text-xs px-3 py-1.5" onClick={() => sfx.click?.()}>◂ Mapa</Link>
        <span className="font-mono-terminal text-[10px] opacity-50 uppercase tracking-widest">Detector de errores</span>
      </header>
      <div className="mb-4">
        <h1 className="civ-heading text-3xl md:text-5xl">Verdadero o Falso</h1>
        <p className="font-serif-juridica opacity-70 text-sm mt-1">Una afirmación puede esconder un error sutil. Detéctalo: el examinador lo hará.</p>
      </div>
      <VerdaderoFalso />
    </div>
  );
}
