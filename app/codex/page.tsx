"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ARTICULOS_DESTACADOS, TABLA_RECURSOS, EXCEPCIONES_DILATORIAS, MEDIOS_PRUEBA, TITULOS_EJECUTIVOS, CLASIFICACION_RESOLUCIONES } from "@/lib/reglas";
import GameShell from "@/components/shell/GameShell";

const TEMAS: { titulo: string; cuerpo: string; tags: string[] }[] = [
  { titulo: "Jurisdicción (art. 76 CPR / 1 COT)", cuerpo: "Facultad pública de conocer las causas civiles y criminales, juzgarlas y hacer ejecutar lo juzgado. Es función estatal, exclusiva, indelegable, inavocable, improrrogable en lo absoluto, una en su esencia y territorial.", tags: ["jurisdiccion", "76 CPR", "1 COT"] },
  { titulo: "Competencia absoluta", cuerpo: "Es de orden público, improrrogable. Factores: materia (130-133 COT), fuero (50, 168 COT), cuantía (115-129 COT). Su falta es alegable de oficio y de parte (en cualquier estado).", tags: ["competencia", "absoluta", "materia", "fuero", "cuantia"] },
  { titulo: "Competencia relativa (territorio)", cuerpo: "Renunciable y prorrogable expresa o tácitamente (arts. 181-187 COT). Regla general: domicilio del demandado (art. 134). Prorroga tácita: actor concurre ante tribunal incompetente y demandado contesta sin reclamarla.", tags: ["competencia", "relativa", "territorio", "134"] },
  { titulo: "Requisitos de la demanda (art. 254 CPC)", cuerpo: "Cinco requisitos: (1) tribunal; (2) demandante; (3) demandado; (4) exposición clara de hechos y fundamentos de derecho; (5) peticiones precisas en la conclusión.", tags: ["demanda", "254"] },
  { titulo: "Emplazamiento y notificaciones", cuerpo: "Emplazamiento = notificación válida + plazo. Formas: personal (40), personal subsidiaria (44), cédula (48), estado diario (50), avisos (54). Su omisión causa nulidad (768 N°9).", tags: ["emplazamiento", "40", "44", "48"] },
  { titulo: "Plazos para contestar", cuerpo: "Mismo lugar: 15 días (258). Mismo territorio: 15 + 3 (258 inc. 2°). Fuera del territorio: 15 + tabla emplazamiento (259).", tags: ["plazos", "258", "259"] },
  { titulo: "Excepciones dilatorias (art. 303)", cuerpo: "Seis numerales taxativos: incompetencia, falta de capacidad/personería, litispendencia, ineptitud del libelo, beneficio de excusión, otras de corrección. Plazo: dentro del término para contestar, todas en un mismo escrito (305).", tags: ["dilatorias", "303"] },
  { titulo: "Excepciones perentorias anómalas (art. 310)", cuerpo: "Prescripción, cosa juzgada, transacción y pago efectivo de la deuda (con antecedente escrito). Se pueden oponer en cualquier estado del juicio hasta antes de la citación a oír sentencia en 1ª instancia y hasta antes de la vista en 2ª.", tags: ["perentorias", "310"] },
  { titulo: "Conciliación obligatoria (arts. 262-268)", cuerpo: "Tras la dúplica el juez cita a conciliación, salvo excepciones del 313 inc. 1°. El acta total o parcial vale como sentencia ejecutoriada (267).", tags: ["conciliacion", "262"] },
  { titulo: "Auto de prueba (art. 318)", cuerpo: "Recibe la causa a prueba si hay hechos sustanciales, pertinentes y controvertidos. Se notifica por cédula. Reposición especial: 3 días con apelación subsidiaria (319, 326).", tags: ["prueba", "318", "319"] },
  { titulo: "Término probatorio", cuerpo: "Ordinario: 20 días (328). Extraordinario fuera del tribunal/del territorio: 329-330. Especial por entorpecimiento: 339.", tags: ["termino probatorio", "328", "339"] },
  { titulo: "Medios de prueba (arts. 341-427)", cuerpo: "Instrumental (342-355), testimonial (356-384), confesión/absolución de posiciones (385-402), inspección personal del tribunal (403-408), informe de peritos (409-425), presunciones (426-427).", tags: ["medios prueba", "341"] },
  { titulo: "Sentencia definitiva (158, 170)", cuerpo: "Pone fin a la instancia resolviendo la cuestión. Requisitos del 170 + Auto Acordado 1920. Plazo para fallar: 60 días desde citación a oír sentencia (162).", tags: ["sentencia", "170", "162"] },
  { titulo: "Recursos — cuadro general", cuerpo: "Aclaración/rectificación/enmienda (182), reposición ordinaria (181), reposición especial (319, 201, 212, 778, 781), apelación (187), apelación subsidiaria (188), hecho verdadero (203), hecho falso (196), casación en la forma (766), casación en el fondo (767), queja (545 COT), revisión (810).", tags: ["recursos"] },
  { titulo: "Causales de casación en la forma (art. 768)", cuerpo: "Nueve causales tasadas: incompetencia, ultra petita, contradicción, falta de fundamento (omisión 170), falta de emplazamiento, no recepción de la causa a prueba, sentencia dada por menor cantidad de jueces, juez inhabilitado, cosa juzgada.", tags: ["casacion forma", "768"] },
  { titulo: "Juicio ejecutivo (arts. 434-478)", cuerpo: "Requiere título ejecutivo con obligación líquida, actualmente exigible y no prescrita. Cuadernos: principal y apremio. Excepciones taxativas del 464.", tags: ["ejecutivo", "434", "464"] },
  { titulo: "Cautelares (arts. 273-302)", cuerpo: "Prejudiciales (273-289) y precautorias propiamente tales (290-302). Tipos del 290: secuestro, interventor, retención, prohibición de celebrar actos. Innominadas: 298 inc. 2°. Las prejudiciales precautorias caducan si en 10 días no se entabla demanda (art. 280).", tags: ["cautelares", "290", "280"] },
  { titulo: "Juicio sumario (arts. 680-692)", cuerpo: "Procede en los casos del art. 680: por naturaleza (acciones que requieren tramitación rápida) o por enumeración (interdictos, cobro de honorarios, ejecución de obligaciones de hacer, juicios de comodato precario, etc.). Audiencia única al 5° día (683). Si rebeldía: el tribunal recibe la prueba o accede provisionalmente a lo pedido (684). Sentencia: 10 días desde citación (688). Sustitución de procedimiento: 681.", tags: ["sumario", "680", "683", "688"] },
  { titulo: "Procedimientos de mínima/menor cuantía", cuerpo: "Menor cuantía: > 10 UTM y ≤ 500 UTM (CPC 698-702). Mínima cuantía: ≤ 10 UTM, procedimiento verbal único, sentencia en única instancia (CPC 703-738).", tags: ["menor cuantia", "minima cuantia", "703"] },
  { titulo: "Causales de casación en la forma (art. 768)", cuerpo: "9 causales tasadas: (1) incompetencia o integración con jueces inhábiles; (2) faltar el tribunal el quórum; (3) preterición de un trámite esencial; (4) ultra petita o decisión contradictoria; (5) omisión de los requisitos del 170; (6) cosa juzgada; (7) decisiones contradictorias; (8) sentencia dada contra otra ejecutoriada; (9) defectos esenciales del procedimiento (795 en 1ª, 800 en 2ª). Preparación del recurso: art. 769.", tags: ["768", "casacion forma", "769"] },
  { titulo: "Trámites esenciales (art. 795)", cuerpo: "En primera instancia: emplazamiento del demandado en forma; llamado a conciliación; recepción de la causa a prueba; práctica de las diligencias decretadas; agregación a los autos; citación para alguna diligencia de prueba; citación para oír sentencia. Su omisión funda casación en la forma N°9.", tags: ["795", "tramites esenciales", "768 n9"] },
  { titulo: "Acción de petición de herencia y procesal", cuerpo: "Aunque sustantiva (1264 CC), se tramita en juicio ordinario. Plazo prescriptivo de 10 años extintiva (1269 CC). El heredero putativo posee posesión legal según art. 700 CC y 19.903.", tags: ["peticion herencia", "1264", "1269"] },
  { titulo: "Abandono del procedimiento (arts. 152-157)", cuerpo: "Se entiende abandonado si todas las partes cesaron en su prosecución durante seis meses, contados desde la última resolución recaída en gestión útil. Lo declara el juez a petición de cualquier parte. NO extingue las acciones, solo las gestiones obradas. No procede en juicios de quiebra, división de cosa común y demás señalados en el 157.", tags: ["abandono", "152", "157"] },
  { titulo: "Comparecencia en juicio (Ley 18.120)", cuerpo: "Toda gestión judicial debe ser patrocinada por abogado habilitado (art. 1). El mandato judicial puede otorgarse: (a) por escritura pública; (b) por escrito firmado autorizado por secretario; (c) por declaración escrita firmada por el mandante y mandatario ante secretario (art. 4).", tags: ["comparecencia", "18.120", "patrocinio", "mandato"] },
  { titulo: "Incidentes — clases y reglas", cuerpo: "Ordinarios (82-91 CPC). Especiales: nulidad procesal (83), acumulación (92-100), cuestiones de competencia (101-112), implicancias y recusaciones (113-128), privilegio de pobreza (129-137), costas (138-147), desistimiento (148-151), abandono (152-157). Tramitación: 3 días traslado, 8 días prueba.", tags: ["incidentes", "82", "83", "nulidad procesal"] },
  { titulo: "Nulidad procesal (art. 83)", cuerpo: "Procede cuando se ha incurrido en una violación de las formas establecidas por la ley que cause un perjuicio reparable solo con la declaración de nulidad. Debe pedirse dentro de 5 días desde que aparezca o se acredite que se tuvo conocimiento del vicio. La nulidad declarada del 768 N°9 actúa por casación.", tags: ["nulidad procesal", "83", "perjuicio"] },
  { titulo: "Prescripción y caducidad procesal", cuerpo: "Casación: depende del recurso (770 plazos). Apelación: 5/10 días (189). Recurso de hecho: 5 días (203). Revisión: 1 año desde firme (811). Abandono: 6 meses. La caducidad opera de pleno derecho; la prescripción requiere alegación.", tags: ["plazos", "prescripcion", "caducidad"] },
  { titulo: "Pluralidad de partes", cuerpo: "Litisconsorcio: necesario (varios sujetos deben demandar/ser demandados conjuntamente por la naturaleza del derecho) o voluntario/facultativo. Art. 18 CPC: en un mismo juicio pueden intervenir como demandantes o demandados varias personas si deducen la misma acción, conexa o derivada del mismo hecho.", tags: ["litisconsorcio", "18 CPC", "pluralidad partes"] },
  { titulo: "Intervención de terceros", cuerpo: "Coadyuvante: comparece en apoyo de una parte (art. 23). Independiente: hace valer derechos propios incompatibles. Excluyente: pretensión propia incompatible con ambas partes (22). Tercero coadyuvante adquiere los autos en el estado en que se encuentren.", tags: ["tercerias", "22", "23", "terceros"] },
  { titulo: "Costas (arts. 138-147)", cuerpo: "Personales (honorarios abogado, peritos) y procesales (gastos del juicio). Tipos: costas a la parte vencida total o parcialmente; condena con motivo plausible; relevadas por el tribunal. Tasación a cargo del secretario o tribunal.", tags: ["costas", "138", "144"] },
  { titulo: "Recurso de aclaración, rectificación o enmienda (art. 182)", cuerpo: "Una vez notificada la sentencia, el tribunal NO puede alterarla, salvo para: aclarar puntos oscuros o dudosos, salvar omisiones, rectificar errores de copia, referencia o cálculo numérico. No suspende la ejecución salvo que se ordene expresamente.", tags: ["182", "aclaracion"] },
  { titulo: "Reposición especial — casos del CPC", cuerpo: "Casos del 319 (auto de prueba: 3 días con apelación subsidiaria), 201 y 212 (admisibilidad de apelación), 778 y 781 (admisibilidad de casación). Distinta de la ordinaria del 181 que aplica a autos y decretos.", tags: ["reposicion especial", "319"] },
  { titulo: "Avenimiento y conciliación", cuerpo: "Avenimiento: acuerdo de las partes antes o durante el juicio, presentado al tribunal. Conciliación: llamado del juez ex officio o a petición (262); el acta total/parcial vale como sentencia ejecutoriada (267).", tags: ["avenimiento", "conciliacion", "267"] },
  { titulo: "Recurso de queja (art. 545 COT)", cuerpo: "Disciplinario. Procede solo contra sentencias definitivas o interlocutorias que pongan fin al juicio o hagan imposible su continuación, dictadas por jueces o funcionarios judiciales con falta o abuso grave. Subsidiario (sin otro recurso disponible). Excepción: sentencias definitivas de árbitros arbitradores admiten queja aunque haya casación en la forma.", tags: ["queja", "545", "arbitradores"] },
];

