"use client";
import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sfx } from "@/lib/audio";
import { getBoss } from "@/data/reinos/bosses";
import { getRegion } from "@/data/reinos/regiones";
import BossBattle from "@/components/reinos/BossBattle";

// ============================================================================
// REINOS — Página de Boss (deep-link autónomo a un duelo)
// ============================================================================

export default function BossPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const router = useRouter();
  const boss = getBoss(params.id);
  const region = boss ? getRegion(boss.region) : undefined;

  if (!boss || !region) {
    return (
      <div className="min-h-screen px-6 py-20 max-w-3xl mx-auto text-center">
        <div className="text-5xl mb-4">⚔</div>
        <h1 className="font-display-grave text-2xl text-doc-aged mb-3">Jefe no encontrado</h1>
        <Link href="/reinos" className="btn text-xs">◂ Volver al overworld</Link>
      </div>
    );
  }

  return (
    <div data-reino={region.id} style={{ background: `radial-gradient(1100px 600px at 50% -10%, ${region.paleta.ambient}, transparent 60%)` }}>
      <div className="min-h-screen px-4 md:px-8 py-6 max-w-3xl mx-auto">
        <header className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <Link href={`/reinos/${region.id}`} className="btn text-xs" onClick={() => sfx.click?.()}>◂ {region.nombre}</Link>
          <span className="font-mono-terminal text-[9px] text-doc-aged/40 uppercase tracking-widest">DUELO DE JEFE</span>
        </header>
        <BossBattle boss={boss} onClose={() => { sfx.click?.(); router.push(`/reinos/${region.id}`); }} />
      </div>
    </div>
  );
}
