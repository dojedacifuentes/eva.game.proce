import { describe, it, expect } from "vitest";
import { debeCelebrarNivel, SALTO_MAXIMO_CELEBRABLE } from "../progreso";

describe("debeCelebrarNivel", () => {
  it("no celebra antes de leer el guardado", () => {
    // Es el caso que importa: al abrir el juego el estado salta de 1 al nivel
    // guardado, y eso no es un ascenso.
    expect(debeCelebrarNivel(null, 7)).toBe(false);
    expect(debeCelebrarNivel(null, 1)).toBe(false);
  });

  it("celebra un ascenso normal", () => {
    expect(debeCelebrarNivel(3, 4)).toBe(true);
  });

  it("celebra un doble ascenso, que una misión larga puede dar de una vez", () => {
    expect(debeCelebrarNivel(3, 5)).toBe(true);
  });

  it("no celebra si el nivel no cambió", () => {
    expect(debeCelebrarNivel(4, 4)).toBe(false);
  });

  it("no celebra si el nivel baja", () => {
    expect(debeCelebrarNivel(9, 2)).toBe(false);
  });

  it("no celebra un salto propio de una partida importada", () => {
    expect(debeCelebrarNivel(1, 12)).toBe(false);
    expect(debeCelebrarNivel(1, 1 + SALTO_MAXIMO_CELEBRABLE + 1)).toBe(false);
  });

  it("el límite es inclusivo", () => {
    expect(debeCelebrarNivel(5, 5 + SALTO_MAXIMO_CELEBRABLE)).toBe(true);
  });
});
