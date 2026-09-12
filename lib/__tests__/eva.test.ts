import { describe, expect, it } from "vitest";
import { leerProgreso, siguientePaso, ALTERNATIVAS, idLogroBoss } from "@/lib/eva";
import { CAMPAÑA } from "@/data/campaign";

const TODAS = CAMPAÑA.flatMap((a) => a.misiones.map((m) => m.id));
const ACTO1 = CAMPAÑA[0].misiones.map((m) => m.id);
/** Logros equivalentes a haber vencido a todos los jefes. */
const TODOS_LOS_JEFES = CAMPAÑA.map((a) => idLogroBoss(a.bossId));

describe("recomendación de EVA", () => {
  it("sin personaje, manda crear uno", () => {
    const p = siguientePaso({ tieneNombre: false, misionesCompletadas: [] });
    expect(p.tipo).toBe("crear");
    expect(p.href).toBe("/creacion");
  });

  it("en una partida nueva recomienda la primera misión de la campaña", () => {
    const p = siguientePaso({ tieneNombre: true, misionesCompletadas: [] });
    expect(p.tipo).toBe("mision");
    expect(p.href).toBe(`/mision/${CAMPAÑA[0].misiones[0].id}`);
  });

  it("recomienda la primera PENDIENTE, no la primera de la lista", () => {
    const hechas = [CAMPAÑA[0].misiones[0].id];
    const p = siguientePaso({ tieneNombre: true, misionesCompletadas: hechas });
    expect(p.href).toBe(`/mision/${CAMPAÑA[0].misiones[1].id}`);
  });

  it("con el acto completo, recomienda su jefe", () => {
    const p = siguientePaso({ tieneNombre: true, misionesCompletadas: ACTO1 });
    expect(p.tipo).toBe("boss");
    expect(p.href).toBe(`/boss/${CAMPAÑA[0].bossId}`);
  });

  it("tras vencer al jefe del acto, pasa al acto siguiente", () => {
    const p = siguientePaso({
      tieneNombre: true,
      misionesCompletadas: ACTO1,
      logrosIds: [idLogroBoss(CAMPAÑA[0].bossId)],
    });
    expect(p.tipo).toBe("mision");
    expect(p.href).toBe(`/mision/${CAMPAÑA[1].misiones[0].id}`);
  });

  it("con todo hecho y todos los jefes vencidos, recomienda el examen", () => {
    const p = siguientePaso({
      tieneNombre: true,
      misionesCompletadas: TODAS,
      logrosIds: TODOS_LOS_JEFES,
    });
    expect(p.tipo).toBe("examen");
    expect(p.href).toBe("/examen");
  });

  it("con todo hecho pero el último jefe vivo, recomienda ese jefe", () => {
    const ultimo = CAMPAÑA[CAMPAÑA.length - 1];
    const p = siguientePaso({
      tieneNombre: true,
      misionesCompletadas: TODAS,
      logrosIds: CAMPAÑA.slice(0, -1).map((a) => idLogroBoss(a.bossId)),
    });
    expect(p.tipo).toBe("boss");
    expect(p.href).toBe(`/boss/${ultimo.bossId}`);
  });

  it("si la partida está finalizada, manda al epílogo por encima de todo", () => {
    const p = siguientePaso({ tieneNombre: true, misionesCompletadas: [], finalizado: true });
    expect(p.tipo).toBe("epilogo");
    expect(p.href).toBe("/epilogo");
  });

  it("TODA recomendación viaja con su razón y su botón", () => {
    // EVA nunca debe aconsejar sin decir por qué: es la regla que impide que
    // parezca que analiza más información de la que tiene.
    const casos = [
      { tieneNombre: false, misionesCompletadas: [] },
      { tieneNombre: true, misionesCompletadas: [] },
      { tieneNombre: true, misionesCompletadas: ACTO1 },
      { tieneNombre: true, misionesCompletadas: TODAS },
      { tieneNombre: true, misionesCompletadas: TODAS, logrosIds: TODOS_LOS_JEFES },
      { tieneNombre: true, misionesCompletadas: [], finalizado: true },
    ];
    for (const c of casos) {
      const p = siguientePaso(c);
      expect(p.razon.length).toBeGreaterThan(20);
      expect(p.cta.length).toBeGreaterThan(0);
      expect(p.href.startsWith("/")).toBe(true);
    }
  });

  it("las alternativas apuntan a rutas que existen en el proyecto", () => {
    const RUTAS_REALES = ["/mundos", "/codex", "/examen"];
    ALTERNATIVAS.forEach((a) => expect(RUTAS_REALES).toContain(a.href));
  });
});

describe("lectura del progreso", () => {
  it("una partida nueva está al 0 %", () => {
    const p = leerProgreso([]);
    expect(p.hechas).toBe(0);
    expect(p.porcentaje).toBe(0);
    expect(p.actoActual.numero).toBe(1);
  });

  it("una campaña completa está al 100 %", () => {
    const p = leerProgreso(TODAS, TODOS_LOS_JEFES);
    expect(p.hechas).toBe(p.total);
    expect(p.porcentaje).toBe(100);
    expect(p.misionActual).toBeNull();
  });

  it("ignora ids de misión que no existen", () => {
    const p = leerProgreso(["no_existe", "tampoco"]);
    expect(p.hechas).toBe(0);
  });

  it("cuenta las misiones que faltan en el acto en curso", () => {
    const p = leerProgreso([CAMPAÑA[0].misiones[0].id]);
    expect(p.pendientesActo).toBe(CAMPAÑA[0].misiones.length - 1);
  });
});
