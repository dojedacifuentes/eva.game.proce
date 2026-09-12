import { describe, expect, it } from "vitest";
import { sanearEstado, crearEstadoInicial, aMapa } from "@/store/useGame";

/**
 * La migración anterior era `migrate: () => ({ ...INIT, creado: Date.now() })`:
 * devolvía el estado inicial, así que CUALQUIER cambio de versión del formato
 * borraba la partida del jugador. Estas pruebas fijan el contrato contrario.
 */
describe("migración de partidas guardadas", () => {
  const guardadoV2 = {
    version: 2,
    creado: 1_700_000_000_000,
    ultimoGuardado: 1_700_000_500_000,
    personaje: {
      nombre: "Ojeda, Diego",
      sexo: "masculino",
      origen: "academia",
      rol: "juez",
      nivelEconomico: 45,
      atributos: {
        conocimiento_procesal: 9, persuasion_forense: 6, diligencia: 5,
        rigor_formal: 8, estrategia: 7, resistencia_psicologica: 4,
      },
      reputacion: 30,
      trauma: 12,
      expedientesGanados: 4,
      expedientesPerdidos: 1,
      cicloProcesal: 2,
    },
    expedientesArchivados: [], cautelares: [], incidentes: [],
    flags: ["logro_primera_demanda"],
    mundoActual: "recursos",
    log: [{ t: 1, texto: "Demanda presentada" }],
    logros: [{ id: "l1", titulo: "Primer fallo", desbloqueado: true }],
    casosResueltos: [], npcesEnProgreso: { __type: "Map", entries: [["npc1", { npcId: "npc1", etapaActual: 2 }]] },
    npcesCompletados: ["npc0"], npcesDesbloqueados: [],
    xp: 640, nivel: 7, monedas: 210,
    mundoVisual: "gotico",
    misionesCompletadas: ["m1_1", "m1_2", "m1_3", "m2_1"],
    relicsEquipadas: ["r1"], relicsCompradas: ["r1", "r2"],
  };

  it("conserva la partida entera al migrar", () => {
    const r = sanearEstado(guardadoV2 as never);
    expect(r.personaje.nombre).toBe("Ojeda, Diego");
    expect(r.personaje.atributos.conocimiento_procesal).toBe(9);
    expect(r.personaje.cicloProcesal).toBe(2);
    expect(r.xp).toBe(640);
    expect(r.monedas).toBe(210);
    expect(r.misionesCompletadas).toEqual(["m1_1", "m1_2", "m1_3", "m2_1"]);
    expect(r.relicsCompradas).toEqual(["r1", "r2"]);
    expect(r.logros).toHaveLength(1);
    expect(r.flags).toContain("logro_primera_demanda");
    expect(r.creado).toBe(1_700_000_000_000);
  });

  it("NO reemplaza el estado por el inicial", () => {
    const r = sanearEstado(guardadoV2 as never);
    const inicial = crearEstadoInicial();
    expect(r.personaje.nombre).not.toBe(inicial.personaje.nombre);
    expect(r.xp).not.toBe(inicial.xp);
  });

  it("revive npcesEnProgreso como Map", () => {
    const r = sanearEstado(guardadoV2 as never);
    expect(r.npcesEnProgreso).toBeInstanceOf(Map);
    expect(r.npcesEnProgreso.get("npc1")?.etapaActual).toBe(2);
  });

  it("rellena sólo lo que falta en un save antiguo e incompleto", () => {
    const antiguo = {
      personaje: { nombre: "Parcial", atributos: { conocimiento_procesal: 7 } },
      xp: 150,
    };
    const r = sanearEstado(antiguo as never);
    expect(r.personaje.nombre).toBe("Parcial");             // se conserva
    expect(r.personaje.atributos.conocimiento_procesal).toBe(7); // se conserva
    expect(r.personaje.atributos.estrategia).toBe(5);       // se rellena
    expect(r.personaje.sexo).toBe("femenino");              // se rellena
    expect(r.xp).toBe(150);
    expect(r.misionesCompletadas).toEqual([]);
    expect(r.npcesEnProgreso).toBeInstanceOf(Map);
  });

  it("deriva el nivel del XP guardado", () => {
    const r = sanearEstado({ personaje: { nombre: "X" }, xp: 640 } as never);
    expect(r.nivel).toBe(7);
  });

  it("tolera basura sin reventar", () => {
    expect(sanearEstado(null).personaje.nombre).toBe("");
    expect(sanearEstado(undefined).personaje.nombre).toBe("");
    expect(sanearEstado({ personaje: "no es un objeto" } as never).personaje.nombre).toBe("");
    expect(sanearEstado({ xp: "muchísimo" } as never).xp).toBe(0);
  });

  it("cada partida nueva arranca con estructuras propias, sin compartir referencias", () => {
    const a = crearEstadoInicial();
    const b = crearEstadoInicial();
    a.misionesCompletadas.push("m1_1");
    a.npcesEnProgreso.set("npc", {} as never);
    expect(b.misionesCompletadas).toEqual([]);
    expect(b.npcesEnProgreso.size).toBe(0);
  });

  it("aMapa acepta las formas en que se pudo guardar el Map", () => {
    expect(aMapa(new Map([["a", 1 as never]])).get("a")).toBe(1);
    expect(aMapa({ __type: "Map", entries: [["b", 2]] }).get("b")).toBe(2);
    expect(aMapa([["c", 3]]).get("c")).toBe(3);
    expect(aMapa({ d: 4 }).get("d")).toBe(4);
    expect(aMapa(null).size).toBe(0);
  });
});
