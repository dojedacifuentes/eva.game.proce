import { describe, it, expect } from "vitest";
import {
  registrarActividad, rachaVigente, diaLocal, RACHA_INICIAL, type EstadoRacha,
} from "../racha";

const base = (p: Partial<EstadoRacha> = {}): EstadoRacha => ({ ...RACHA_INICIAL, ...p });

describe("diaLocal", () => {
  it("usa la hora local, no UTC", () => {
    // 31 de diciembre a las 21:00 hora local sigue siendo día 31, aunque en UTC
    // ya sea 1 de enero en buena parte del mundo.
    const fin = new Date(2026, 11, 31, 21, 0, 0);
    expect(diaLocal(fin)).toBe("2026-12-31");
  });

  it("rellena mes y día con cero", () => {
    expect(diaLocal(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("registrarActividad", () => {
  it("la primera actividad abre la racha en 1", () => {
    const r = registrarActividad(base(), "2026-09-13");
    expect(r.rachaDias).toBe(1);
    expect(r.mejorRacha).toBe(1);
    expect(r.actividadesHoy).toBe(1);
    expect(r.ultimoDiaJugado).toBe("2026-09-13");
  });

  it("varias actividades el mismo día no inflan la racha", () => {
    let r = registrarActividad(base(), "2026-09-13");
    r = registrarActividad(r, "2026-09-13");
    r = registrarActividad(r, "2026-09-13");
    expect(r.rachaDias).toBe(1);
    expect(r.actividadesHoy).toBe(3);
  });

  it("el día siguiente hace crecer la racha y reinicia el contador del día", () => {
    const ayer = base({ rachaDias: 4, mejorRacha: 9, ultimoDiaJugado: "2026-09-12", actividadesHoy: 7 });
    const r = registrarActividad(ayer, "2026-09-13");
    expect(r.rachaDias).toBe(5);
    expect(r.mejorRacha).toBe(9);
    expect(r.actividadesHoy).toBe(1);
  });

  it("un hueco de dos días la reinicia", () => {
    const previo = base({ rachaDias: 12, mejorRacha: 12, ultimoDiaJugado: "2026-09-10" });
    const r = registrarActividad(previo, "2026-09-13");
    expect(r.rachaDias).toBe(1);
    expect(r.mejorRacha).toBe(12); // la mejor no se pierde
  });

  it("cruza el cambio de mes", () => {
    const r = registrarActividad(base({ rachaDias: 2, ultimoDiaJugado: "2026-08-31" }), "2026-09-01");
    expect(r.rachaDias).toBe(3);
  });

  it("cruza el cambio de año", () => {
    const r = registrarActividad(base({ rachaDias: 6, ultimoDiaJugado: "2026-12-31" }), "2027-01-01");
    expect(r.rachaDias).toBe(7);
  });

  it("cuenta el 29 de febrero de un año bisiesto", () => {
    const r = registrarActividad(base({ rachaDias: 1, ultimoDiaJugado: "2028-02-28" }), "2028-02-29");
    expect(r.rachaDias).toBe(2);
  });

  it("una fecha anterior a la última no rompe ni premia", () => {
    const previo = base({ rachaDias: 5, mejorRacha: 5, ultimoDiaJugado: "2026-09-13", actividadesHoy: 2 });
    const r = registrarActividad(previo, "2026-09-11");
    expect(r.rachaDias).toBe(5);
    expect(r.ultimoDiaJugado).toBe("2026-09-13");
    expect(r.actividadesHoy).toBe(3);
  });
});

describe("rachaVigente", () => {
  it("sin historial no hay racha", () => {
    expect(rachaVigente(base(), "2026-09-13")).toBe(0);
  });

  it("la de hoy está viva", () => {
    expect(rachaVigente(base({ rachaDias: 3, ultimoDiaJugado: "2026-09-13" }), "2026-09-13")).toBe(3);
  });

  it("la de ayer sigue viva: aún se puede continuar", () => {
    expect(rachaVigente(base({ rachaDias: 3, ultimoDiaJugado: "2026-09-12" }), "2026-09-13")).toBe(3);
  });

  it("la de anteayer ya se rompió", () => {
    expect(rachaVigente(base({ rachaDias: 3, ultimoDiaJugado: "2026-09-11" }), "2026-09-13")).toBe(0);
  });

  it("mirar no reescribe el estado", () => {
    const estado = base({ rachaDias: 3, ultimoDiaJugado: "2026-09-11" });
    rachaVigente(estado, "2026-09-13");
    expect(estado).toEqual(base({ rachaDias: 3, ultimoDiaJugado: "2026-09-11" }));
  });
});
