import { describe, it, expect } from "vitest";
import {
  idEstable, sumarDias, registrarResultado, toca, pendientes, resumen,
  INTERVALOS, NIVEL_APRENDIDA, type FichaRepaso,
} from "../repaso";

const ficha = (p: Partial<FichaRepaso> = {}): FichaRepaso => ({
  id: "vof:x", nivel: 0, proximo: "2026-09-14", fallos: 1, aciertos: 0, ...p,
});

describe("idEstable", () => {
  it("el mismo texto da siempre el mismo id", () => {
    expect(idEstable("vof", "El art. 134 COT")).toBe(idEstable("vof", "El art. 134 COT"));
  });

  it("textos distintos dan ids distintos", () => {
    expect(idEstable("vof", "uno")).not.toBe(idEstable("vof", "dos"));
  });

  it("la fuente separa bancos: la misma frase en dos bancos no se mezcla", () => {
    expect(idEstable("vof", "misma")).not.toBe(idEstable("cedula", "misma"));
  });

  it("no depende de la posición en el banco", () => {
    const banco = ["a", "b", "c"];
    const antes = banco.map((t) => idEstable("vof", t));
    const despues = [...banco].reverse().map((t) => idEstable("vof", t));
    expect(new Set(antes)).toEqual(new Set(despues));
  });
});

describe("sumarDias", () => {
  it("suma dentro del mes", () => {
    expect(sumarDias("2026-09-13", 3)).toBe("2026-09-16");
  });

  it("cruza el fin de mes", () => {
    expect(sumarDias("2026-09-29", 3)).toBe("2026-10-02");
  });

  it("cruza el fin de año", () => {
    expect(sumarDias("2026-12-30", 7)).toBe("2027-01-06");
  });

  it("cuenta el 29 de febrero de un bisiesto", () => {
    expect(sumarDias("2028-02-28", 1)).toBe("2028-02-29");
  });

  it("salta el 29 de febrero en un año que no lo tiene", () => {
    expect(sumarDias("2027-02-28", 1)).toBe("2027-03-01");
  });
});

describe("registrarResultado", () => {
  it("acertar algo nunca fallado no crea ficha", () => {
    expect(registrarResultado(undefined, "vof:x", true, "2026-09-13")).toBeNull();
  });

  it("fallar por primera vez abre la ficha para mañana", () => {
    const f = registrarResultado(undefined, "vof:x", false, "2026-09-13")!;
    expect(f.nivel).toBe(0);
    expect(f.fallos).toBe(1);
    expect(f.proximo).toBe(sumarDias("2026-09-13", INTERVALOS[0]));
  });

  it("acertar sube de nivel y aleja el repaso", () => {
    const f1 = registrarResultado(ficha(), "vof:x", true, "2026-09-14")!;
    expect(f1.nivel).toBe(1);
    expect(f1.aciertos).toBe(1);
    expect(f1.proximo).toBe(sumarDias("2026-09-14", INTERVALOS[1]));

    const f2 = registrarResultado(f1, "vof:x", true, "2026-09-17")!;
    expect(f2.nivel).toBe(2);
    expect(f2.proximo).toBe(sumarDias("2026-09-17", INTERVALOS[2]));
  });

  it("volver a fallar la devuelve al principio", () => {
    const avanzada = ficha({ nivel: 3, aciertos: 3, proximo: "2026-10-01" });
    const f = registrarResultado(avanzada, "vof:x", false, "2026-09-20")!;
    expect(f.nivel).toBe(0);
    expect(f.fallos).toBe(2);
    expect(f.aciertos).toBe(3); // los aciertos pasados no se borran
    expect(f.proximo).toBe(sumarDias("2026-09-20", INTERVALOS[0]));
  });

  it("acumular aciertos acaba graduando la ficha", () => {
    let f = ficha();
    let dia = "2026-09-14";
    for (let i = 0; i < INTERVALOS.length + 2; i++) {
      f = registrarResultado(f, "vof:x", true, dia)!;
      dia = f.proximo;
    }
    expect(f.nivel).toBe(NIVEL_APRENDIDA);
    expect(toca(f, "2099-01-01")).toBe(false);
  });
});

describe("toca", () => {
  it("la del día toca", () => {
    expect(toca(ficha({ proximo: "2026-09-13" }), "2026-09-13")).toBe(true);
  });

  it("la atrasada también", () => {
    expect(toca(ficha({ proximo: "2026-09-01" }), "2026-09-13")).toBe(true);
  });

  it("la futura no", () => {
    expect(toca(ficha({ proximo: "2026-09-20" }), "2026-09-13")).toBe(false);
  });

  it("una aprendida no vuelve nunca", () => {
    expect(toca(ficha({ nivel: NIVEL_APRENDIDA, proximo: "2020-01-01" }), "2026-09-13")).toBe(false);
  });
});

describe("pendientes", () => {
  it("sin fichas no hay nada que repasar", () => {
    expect(pendientes(undefined, "2026-09-13")).toEqual([]);
    expect(pendientes({}, "2026-09-13")).toEqual([]);
  });

  it("aguanta un guardado con basura dentro sin reventar", () => {
    const sucio = { a: null, b: "texto", c: ficha({ id: "vof:c", proximo: "2026-09-01" }) } as never;
    expect(pendientes(sucio, "2026-09-13").map((f) => f.id)).toEqual(["vof:c"]);
  });

  it("primero las más falladas", () => {
    const fichas = {
      poco: ficha({ id: "poco", fallos: 1, proximo: "2026-09-10" }),
      mucho: ficha({ id: "mucho", fallos: 5, proximo: "2026-09-12" }),
    };
    expect(pendientes(fichas, "2026-09-13").map((f) => f.id)).toEqual(["mucho", "poco"]);
  });

  it("a igualdad de fallos, primero la más atrasada", () => {
    const fichas = {
      nueva: ficha({ id: "nueva", fallos: 2, proximo: "2026-09-13" }),
      vieja: ficha({ id: "vieja", fallos: 2, proximo: "2026-09-02" }),
    };
    expect(pendientes(fichas, "2026-09-13").map((f) => f.id)).toEqual(["vieja", "nueva"]);
  });
});

describe("resumen", () => {
  it("cuenta pendientes, mazo y aprendidas", () => {
    const fichas = {
      a: ficha({ id: "a", proximo: "2026-09-10" }),
      b: ficha({ id: "b", proximo: "2026-09-30" }),
      c: ficha({ id: "c", nivel: NIVEL_APRENDIDA, proximo: "2026-01-01" }),
    };
    expect(resumen(fichas, "2026-09-13")).toEqual({ pendientes: 1, enMazo: 2, aprendidas: 1 });
  });

  it("sin guardado devuelve ceros en vez de fallar", () => {
    expect(resumen(undefined, "2026-09-13")).toEqual({ pendientes: 0, enMazo: 0, aprendidas: 0 });
  });
});
