import { beforeEach, describe, expect, it } from "vitest";
import { useGame } from "@/store/useGame";
import type { Personaje } from "@/types/game";

/**
 * Contrato de seguridad de la partida.
 *
 * En la versión anterior, "Firmar y comenzar" llamaba a `reset()` y después a
 * `setPersonaje()`, sin avisar: bastaba pulsarlo para perder la partida en
 * curso. Ahora hay UN solo camino destructivo, `iniciarPartida`, y la interfaz
 * está obligada a confirmarlo antes (app/creacion/page.tsx).
 */
const NUEVO: Personaje = {
  nombre: "Nueva, Persona",
  sexo: "femenino",
  origen: "academia",
  rol: "juez",
  nivelEconomico: 45,
  atributos: {
    conocimiento_procesal: 10, persuasion_forense: 5, diligencia: 5,
    rigor_formal: 6, estrategia: 5, resistencia_psicologica: 5,
  },
  reputacion: 0, trauma: 0, expedientesGanados: 0, expedientesPerdidos: 0, cicloProcesal: 1,
};

function partidaAvanzada() {
  useGame.setState({
    personaje: { ...NUEVO, nombre: "Ojeda, Diego" },
    xp: 640, nivel: 7, monedas: 210,
    misionesCompletadas: ["m1_1", "m1_2", "m1_3"],
    logros: [{ id: "l1", titulo: "Primer fallo", descripcion: "", desbloqueado: true }] as never,
    relicsCompradas: ["r1"], relicsEquipadas: ["r1"],
  });
}

describe("protección de la partida guardada", () => {
  beforeEach(() => {
    useGame.setState({ ...useGame.getInitialState() });
    partidaAvanzada();
  });

  it("hayPartida detecta una partida en curso", () => {
    expect(useGame.getState().hayPartida()).toBe(true);
    useGame.setState({ personaje: { ...NUEVO, nombre: "   " } });
    expect(useGame.getState().hayPartida()).toBe(false);
  });

  it("leer el estado no destruye nada", () => {
    // Equivale a abrir /creacion y mirar: no debe tocar lo guardado.
    const s = useGame.getState();
    void s.personaje; void s.xp; void s.hayPartida();
    expect(useGame.getState().xp).toBe(640);
    expect(useGame.getState().misionesCompletadas).toHaveLength(3);
  });

  it("iniciarPartida es el ÚNICO camino que reemplaza el progreso", () => {
    useGame.getState().iniciarPartida(NUEVO);
    const s = useGame.getState();
    expect(s.personaje.nombre).toBe("Nueva, Persona");
    expect(s.xp).toBe(0);
    expect(s.monedas).toBe(0);
    expect(s.misionesCompletadas).toEqual([]);
    expect(s.logros).toEqual([]);
    expect(s.relicsCompradas).toEqual([]);
  });

  it("setPersonaje cambia la ficha sin borrar el avance", () => {
    useGame.getState().setPersonaje({ ...NUEVO, nombre: "Renombrado" });
    const s = useGame.getState();
    expect(s.personaje.nombre).toBe("Renombrado");
    expect(s.xp).toBe(640);                       // el avance sobrevive
    expect(s.misionesCompletadas).toHaveLength(3);
  });

  it("una partida nueva no arrastra estructuras de la anterior", () => {
    const anteriores = useGame.getState().misionesCompletadas;
    useGame.getState().iniciarPartida(NUEVO);
    expect(useGame.getState().misionesCompletadas).not.toBe(anteriores);
    expect(useGame.getState().npcesEnProgreso.size).toBe(0);
  });
});

describe("respaldo de partida", () => {
  beforeEach(() => {
    useGame.setState({ ...useGame.getInitialState() });
    partidaAvanzada();
  });

  it("exportar e importar devuelve la misma partida", () => {
    const copia = useGame.getState().exportarPartida();
    useGame.getState().iniciarPartida(NUEVO);            // se pierde a propósito
    expect(useGame.getState().xp).toBe(0);

    expect(useGame.getState().importarPartida(copia)).toBe(true);
    const s = useGame.getState();
    expect(s.personaje.nombre).toBe("Ojeda, Diego");
    expect(s.xp).toBe(640);
    expect(s.monedas).toBe(210);
    expect(s.misionesCompletadas).toEqual(["m1_1", "m1_2", "m1_3"]);
    expect(s.relicsEquipadas).toEqual(["r1"]);
  });

  it("rechaza archivos que no son una partida, sin tocar la actual", () => {
    const antes = useGame.getState().xp;
    expect(useGame.getState().importarPartida("no soy json")).toBe(false);
    expect(useGame.getState().importarPartida("{}")).toBe(false);
    expect(useGame.getState().importarPartida('{"estado":{"personaje":{"nombre":""}}}')).toBe(false);
    expect(useGame.getState().xp).toBe(antes);
  });
});
