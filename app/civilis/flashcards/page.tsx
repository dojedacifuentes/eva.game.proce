"use client";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { sfx } from "@/lib/audio";
import { DECKS, construirDeck, type DeckId } from "@/data/civilis/flashcards";
import Flashcards from "@/components/civilis/Flashcards";

export default function FlashcardsPage() {
  const [sel, setSel] = useState<DeckId | null>(null);
  const deck = DECKS.find((d) => d.id === sel);

  if (deck) {
    return (
      <div className="px-3 md:px-6 py-6 pb-16">
        <div className="max-w-xl mx-auto mb-3">
          <Link href="/civilis/flashcards" onClick={() => { setSel(null); sfx.click?.(); }} className="civ-btn text-xs px-3 py-1.5">◂ Mazos</Link>
        </div>
        <Flashcards key={deck.id} deck={deck.id} nombre={deck.nombre} icono={deck.icono} />
      </div>
    );
  }

  return (
    <div className="px-3 md:px-6 py-4 max-w-4xl mx-auto pb-16">
      <header className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <Link href="/civilis" className="civ-btn text-xs px-3 py-1.5" onClick={() => sfx.click?.()}>◂ Mapa</Link>
        <span className="font-mono-terminal text-[10px] opacity-50 uppercase tracking-widest">Sala de Estudio</span>
      </header>

      <div className="mb-5">
        <h1 className="civ-heading text-3xl md:text-5xl">Flashcards</h1>
        <p className="font-serif-juridica opacity-70 text-sm mt-1 max-w-2xl">
          Memoriza para el grado. Elige un mazo, lee la carta, intenta responder de memoria y autoevalúate.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {DECKS.map((d) => {
          const n = construirDeck(d.id).length;
          return (
            <motion.button key={d.id} onClick={() => { setSel(d.id); sfx.confirm?.(); }} onMouseEnter={() => sfx.hover?.()} whileHover={{ y: -4 }} className="civ-panel p-5 text-center">
              <div className="text-5xl mb-2 civ-float inline-block">{d.icono}</div>
              <div className="civ-heading text-lg">{d.nombre}</div>
              <p className="font-serif-juridica text-[12.5px] opacity-75 leading-snug mt-1">{d.desc}</p>
              <div className="font-mono-terminal text-[10px] opacity-50 mt-2">{n} cartas</div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
