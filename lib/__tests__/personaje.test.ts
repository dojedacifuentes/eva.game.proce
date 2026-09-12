import { describe, expect, it } from "vitest";
import {
  ATRIBUTOS_BASE, ORIGENES, ROLES, PARTIDA_RAPIDA,
  calcularAtributos, nivelEconomicoDe,
} from "@/lib/personaje";
import type { Atributos } from "@/types/game";

const CLAVES = Object.keys(ATRIBUTOS_BASE) as (keyof Atributos)[];

describe("creación de personaje", () => {
  it("la partida rápida usa una combinación válida del catálogo", () => {
    expect(ORIGENES.some((o) => o.id === PARTIDA_RAPIDA.origen)).toBe(true);
    expect(ROLES.some((r) => r.id === PARTIDA_RAPIDA.rol)).toBe(true);
    const a = calcularAtributos(PARTIDA_RAPIDA.origen, PARTIDA_RAPIDA.rol);
    CLAVES.forEach((k) => {
      expect(a[k]).toBeGreaterThanOrEqual(0);
      expect(a[k]).toBeLessThanOrEqual(10);
    });
  });

  it("suma los modificadores de origen y rol sobre la base", () => {
    // academia: +3 conocimiento · juez: +2 conocimiento, +1 rigor
    const a = calcularAtributos("academia", "juez");
    expect(a.conocimiento_procesal).toBe(10); // 5 + 3 + 2
    expect(a.rigor_formal).toBe(6);           // 5 + 1
    expect(a.diligencia).toBe(5);             // sin modificador
  });

  it("aplica los modificadores negativos", () => {
    // litigante en causa propia: -1 aguante, -1 conocimiento, +1 persuasión
    const a = calcularAtributos("litigante_propia_causa", "litigante_propio");
    expect(a.conocimiento_procesal).toBe(4);
    expect(a.resistencia_psicologica).toBe(3); // 5 - 1 - 1
    expect(a.persuasion_forense).toBe(6);
  });

  it("acota siempre al rango 0-10", () => {
    for (const o of ORIGENES) {
      for (const r of ROLES) {
        const a = calcularAtributos(o.id, r.id);
        CLAVES.forEach((k) => {
          expect(a[k]).toBeGreaterThanOrEqual(0);
          expect(a[k]).toBeLessThanOrEqual(10);
        });
      }
    }
  });

  it("NO acumula bonificaciones al volver atrás y cambiar de opción", () => {
    // Esta es la garantía que permite navegar el asistente sin penalización:
    // el cálculo parte siempre de la base, nunca del resultado anterior.
    const directo = calcularAtributos("academia", "secretario");
    const idaYVuelta = (() => {
      calcularAtributos("academia", "juez");
      calcularAtributos("estudio_grande", "juez");
      calcularAtributos("academia", "abogado_demandante");
      return calcularAtributos("academia", "secretario");
    })();
    expect(idaYVuelta).toEqual(directo);
  });

  it("es una función pura: no muta ATRIBUTOS_BASE", () => {
    const antes = { ...ATRIBUTOS_BASE };
    calcularAtributos("academia", "juez");
    calcularAtributos("litigante_propia_causa", "litigante_propio");
    expect(ATRIBUTOS_BASE).toEqual(antes);
  });

  it("el nivel económico lo decide el origen", () => {
    expect(nivelEconomicoDe("estudio_grande")).toBe(90);
    expect(nivelEconomicoDe("defensoria_publica")).toBe(25);
  });

  it("cada origen y cada rol tiene explicación de EVA", () => {
    // EVA sólo puede explicar con contenido que existe: si falta, se nota aquí.
    ORIGENES.forEach((o) => expect(o.eva.length).toBeGreaterThan(20));
    ROLES.forEach((r) => expect(r.eva.length).toBeGreaterThan(20));
  });
});
