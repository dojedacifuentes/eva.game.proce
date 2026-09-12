"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Expediente, Flag, Incidente, Logro, MedidaCautelar, Mundo, Personaje, SaveState,
  Escrito, Resolucion, RecursoInterpuesto, Prueba, Tribunal, CasoResuelto, CasoEnProgreso,
  ProgresionNpc, EstadoNpc, MundoVisual,
} from "@/types/game";
import { getRelicById, MAX_RELICS_EQUIPADAS } from "@/data/relics";

type Store = SaveState & {
  /** true en cuanto `persist` terminó de leer localStorage. NO se persiste. */
  _hydrated: boolean;
  /** Marca el fin de la rehidratación. La llama `persist`, no la UI. */
  _marcarHidratado: () => void;
  /** ¿Hay una partida guardada con personaje constituido? */
  hayPartida: () => boolean;
  /** Crea una partida nueva reemplazando la anterior. Punto único de borrado. */
  iniciarPartida: (p: Personaje) => void;
  /** Serializa la partida a JSON para respaldo/traslado entre dominios. */
  exportarPartida: () => string;
  /** Restaura una partida exportada. Devuelve false si el JSON no es válido. */
  importarPartida: (json: string) => boolean;
  setPersonaje: (p: Personaje) => void;
  setMundo: (m: Mundo) => void;
  gainXp: (amount: number) => void;
  gainMonedas: (amount: number) => void;
  spendMonedas: (amount: number) => boolean;
  setMundoVisual: (m: MundoVisual) => void;
  setMisionActiva: (id: string | undefined) => void;
  completarMision: (id: string, recompensa: { xp?: number; monedas?: number }) => void;
  iniciarExpediente: (e: Expediente) => void;
  cerrarExpediente: (resultado: NonNullable<Expediente["resultado"]>) => void;
  setTribunal: (t: Tribunal) => void;
  addEscrito: (e: Escrito) => void;
  addPrueba: (p: Prueba) => void;
  addResolucion: (r: Resolucion) => void;
  addRecurso: (r: RecursoInterpuesto) => void;
  addCautelar: (m: MedidaCautelar) => void;
  addIncidente: (i: Incidente) => void;
  setFlag: (f: Flag) => void;
  hasFlag: (f: Flag) => boolean;
  pushLog: (texto: string, tag?: string) => void;
  ajustarAtributo: (k: keyof Personaje["atributos"], delta: number) => void;
  ajustarReputacion: (delta: number) => void;
  ajustarTrauma: (delta: number) => void;
  desbloquearLogro: (l: Logro) => void;
  iniciarCaso: (caso: CasoEnProgreso) => void;
  resolverCaso: (caseId: string, resuelto: CasoResuelto, efectos?: { reputacion?: number; trauma?: number; conocimiento?: number }) => void;
  // Relic System
  comprarRelic: (relicId: string, costo: number) => boolean;
  equiparRelic: (relicId: string) => boolean;
  desequiparRelic: (relicId: string) => void;
  hasRelicEquipada: (relicId: string) => boolean;
  // NPC System
  iniciarArcoNpc: (npcId: string) => void;
  avanzoNpc: (npcId: string, accion: "completar_actividad" | "pasar_etapa" | "iniciar_desafio") => void;
  completarDesafioNpc: (npcId: string, exitoso: boolean, efectos?: { reputacion?: number; trauma?: number; conocimiento?: number; skills?: string[] }) => void;
  validarNpcsDesbloqueados: () => void;
  reset: () => void;
  finalizar: (texto: string) => void;
  nuevoCicloProcesal: () => void;
};

