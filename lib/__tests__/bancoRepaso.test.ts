import { describe, it, expect } from "vitest";
import { preguntaDe, preguntasDe, totalRepasables, idCedula, idVoF } from "../bancoRepaso";
import { PREGUNTAS_CEDULA } from "@/data/cedula";
import { BANCO_VOF } from "@/data/preguntas-vof";
import { ALTERNATIVAS_DIFICIL } from "@/data/examen-extendido";

describe("banco de repaso", () => {
  it("reúne los tres bancos sin perder preguntas", () => {
    const esperado = PREGUNTAS_CEDULA.length + BANCO_VOF.length + ALTERNATIVAS_DIFICIL.length;
    // Si dos preguntas tuvieran el mismo texto en el mismo banco compartirían
    // id y el total bajaría. Que cuadre significa que no hay duplicados.
    expect(totalRepasables()).toBe(esperado);
  });

  it("resuelve una pregunta de la cédula por su id", () => {
    const primera = PREGUNTAS_CEDULA[0];
    const p = preguntaDe(idCedula(primera.q));
    expect(p?.enunciado).toBe(primera.q);
    expect(p?.opciones[p.correcta]).toBe(primera.opciones[primera.correcta]);
    expect(p?.fuente).toBe("cedula");
  });

  it("convierte el verdadero/falso en dos alternativas, con la correcta bien puesta", () => {
    const verdadera = BANCO_VOF.find((q) => q.respuesta === true)!;
    const falsa = BANCO_VOF.find((q) => q.respuesta === false)!;
    expect(preguntaDe(idVoF(verdadera.enunciado))?.opciones[0]).toBe("Verdadero");
    expect(preguntaDe(idVoF(verdadera.enunciado))?.correcta).toBe(0);
    expect(preguntaDe(idVoF(falsa.enunciado))?.correcta).toBe(1);
  });

  it("en las alternativas de grado la letra correcta apunta a la opción correcta", () => {
    for (const a of ALTERNATIVAS_DIFICIL) {
      const p = preguntaDe(`alternativa:${a.id}`);
      expect(p, `falta ${a.id}`).toBeTruthy();
      const textoEsperado = a.opciones.find((o) => o.letra === a.correcta)?.texto;
      expect(p!.opciones[p!.correcta]).toBe(textoEsperado);
    }
  });

  it("toda pregunta tiene enunciado, al menos dos opciones y una correcta válida", () => {
    for (const id of [...PREGUNTAS_CEDULA.map((q) => idCedula(q.q)),
                      ...BANCO_VOF.map((q) => idVoF(q.enunciado)),
                      ...ALTERNATIVAS_DIFICIL.map((a) => `alternativa:${a.id}`)]) {
      const p = preguntaDe(id)!;
      expect(p.enunciado.length, id).toBeGreaterThan(3);
      expect(p.opciones.length, id).toBeGreaterThanOrEqual(2);
      expect(p.correcta, id).toBeGreaterThanOrEqual(0);
      expect(p.correcta, id).toBeLessThan(p.opciones.length);
    }
  });

  it("un id que ya no existe se descarta en vez de romper la pantalla", () => {
    expect(preguntaDe("vof:noexiste")).toBeUndefined();
    const reales = PREGUNTAS_CEDULA.slice(0, 2).map((q) => idCedula(q.q));
    expect(preguntasDe([...reales, "cedula:retirada"]).length).toBe(2);
  });
});