export default function Codex() {
  const [q, setQ] = useState("");
  const filtrados = useMemo(
    () => TEMAS.filter((t) =>
      !q || t.titulo.toLowerCase().includes(q.toLowerCase()) ||
      t.cuerpo.toLowerCase().includes(q.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q.toLowerCase()))
    ),
    [q]
  );

  return (
    <GameShell variant="reader" eyebrow="Referencia" title="Codex" back={{ href: "/mundos", label: "Mundos" }} scrollLabel="Artículos y cuadros del Codex">
      <div className="min-h-screen px-6 py-10 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <div className="tag mb-2">CODEX PROCESAL</div>
          <h1 className="label-art text-3xl text-zona-notificaciones">Articulado mínimo y temas clave</h1>
        </div>
      </div>

      {/* El marcador de posición no es una etiqueta: desaparece al escribir y
          los lectores de pantalla no lo anuncian de forma fiable. */}
      <label htmlFor="buscador-codex" className="sr-only">
        Buscar en el Codex por artículo, recurso o etapa
      </label>
      <input
        id="buscador-codex"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar: artículo, recurso, etapa..."
        className="w-full bg-ink-700 border border-neon-blue/30 p-3 mb-4 focus:outline-none focus:border-neon-blue"
      />

      <div className="terminal p-4 mb-6">
        <div className="label-art text-neon-violet mb-2 text-sm">Artículos destacados ({ARTICULOS_DESTACADOS.length})</div>
        <div className="grid sm:grid-cols-2 gap-1 text-xs">
          {ARTICULOS_DESTACADOS.map((a) => (
            <div key={a.n}><b className="text-zona-competencia">{a.n}</b> — {a.t}</div>
          ))}
        </div>
      </div>

      <div className="terminal p-4 mb-6">
        <div className="label-art text-neon-violet mb-2 text-sm">Resoluciones judiciales (art. 158 CPC)</div>
        <div className="text-xs space-y-2">
          {CLASIFICACION_RESOLUCIONES.map((r) => (
            <div key={r.tipo} className="border-b border-ink-400 pb-2">
              <b className="text-zona-competencia">{r.tipo.replace(/_/g, " ")}</b> — {r.definicion}
              <span className="tag tag-violet ml-2">{r.articulo}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="terminal p-4 mb-6">
        <div className="label-art text-neon-violet mb-2 text-sm">Cuadro de recursos</div>
        <div className="text-xs space-y-2">
          {TABLA_RECURSOS.map((r) => (
            <details key={r.recurso} className="border-b border-ink-400 pb-2">
              <summary className="cursor-pointer"><b className="text-zona-competencia">{r.nombre}</b> · <span className="tag tag-violet">{r.articulo}</span></summary>
              <p className="mt-1 text-doc-aged/80">{r.descripcion}</p>
              <p className="mt-1 text-doc-aged/60">Plazo: {r.plazoDias} días · Conoce: {r.tribunalQueConoce} · Efectos: {r.efectos}</p>
            </details>
          ))}
        </div>
      </div>

      <div className="terminal p-4 mb-6">
        <div className="label-art text-neon-violet mb-2 text-sm">Medios probatorios</div>
        <div className="text-xs space-y-2">
          {MEDIOS_PRUEBA.map((m) => (
            <div key={m.medio} className="border-b border-ink-400 pb-2">
              <b className="text-zona-competencia">{m.nombre}</b> — {m.valor}
              <span className="tag tag-violet ml-2">{m.arts}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="terminal p-4 mb-6">
        <div className="label-art text-neon-violet mb-2 text-sm">Excepciones dilatorias (art. 303 CPC)</div>
        <ul className="text-xs space-y-1">
          {EXCEPCIONES_DILATORIAS.map((e) => <li key={e.n}>{e.n}. {e.t}</li>)}
        </ul>
      </div>

      <div className="terminal p-4 mb-6">
        <div className="label-art text-neon-violet mb-2 text-sm">Títulos ejecutivos (art. 434 CPC)</div>
        <ul className="text-xs space-y-1">
          {TITULOS_EJECUTIVOS.map((t) => <li key={t.n}>{t.n}. {t.t}</li>)}
        </ul>
      </div>

      <div className="space-y-3">
        {filtrados.map((t) => (
          <details key={t.titulo} className="terminal p-4">
            <summary className="label-art text-zona-competencia cursor-pointer">{t.titulo}</summary>
            <p className="mt-2 text-doc-aged/80 text-sm leading-relaxed">{t.cuerpo}</p>
            <div className="mt-2 flex gap-1 flex-wrap">
              {t.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
            </div>
          </details>
        ))}
        {filtrados.length === 0 && <p className="text-doc-aged/40 italic">Sin resultados para "{q}".</p>}
      </div>
    </div>
    </GameShell>
  );
}