export function crearEstadoInicial(): SaveState {
  return {
    version: 1,
    creado: Date.now(),
    ultimoGuardado: Date.now(),
    personaje: {
      nombre: "",
      sexo: "femenino",
      origen: "litigante_freelancer",
      rol: "abogado_demandante",
      nivelEconomico: 50,
      atributos: {
        conocimiento_procesal: 5, persuasion_forense: 5, diligencia: 5,
        rigor_formal: 5, estrategia: 5, resistencia_psicologica: 5,
      },
      reputacion: 0,
      trauma: 0,
      expedientesGanados: 0,
      expedientesPerdidos: 0,
      cicloProcesal: 1,
    },
    expedientesArchivados: [],
    cautelares: [],
    incidentes: [],
    flags: [],
    mundoActual: "jurisdiccion",
    log: [],
    logros: [],
    casosResueltos: [],
    npcesEnProgreso: new Map<string, ProgresionNpc>(),
    npcesCompletados: [],
    npcesDesbloqueados: [],
    xp: 0,
    nivel: 1,
    monedas: 0,
    mundoVisual: "cybervalpo",
    misionActiva: undefined,
    misionesCompletadas: [],
    relicsEquipadas: [],
    relicsCompradas: [],
  };
}

/** Claves que se persisten: exactamente las del estado guardado, ni una más. */
const CLAVES_PERSISTIDAS = Object.keys(crearEstadoInicial()) as (keyof SaveState)[];

/**
 * Convierte a `Map` cualquiera de las formas en que `npcesEnProgreso` puede
 * haber quedado guardado: Map ya revivido, `{__type:"Map",entries}`, array de
 * pares, u objeto plano de saves antiguos.
 */
export function aMapa(valor: unknown): Map<string, ProgresionNpc> {
  if (valor instanceof Map) return new Map(valor);
  if (Array.isArray(valor)) return new Map(valor as [string, ProgresionNpc][]);
  if (valor && typeof valor === "object") {
    const v = valor as Record<string, unknown>;
    if (Array.isArray(v.entries)) return new Map(v.entries as [string, ProgresionNpc][]);
    return new Map(Object.entries(v) as [string, ProgresionNpc][]);
  }
  return new Map();
}

/**
 * Normaliza un estado persistido de CUALQUIER versión anterior sin destruirlo.
 *
 * Contrato: todo dato guardado que siga siendo válido se conserva tal cual; sólo
 * se rellenan las claves ausentes con el valor por defecto. Es lo contrario de
 * lo que hacía la migración anterior, que devolvía el estado inicial y borraba
 * la partida en cada cambio de versión.
 */
export function sanearEstado(bruto: Record<string, unknown> | null | undefined): SaveState {
  const base = crearEstadoInicial();
  if (!bruto || typeof bruto !== "object") return base;

  const fusionado: SaveState = { ...base };

  // Escalares y colecciones: se respeta lo guardado cuando el tipo cuadra.
  for (const clave of CLAVES_PERSISTIDAS) {
    const guardado = (bruto as Record<string, unknown>)[clave];
    if (guardado === undefined || guardado === null) continue;
    const porDefecto = base[clave];
    if (Array.isArray(porDefecto)) {
      if (Array.isArray(guardado)) (fusionado as any)[clave] = guardado;
    } else if (porDefecto instanceof Map) {
      (fusionado as any)[clave] = aMapa(guardado);
    } else if (typeof porDefecto === typeof guardado) {
      (fusionado as any)[clave] = guardado;
    }
  }

  // `personaje` y sus atributos se fusionan en profundidad: un save antiguo al
  // que le falte un atributo nuevo conserva los que sí tiene.
  const personajeGuardado = (bruto.personaje ?? {}) as Partial<Personaje>;
  fusionado.personaje = {
    ...base.personaje,
    ...personajeGuardado,
    nombre: typeof personajeGuardado.nombre === "string" ? personajeGuardado.nombre : base.personaje.nombre,
    atributos: { ...base.personaje.atributos, ...(personajeGuardado.atributos ?? {}) },
  };

  // Campos opcionales que no viven en el estado inicial.
  if (typeof bruto.finalizado === "boolean") fusionado.finalizado = bruto.finalizado;
  if (typeof bruto.epilogo === "string") fusionado.epilogo = bruto.epilogo;
  if (bruto.expedienteActivo) fusionado.expedienteActivo = bruto.expedienteActivo as Expediente;
  if (bruto.casosEnProgreso) fusionado.casosEnProgreso = bruto.casosEnProgreso as CasoEnProgreso;

  // El nivel se deriva del XP: así un save viejo con XP pero sin nivel no
  // aparece en Nv.1 con 1.400 XP.
  fusionado.nivel = Math.min(20, Math.floor(fusionado.xp / 100) + 1);
  fusionado.npcesEnProgreso = aMapa(fusionado.npcesEnProgreso);
  return fusionado;
}

