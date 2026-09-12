"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { sfx } from "@/lib/audio";
import { useReinos } from "@/store/useReinos";
import { useModalAccesible } from "@/lib/useModalAccesible";

// ============================================================================
// REINOS — Editor de perfil del jurista (nombre + avatar). Personalización.
// El montaje lo controla el padre ({mostrar && <PerfilJurista/>}) para no dejar
// overlays fantasma; aquí solo animamos la entrada.
// ============================================================================

export const AVATARES = ["🧑‍⚖️", "👩‍⚖️", "⚖️", "🦉", "📜", "🎓", "🗡️", "🛡️", "👑", "🐉", "🔮", "🦅"];

/** Nombre accesible de cada avatar: un emoji no da nombre a un botón. */
export const NOMBRE_AVATAR: Record<string, string> = {
  "🧑‍⚖️": "Juez", "👩‍⚖️": "Jueza", "⚖️": "Balanza", "🦉": "Búho",
  "📜": "Pergamino", "🎓": "Birrete", "🗡️": "Espada", "🛡️": "Escudo",
  "👑": "Corona", "🐉": "Dragón", "🔮": "Orbe", "🦅": "Águila",
};

export default function PerfilJurista({
  onClose,
  forzado,
}: {
  onClose: () => void;
  forzado?: boolean; // primera vez: no se puede cerrar tocando fuera
}) {
  const perfilNombre = useReinos((s) => s.perfilNombre);
  const perfilAvatar = useReinos((s) => s.perfilAvatar);
  const setPerfil = useReinos((s) => s.setPerfil);
  const [nombre, setNombre] = useState(perfilNombre ?? "");
  // Foco atrapado, Escape y devolución del foco, conservando el arte
  // propio de este overlay (ver lib/useModalAccesible.ts).
  const cajaModal = useModalAccesible<HTMLDivElement>(() => { if (!forzado) onClose(); });
  const [avatar, setAvatar] = useState(perfilAvatar ?? AVATARES[0]);

  const confirmar = () => {
    setPerfil(nombre, avatar);
    sfx.confirm?.();
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="modal-scrim"
      
      onClick={() => { if (!forzado) onClose(); }}
    >
      <motion.div
              ref={cajaModal} role="dialog" aria-modal="true" aria-label="Perfil del jurista"
        initial={{ scale: 0.92, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="reino-card p-5 md:p-6 max-w-md w-full"
      >
        <div className="font-mono-terminal text-[10px] uppercase tracking-[.3em] reino-fg mb-1">Tu jurista</div>
        <h2 className="font-display-grave text-2xl text-doc-aged mb-1">{forzado ? "Crea tu jurista" : "Editar perfil"}</h2>
        <p className="reino-explain text-doc-aged/65 text-[13px] mb-4">Elige tu avatar y tu nombre. Te acompañarán por todos los Reinos.</p>

        <div id="etiqueta-avatar" className="font-mono-terminal text-[9px] uppercase tracking-widest text-doc-aged/50 mb-2">Avatar</div>
        <div className="grid grid-cols-6 gap-2 mb-4" role="group" aria-labelledby="etiqueta-avatar">
          {AVATARES.map((a) => (
            <button
              key={a}
              onClick={() => { setAvatar(a); sfx.select?.(); }}
              type="button"
              aria-label={NOMBRE_AVATAR[a] ?? "Avatar"}
              aria-pressed={avatar === a}
              className="aspect-square flex items-center justify-center text-2xl border rounded-lg transition-all"
              style={{
                borderColor: avatar === a ? "var(--reino-primary)" : "rgba(232,223,197,.12)",
                background: avatar === a ? "color-mix(in srgb, var(--reino-primary) 14%, transparent)" : "transparent",
                transform: avatar === a ? "scale(1.06)" : "none",
                boxShadow: avatar === a ? "0 0 12px color-mix(in srgb, var(--reino-primary) 35%, transparent)" : "none",
              }}
            >
              <span aria-hidden="true">{a}</span>
            </button>
          ))}
        </div>

        <label htmlFor="nombre-jurista" className="block font-mono-terminal text-[9px] uppercase tracking-widest text-doc-aged/50 mb-2">
          Nombre
        </label>
        <input
          id="nombre-jurista"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") confirmar(); }}
          maxLength={24}
          placeholder="Litigante Anónimo"
          className="w-full bg-bg-steel/60 border border-doc-aged/15 rounded-lg px-3 py-2 reino-optext text-doc-aged text-[15px] mb-5 outline-none"
          style={{ caretColor: "var(--reino-primary)" }}
        />

        <div className="flex gap-3 justify-end">
          {!forzado && <button onClick={onClose} className="btn text-xs px-4 py-2">Cancelar</button>}
          <button onClick={confirmar} className="btn btn-cautelar text-sm px-5 py-2">Confirmar ▸</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
