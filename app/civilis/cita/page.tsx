"use client";
import Link from "next/link";
import { sfx } from "@/lib/audio";
import CompletaCita from "@/components/civilis/CompletaCita";

export default function CitaPage() {
  return (
    <div className="px-3 md:px-6 py-4 max-w-2xl mx-auto pb-16">
      <header className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <Link href="/civilis" className="civ-btn text-xs px-3 py-1.5" onClick={() => sfx.click?.()}>◂ Mapa</Link>
        <span className="font-mono-terminal text-[10px] opacity-50 uppercase tracking-widest">Recuerdo activo del número</span>
      </header>
      <div className="mb-4">
        <h1 className="civ-heading text-3xl md:text-5xl">Completa la cita</h1>
        <p className="font-serif-juridica opacity-70 text-sm mt-1">Cada institución tiene su número. Recuérdalo: en el grado, citar el artículo correcto vale oro.</p>
      </div>
      <CompletaCita />
    </div>
  );
}