export const useGame = create<Store>()(
  persist(
    (set, get) => ({
      ...crearEstadoInicial(),
      _hydrated: false,
      _marcarHidratado: () =>
        set((s) => ({ _hydrated: true, npcesEnProgreso: aMapa(s.npcesEnProgreso) })),
      hayPartida: () => !!get().personaje.nombre.trim(),
      // Único camino que destruye una partida. La UI DEBE confirmar antes de
      // llamarlo cuando ya existe un personaje (ver app/creacion).
      iniciarPartida: (p) =>
        set({ ...crearEstadoInicial(), creado: Date.now(), personaje: p, finalizado: false, epilogo: undefined }),
      exportarPartida: () => {
        const s = get();
        const plano: Record<string, unknown> = {};
        for (const k of CLAVES_PERSISTIDAS) {
          const v = s[k];
          plano[k] = v instanceof Map ? { __type: "Map", entries: Array.from(v.entries()) } : v;
        }
        return JSON.stringify({ __save: "foro-invisible", exportado: Date.now(), estado: plano }, null, 2);
      },
      importarPartida: (json) => {
        try {
          const parsed = JSON.parse(json);
          const bruto = parsed?.estado ?? parsed?.state ?? parsed;
          if (!bruto || typeof bruto !== "object") return false;
          const sano = sanearEstado(bruto as Record<string, unknown>);
          if (!sano.personaje.nombre.trim()) return false;
          set({ ...sano, ultimoGuardado: Date.now() });
          return true;
        } catch {
          return false;
        }
      },
      setPersonaje: (p) => set({ personaje: p, ultimoGuardado: Date.now() }),
      setMundo: (m) => set({ mundoActual: m, ultimoGuardado: Date.now() }),
      iniciarExpediente: (e) => set({ expedienteActivo: e }),
      cerrarExpediente: (resultado) =>
        set((s) => {
          if (!s.expedienteActivo) return s;
          const cerrado = { ...s.expedienteActivo, resultado };
          const p = s.personaje;
          return {
            expedientesArchivados: [...s.expedientesArchivados, cerrado],
            expedienteActivo: undefined,
            personaje: {
              ...p,
              expedientesGanados: resultado === "ganado" ? p.expedientesGanados + 1 : p.expedientesGanados,
              expedientesPerdidos: resultado === "perdido" ? p.expedientesPerdidos + 1 : p.expedientesPerdidos,
            },
          };
        }),
      setTribunal: (t) =>
        set((s) => (s.expedienteActivo ? { expedienteActivo: { ...s.expedienteActivo, tribunal: t } } : s)),
      addEscrito: (e) =>
        set((s) => (s.expedienteActivo ? { expedienteActivo: { ...s.expedienteActivo, escritos: [...s.expedienteActivo.escritos, e] } } : s)),
      addPrueba: (p) =>
        set((s) => (s.expedienteActivo ? { expedienteActivo: { ...s.expedienteActivo, pruebas: [...s.expedienteActivo.pruebas, p] } } : s)),
      addResolucion: (r) =>
        set((s) => (s.expedienteActivo ? { expedienteActivo: { ...s.expedienteActivo, resoluciones: [...s.expedienteActivo.resoluciones, r] } } : s)),
      addRecurso: (r) =>
        set((s) => (s.expedienteActivo ? { expedienteActivo: { ...s.expedienteActivo, recursosPendientes: [...s.expedienteActivo.recursosPendientes, r] } } : s)),
      addCautelar: (m) => set((s) => ({ cautelares: [...s.cautelares, m] })),
      addIncidente: (i) => set((s) => ({ incidentes: [...s.incidentes, i] })),
      setFlag: (f) => set((s) => (s.flags.includes(f) ? s : { flags: [...s.flags, f] })),
      hasFlag: (f) => get().flags.includes(f),
      pushLog: (texto, tag) =>
        set((s) => ({ log: [{ t: Date.now(), texto, tag }, ...s.log].slice(0, 300) })),
      ajustarAtributo: (k, delta) =>
        set((s) => ({
          personaje: {
            ...s.personaje,
            atributos: {
              ...s.personaje.atributos,
              [k]: Math.max(0, Math.min(10, s.personaje.atributos[k] + delta)),
            },
          },
        })),
      ajustarReputacion: (delta) =>
        set((s) => ({ personaje: { ...s.personaje, reputacion: Math.max(-100, Math.min(100, s.personaje.reputacion + delta)) } })),
      ajustarTrauma: (delta) =>
        set((s) => {
          // Apply relic trauma reduction (only for positive delta = damage)
          let efectivo = delta;
          if (delta > 0) {
            for (const relicId of s.relicsEquipadas) {
              const r = getRelicById(relicId);
              if (r?.mecanica.tipo === "trauma_redux") efectivo = Math.max(0, efectivo - r.mecanica.valor);
            }
          }
          return { personaje: { ...s.personaje, trauma: Math.max(0, Math.min(100, s.personaje.trauma + efectivo)) } };
        }),
      desbloquearLogro: (l) =>
        set((s) => (s.logros.find((x) => x.id === l.id) ? s : { logros: [...s.logros, { ...l, desbloqueado: true, fecha: Date.now() }] })),
      iniciarCaso: (caso) =>
        set((s) => ({ casosEnProgreso: caso, ultimoGuardado: Date.now() })),
      resolverCaso: (caseId, resuelto, efectos) =>
        set((s) => {
          const nuevosCasos = [...s.casosResueltos, resuelto];
          const p = s.personaje;
          const efectosAplicados = {
            personaje: {
              ...p,
              reputacion: Math.max(-100, Math.min(100, p.reputacion + (efectos?.reputacion || 0))),
              trauma: Math.max(0, Math.min(100, p.trauma + (efectos?.trauma || 0))),
              atributos: {
                ...p.atributos,
                conocimiento_procesal: Math.max(0, Math.min(10, p.atributos.conocimiento_procesal + (efectos?.conocimiento || 0))),
              },
            },
            casosResueltos: nuevosCasos,
            casosEnProgreso: undefined,
            ultimoGuardado: Date.now(),
          };
          return efectosAplicados;
        }),
      iniciarArcoNpc: (npcId) =>
        set((s) => {
          const nuevaProgresion: ProgresionNpc = {
            npcId,
            estado: "en_progreso_etapa_1",
            etapaActual: 1,
            fechaInicio: Date.now(),
            ultimoProgreso: Date.now(),
            actividadCompletada: false,
            intentosFinal: 0,
          };
          const nuevoMap = new Map(s.npcesEnProgreso);
          nuevoMap.set(npcId, nuevaProgresion);
          return {
            npcesEnProgreso: nuevoMap,
            ultimoGuardado: Date.now(),
          };
        }),
      avanzoNpc: (npcId, accion) =>
        set((s) => {
          const actual = s.npcesEnProgreso.get(npcId);
          if (!actual) return s;

          const nuevoMap = new Map(s.npcesEnProgreso);

          if (accion === "completar_actividad") {
            nuevoMap.set(npcId, {
              ...actual,
              actividadCompletada: true,
              ultimoProgreso: Date.now(),
            });
          } else if (accion === "pasar_etapa") {
            const proxEtapa = actual.etapaActual + 1;
            const nuevoEstado: EstadoNpc =
              proxEtapa === 2 ? "en_progreso_etapa_2" :
              proxEtapa === 3 ? "en_progreso_etapa_3" :
              "desafio_final";

            nuevoMap.set(npcId, {
              ...actual,
              etapaActual: proxEtapa,
              estado: nuevoEstado,
              actividadCompletada: false,
              ultimoProgreso: Date.now(),
            });
          } else if (accion === "iniciar_desafio") {
            nuevoMap.set(npcId, {
              ...actual,
              estado: "desafio_final",
              ultimoProgreso: Date.now(),
            });
          }

          return {
            npcesEnProgreso: nuevoMap,
            ultimoGuardado: Date.now(),
          };
        }),
      completarDesafioNpc: (npcId, exitoso, efectos) =>
        set((s) => {
          const actual = s.npcesEnProgreso.get(npcId);
          if (!actual) return s;

          const nuevoMap = new Map(s.npcesEnProgreso);
          const nuevoEstado: EstadoNpc = exitoso ? "completada" : "fallida";

          nuevoMap.set(npcId, {
            ...actual,
            estado: nuevoEstado,
            intentosFinal: actual.intentosFinal + 1,
            ultimoProgreso: Date.now(),
          });

          // Aplicar efectos al personaje
          const p = s.personaje;
          const nuevaRep = Math.max(-100, Math.min(100, p.reputacion + (efectos?.reputacion || 0)));
          const nuevoTrauma = Math.max(0, Math.min(100, p.trauma + (efectos?.trauma || 0)));
          const nuevoConocimiento = Math.max(0, Math.min(10, p.atributos.conocimiento_procesal + (efectos?.conocimiento || 0)));

          // Agregar skills a flags si existen
          const nuevosFlags = [...s.flags];
          if (efectos?.skills) {
            for (const skill of efectos.skills) {
              if (!nuevosFlags.includes(skill)) {
                nuevosFlags.push(skill);
              }
            }
          }

          const nuevosCompletados = exitoso && !s.npcesCompletados.includes(npcId)
            ? [...s.npcesCompletados, npcId]
            : s.npcesCompletados;

          return {
            npcesEnProgreso: nuevoMap,
            npcesCompletados: nuevosCompletados,
            personaje: {
              ...p,
              reputacion: nuevaRep,
              trauma: nuevoTrauma,
              atributos: {
                ...p.atributos,
                conocimiento_procesal: nuevoConocimiento,
              },
            },
            flags: nuevosFlags,
            ultimoGuardado: Date.now(),
          };
        }),
      validarNpcsDesbloqueados: () =>
        set((s) => {
          // Por ahora, todos los NPCs disponibles
          // En futuro: validar dependencias contra npcesCompletados
          return s; // placeholder
        }),
      gainXp: (amount) =>
        set((s) => {
          // Apply relic XP bonuses
          let bonus = amount;
          for (const relicId of s.relicsEquipadas) {
            const r = getRelicById(relicId);
            if (!r) continue;
            if (r.mecanica.tipo === "xp_bonus") bonus += amount * r.mecanica.valor;
            if (r.mecanica.tipo === "xp_flat") bonus += r.mecanica.valor;
          }
          const newXp = s.xp + Math.round(bonus);
          const xpPerLevel = 100;
          const newNivel = Math.min(20, Math.floor(newXp / xpPerLevel) + 1);
          return { xp: newXp, nivel: newNivel, ultimoGuardado: Date.now() };
        }),
      gainMonedas: (amount) =>
        set((s) => {
          // Apply relic monedas bonuses
          let bonus = amount;
          for (const relicId of s.relicsEquipadas) {
            const r = getRelicById(relicId);
            if (r?.mecanica.tipo === "monedas_bonus") bonus += amount * r.mecanica.valor;
          }
          return { monedas: s.monedas + Math.round(bonus), ultimoGuardado: Date.now() };
        }),
      spendMonedas: (amount) => {
        const monedas = get().monedas;
        if (monedas < amount) return false;
        set({ monedas: monedas - amount });
        return true;
      },
      setMundoVisual: (m) => set({ mundoVisual: m, ultimoGuardado: Date.now() }),
      setMisionActiva: (id) => set({ misionActiva: id }),
      completarMision: (id, recompensa) =>
        set((s) => {
          if (s.misionesCompletadas.includes(id)) return s;
          const newXp = s.xp + (recompensa.xp || 0);
          const xpPerLevel = 100;
          const newNivel = Math.min(20, Math.floor(newXp / xpPerLevel) + 1);
          return {
            misionesCompletadas: [...s.misionesCompletadas, id],
            xp: newXp,
            nivel: newNivel,
            monedas: s.monedas + (recompensa.monedas || 0),
            misionActiva: undefined,
            ultimoGuardado: Date.now(),
          };
        }),
      // ── RELIC SYSTEM ──────────────────────────────────────────────────────
      comprarRelic: (relicId, costo) => {
        const s = get();
        if (s.relicsCompradas.includes(relicId)) return false; // ya comprada
        if (s.monedas < costo) return false;
        set({
          monedas: s.monedas - costo,
          relicsCompradas: [...s.relicsCompradas, relicId],
          ultimoGuardado: Date.now(),
        });
        return true;
      },
      equiparRelic: (relicId) => {
        const s = get();
        if (!s.relicsCompradas.includes(relicId)) return false;
        if (s.relicsEquipadas.includes(relicId)) return false;
        if (s.relicsEquipadas.length >= MAX_RELICS_EQUIPADAS) return false;
        set({ relicsEquipadas: [...s.relicsEquipadas, relicId], ultimoGuardado: Date.now() });
        return true;
      },
      desequiparRelic: (relicId) => {
        set((s) => ({
          relicsEquipadas: s.relicsEquipadas.filter((id) => id !== relicId),
          ultimoGuardado: Date.now(),
        }));
      },
      hasRelicEquipada: (relicId) => get().relicsEquipadas.includes(relicId),
      // ──────────────────────────────────────────────────────────────────────
      finalizar: (texto) => set({ finalizado: true, epilogo: texto }),
      nuevoCicloProcesal: () =>
        set((s) => ({
          personaje: { ...s.personaje, cicloProcesal: s.personaje.cicloProcesal + 1 },
          expedienteActivo: undefined,
          flags: s.flags.filter((f) => f.startsWith("logro_") || f === "examen_aprobado"),
          mundoActual: "jurisdiccion",
          finalizado: false,
          epilogo: undefined,
        })),
      reset: () =>
        set({ ...crearEstadoInicial(), creado: Date.now(), finalizado: false, epilogo: undefined }),
    }),
    {
      name: "derecho-procesal-rpg-save",
      version: 3,
      // No se persisten las funciones, la bandera de hidratación ni las acciones:
      // sólo las claves que existen en el estado inicial (SaveState).
      partialize: (s) => {
        const { _hydrated, ...resto } = s as Store;
        const plano: Record<string, unknown> = {};
        for (const k of CLAVES_PERSISTIDAS) plano[k] = (resto as any)[k];
        return plano as any;
      },
      // La versión anterior devolvía el estado inicial, borrando la partida en
      // cada cambio de versión. Ahora se CONSERVA lo guardado y sólo se rellenan
      // los campos que falten (ver tests en lib/__tests__/migracion.test.ts).
      migrate: (persistido: unknown) => sanearEstado(persistido as Record<string, unknown>) as any,
      // Se marca hidratado aunque no hubiera nada guardado: la UI necesita saber
      // que ya puede decidir entre "continuar" y "empezar".
      onRehydrateStorage: () => (estado) => estado?._marcarHidratado(),
      // Serializador custom: Map<string, ProgresionNpc> → array y viceversa
      storage: createJSONStorage(
        () => (typeof window !== "undefined"
          ? window.localStorage
          : ({ getItem: () => null, setItem: () => {}, removeItem: () => {} } as any)),
        {
          replacer: (_key: string, value: unknown) => {
            if (value instanceof Map) {
              return { __type: "Map", entries: Array.from(value.entries()) };
            }
            return value;
          },
          reviver: (_key: string, value: unknown) => {
            if (
              value !== null &&
              typeof value === "object" &&
              (value as Record<string, unknown>).__type === "Map"
            ) {
              return new Map((value as { entries: [string, unknown][] }).entries);
            }
            return value;
          },
        }
      ),
    }
  )
);
