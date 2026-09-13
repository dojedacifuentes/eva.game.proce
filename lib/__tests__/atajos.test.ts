import { describe, it, expect } from "vitest";
import { indiceDeTecla, letraDeOpcion } from "../useAtajosAlternativas";

describe("letraDeOpcion", () => {
  it("numera desde la A", () => {
    expect(letraDeOpcion(0)).toBe("A");
    expect(letraDeOpcion(3)).toBe("D");
  });
});

describe("indiceDeTecla", () => {
  it("acepta el número de la opción", () => {
    expect(indiceDeTecla("1", 4)).toBe(0);
    expect(indiceDeTecla("4", 4)).toBe(3);
  });

  it("acepta la letra, en mayúscula o minúscula", () => {
    expect(indiceDeTecla("a", 4)).toBe(0);
    expect(indiceDeTecla("C", 4)).toBe(2);
  });

  it("rechaza lo que se sale del número de opciones", () => {
    expect(indiceDeTecla("5", 4)).toBe(-1);
    expect(indiceDeTecla("e", 4)).toBe(-1);
  });

  it("rechaza el cero: las opciones se cuentan desde uno", () => {
    expect(indiceDeTecla("0", 4)).toBe(-1);
  });

  it("rechaza teclas que no son de opción", () => {
    expect(indiceDeTecla("Enter", 4)).toBe(-1);
    expect(indiceDeTecla(" ", 4)).toBe(-1);
    expect(indiceDeTecla("ArrowRight", 4)).toBe(-1);
    expect(indiceDeTecla("-", 4)).toBe(-1);
  });

  it("no pasa de nueve opciones: no hay tecla para la décima", () => {
    expect(indiceDeTecla("9", 12)).toBe(8);
    expect(indiceDeTecla("j", 12)).toBe(-1);
  });

  it("sin opciones no acepta nada", () => {
    expect(indiceDeTecla("1", 0)).toBe(-1);
    expect(indiceDeTecla("a", 0)).toBe(-1);
  });
});
