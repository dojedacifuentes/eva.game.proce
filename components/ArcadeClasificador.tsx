"use client";
import { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/store/useGame";
import { shuffleOptions } from "@/lib/shuffleOptions";
import { fx } from "@/lib/fx";
import { sfx } from "@/lib/audio";
import { haptica } from "@/lib/haptica";
import { useCallbackRef } from "@/lib/useCallbackRef";
import { useAvanceAutomatico } from "@/lib/useAvanceAutomatico";
import PistaAvance from "./shell/PistaAvance";

/** Esperas entre preguntas: máximos adelantables, no tiempos impuestos. */
const ESPERA_ACIERTO = 900;
const ESPERA_FALLO = 1600;

// ============================================================================
// CLASIFICADOR ARCADE — minijuego rápido con combo/multiplicador/streak
// Mezcla resoluciones (158 CPC), recursos (181-810), excepciones (303, 310),
// competencia (45-148 COT). Velocidad creciente. Tensión real.
// ============================================================================

type Cuestion = {
  enunciado: string;
  opciones: { texto: string; correcta: boolean }[];
  art: string;
  rama: "resoluciones" | "recursos" | "excepciones" | "competencia" | "notificaciones" | "ejecutivo";
};

const BANCO: Cuestion[] = [
  // RESOLUCIONES (art. 158)
  { rama: "resoluciones", art: "Art. 158 inc. final CPC", enunciado: "'Téngase presente'", opciones: [
    { texto: "Decreto / providencia / proveído", correcta: true },
    { texto: "Auto", correcta: false },
    { texto: "Interlocutoria 1° grado", correcta: false },
    { texto: "Sentencia definitiva", correcta: false },
  ]},
  { rama: "resoluciones", art: "Art. 158 inc. 2° CPC", enunciado: "'Recíbase la causa a prueba. Hechos: 1) fecha del contrato; 2) recepción'", opciones: [
    { texto: "Interlocutoria de 1° grado", correcta: true },
    { texto: "Auto", correcta: false },
    { texto: "Decreto", correcta: false },
  ]},
  { rama: "resoluciones", art: "Art. 158 inc. 1° CPC", enunciado: "Resolución que pone fin a la instancia resolviendo la cuestión", opciones: [
    { texto: "Sentencia definitiva", correcta: true },
    { texto: "Interlocutoria 2° grado", correcta: false },
    { texto: "Auto", correcta: false },
  ]},
  { rama: "resoluciones", art: "Art. 158 inc. 3° CPC", enunciado: "Resolución que falla incidente SIN establecer derechos permanentes", opciones: [
    { texto: "Auto", correcta: true },
    { texto: "Interlocutoria 1° grado", correcta: false },
    { texto: "Decreto", correcta: false },
  ]},
  // RECURSOS
  { rama: "recursos", art: "Art. 181 CPC", enunciado: "Recurso contra autos y decretos (regla general)", opciones: [
    { texto: "Reposición ordinaria (5 días)", correcta: true },
    { texto: "Apelación", correcta: false },
    { texto: "Casación en la forma", correcta: false },
  ]},
  { rama: "recursos", art: "Art. 187 CPC", enunciado: "Recurso contra sentencias definitivas e interlocutorias de 1ª instancia", opciones: [
    { texto: "Apelación", correcta: true },
    { texto: "Reposición", correcta: false },
    { texto: "Queja", correcta: false },
  ]},
  { rama: "recursos", art: "Art. 766 CPC", enunciado: "Recurso por vicio in procedendo del 768", opciones: [
    { texto: "Casación en la forma", correcta: true },
    { texto: "Casación en el fondo", correcta: false },
    { texto: "Apelación", correcta: false },
  ]},
  { rama: "recursos", art: "Art. 767 CPC", enunciado: "Recurso por infracción de ley con influencia sustancial en lo dispositivo", opciones: [
    { texto: "Casación en el fondo", correcta: true },
    { texto: "Casación en la forma", correcta: false },
    { texto: "Revisión", correcta: false },
  ]},
  { rama: "recursos", art: "Art. 203 CPC", enunciado: "Tribunal a quo DENIEGA una apelación que debía concederse", opciones: [
    { texto: "Hecho verdadero", correcta: true },
    { texto: "Hecho falso", correcta: false },
    { texto: "Reposición especial", correcta: false },
  ]},
  { rama: "recursos", art: "Art. 196 CPC", enunciado: "Tribunal a quo CONCEDE apelación improcedente o con efecto incorrecto", opciones: [
    { texto: "Hecho falso", correcta: true },
    { texto: "Hecho verdadero", correcta: false },
  ]},
  { rama: "recursos", art: "Art. 545 COT", enunciado: "Sentencia definitiva sin otro recurso disponible (ordinario o extraordinario)", opciones: [
    { texto: "Queja", correcta: true },
    { texto: "Revisión", correcta: false },
    { texto: "Casación de oficio", correcta: false },
  ]},
  { rama: "recursos", art: "Art. 810 CPC", enunciado: "Sentencia firme ganada por cohecho/violencia/documento falso", opciones: [
    { texto: "Revisión", correcta: true },
    { texto: "Queja", correcta: false },
    { texto: "Casación fondo", correcta: false },
  ]},
  // EXCEPCIONES
  { rama: "excepciones", art: "Art. 303 N°1 CPC", enunciado: "Incompetencia del tribunal", opciones: [
    { texto: "Excepción dilatoria", correcta: true },
    { texto: "Excepción perentoria", correcta: false },
    { texto: "Excepción mixta", correcta: false },
  ]},
  { rama: "excepciones", art: "Art. 303 N°4 CPC", enunciado: "Ineptitud del libelo (falta de requisitos formales del 254)", opciones: [
    { texto: "Dilatoria", correcta: true },
    { texto: "Perentoria", correcta: false },
  ]},
  { rama: "excepciones", art: "Art. 310 CPC", enunciado: "Prescripción / cosa juzgada / transacción / pago (con antecedente escrito)", opciones: [
    { texto: "Perentorias anómalas (cualquier estado hasta citación a oír sentencia)", correcta: true },
    { texto: "Dilatorias", correcta: false },
    { texto: "Mixtas", correcta: false },
  ]},
  // COMPETENCIA
  { rama: "competencia", art: "Art. 134 COT", enunciado: "Regla general de competencia relativa para demandas civiles", opciones: [
    { texto: "Domicilio del demandado", correcta: true },
    { texto: "Domicilio del demandante", correcta: false },
    { texto: "Lugar del contrato", correcta: false },
  ]},
  { rama: "competencia", art: "Art. 50 COT", enunciado: "Fuero mayor: demanda civil contra un Ministro de Estado", opciones: [
    { texto: "Ministro de Corte de Apelaciones", correcta: true },
    { texto: "Juzgado de Letras común", correcta: false },
    { texto: "Corte Suprema", correcta: false },
  ]},
  { rama: "competencia", art: "Art. 187 COT", enunciado: "Contestación sin alegar incompetencia relativa", opciones: [
    { texto: "Prórroga tácita de competencia", correcta: true },
    { texto: "Nulidad procesal", correcta: false },
    { texto: "Casación in procedendo", correcta: false },
  ]},
  // NOTIFICACIONES
  { rama: "notificaciones", art: "Art. 40 CPC", enunciado: "Regla general de notificación al demandado", opciones: [
    { texto: "Personal", correcta: true },
    { texto: "Por cédula", correcta: false },
    { texto: "Por estado diario", correcta: false },
  ]},
  { rama: "notificaciones", art: "Art. 44 CPC", enunciado: "Notificado buscado en 2 días distintos, no habido, presente en el lugar", opciones: [
    { texto: "Personal subsidiaria (entrega de cédula)", correcta: true },
    { texto: "Por avisos", correcta: false },
    { texto: "Notificación tácita", correcta: false },
  ]},
  { rama: "notificaciones", art: "Art. 48 CPC", enunciado: "Resolución que recibe la causa a prueba se notifica por", opciones: [
    { texto: "Cédula", correcta: true },
    { texto: "Estado diario", correcta: false },
    { texto: "Personal", correcta: false },
  ]},
  // EJECUTIVO
  { rama: "ejecutivo", art: "Art. 434 CPC", enunciado: "Documento que da fuerza ejecutiva sin gestión preparatoria", opciones: [
    { texto: "Sentencia firme / Escritura pública", correcta: true },
    { texto: "Boleta de honorarios", correcta: false },
    { texto: "Recibo simple", correcta: false },
  ]},
  { rama: "ejecutivo", art: "Art. 464 CPC", enunciado: "Excepciones del ejecutado", opciones: [
    { texto: "Taxativas (17 causales)", correcta: true },
    { texto: "Genéricas como en el ordinario", correcta: false },
    { texto: "Solo de fondo", correcta: false },
  ]},

  // ─── PREGUNTAS DIFÍCILES — distractores plausibles ───────────────────────

  // RESOLUCIONES — distinciones finas
  { rama: "resoluciones", art: "Art. 158 inc. 2° CPC", enunciado: "'Traslado al demandado para que conteste en 15 días' — tipo de resolución", opciones: [
    { texto: "Decreto (impulso procesal sin contenido decisorio)", correcta: true },
    { texto: "Interlocutoria de 1° grado (inicia fase)", correcta: false },
    { texto: "Auto (falla incidente)", correcta: false },
  ]},
  { rama: "resoluciones", art: "Art. 158 inc. 2° CPC", enunciado: "Resolución que ESTABLECE DERECHOS PERMANENTES para las partes (interlocutoria)", opciones: [
    { texto: "Interlocutoria de 1° grado", correcta: true },
    { texto: "Interlocutoria de 2° grado", correcta: false },
    { texto: "Auto", correcta: false },
  ]},
  { rama: "resoluciones", art: "Art. 158 CPC", enunciado: "Resolución 'Pone término al juicio o hace imposible su continuación'", opciones: [
    { texto: "Interlocutoria de 2° grado", correcta: true },
    { texto: "Sentencia definitiva", correcta: false },
    { texto: "Interlocutoria de 1° grado", correcta: false },
  ]},
  { rama: "resoluciones", art: "Art. 158 inc. final CPC", enunciado: "'Agréguese a los autos' — tipo de resolución", opciones: [
    { texto: "Decreto / providencia / proveído", correcta: true },
    { texto: "Auto", correcta: false },
    { texto: "Interlocutoria de 1° grado", correcta: false },
  ]},

  // RECURSOS — casos específicos y plazos trampa
  { rama: "recursos", art: "Art. 319 CPC", enunciado: "Plazo para pedir reposición contra el auto de prueba", opciones: [
    { texto: "3 días con apelación subsidiaria", correcta: true },
    { texto: "5 días (reposición ordinaria)", correcta: false },
    { texto: "10 días como el art. 178", correcta: false },
  ]},
  { rama: "recursos", art: "Arts. 766-769 CPC", enunciado: "Para interponer casación en la forma, el recurso debe haber sido...", opciones: [
    { texto: "Preparado (reclamado el vicio en la instancia)", correcta: true },
    { texto: "Anunciado al momento del fallo", correcta: false },
    { texto: "Firmado por el cliente", correcta: false },
  ]},
  { rama: "recursos", art: "Art. 189 CPC", enunciado: "Apelación en contra de sentencias definitivas: plazo para interponerla", opciones: [
    { texto: "15 días hábiles", correcta: true },
    { texto: "10 días", correcta: false },
    { texto: "5 días", correcta: false },
  ]},
  { rama: "recursos", art: "Art. 189 inc. 1° CPC", enunciado: "Plazo para apelar contra sentencias interlocutorias, autos y decretos", opciones: [
    { texto: "5 días hábiles", correcta: true },
    { texto: "15 días", correcta: false },
    { texto: "3 días", correcta: false },
  ]},
  { rama: "recursos", art: "Art. 766 CPC", enunciado: "La casación en la forma procede contra sentencias...", opciones: [
    { texto: "Definitivas e interlocutorias de 2° grado", correcta: true },
    { texto: "Todo tipo de resoluciones", correcta: false },
    { texto: "Solo definitivas", correcta: false },
  ]},

  // EXCEPCIONES — confusiones clásicas
  { rama: "excepciones", art: "Art. 303 N°3 CPC", enunciado: "Litispendencia — clasificación", opciones: [
    { texto: "Dilatoria (demanda idéntica en otro tribunal)", correcta: true },
    { texto: "Perentoria anómala", correcta: false },
    { texto: "Perentoria ordinaria", correcta: false },
  ]},
  { rama: "excepciones", art: "Art. 303 N°5 CPC", enunciado: "Beneficio de excusión — clasificación", opciones: [
    { texto: "Dilatoria N°5", correcta: true },
    { texto: "Perentoria ordinaria", correcta: false },
    { texto: "Mixta", correcta: false },
  ]},
  { rama: "excepciones", art: "Art. 305 CPC", enunciado: "Las excepciones dilatorias deben oponerse...", opciones: [
    { texto: "Todas juntas en un mismo escrito dentro del plazo para contestar", correcta: true },
    { texto: "Antes del auto de prueba", correcta: false },
    { texto: "En cualquier estado hasta la vista", correcta: false },
  ]},

  // NOTIFICACIONES — plazos y requisitos precisos
  { rama: "notificaciones", art: "Art. 46 CPC", enunciado: "Tras notificación personal subsidiaria, carta certificada dentro de...", opciones: [
    { texto: "2 días hábiles", correcta: true },
    { texto: "5 días", correcta: false },
    { texto: "3 días", correcta: false },
  ]},
  { rama: "notificaciones", art: "Art. 48 CPC", enunciado: "Las sentencias definitivas se notifican por...", opciones: [
    { texto: "Cédula", correcta: true },
    { texto: "Estado diario", correcta: false },
    { texto: "Personal siempre", correcta: false },
  ]},

  // EJECUTIVO — distinciones finas del cuaderno
  { rama: "ejecutivo", art: "Art. 458 CPC", enunciado: "Plazo para oponer excepciones en juicio ejecutivo (mismo lugar que tribunal)", opciones: [
    { texto: "4 días hábiles", correcta: true },
    { texto: "10 días", correcta: false },
    { texto: "15 días", correcta: false },
  ]},
  { rama: "ejecutivo", art: "Art. 434 N°7 CPC", enunciado: "Acto de comercio ante dos testigos con firma del deudor — ¿es título ejecutivo?", opciones: [
    { texto: "Sí, cheque protestado por falta de fondos", correcta: false },
    { texto: "Sí, si el deudor no lo tacha de falso en la diligencia", correcta: true },
    { texto: "No, requiere escritura pública", correcta: false },
  ]},
];

const COLOR_RAMA: Record<Cuestion["rama"], string> = {
  resoluciones: "cosajuzgada",
  recursos: "recursos",
  excepciones: "incidentes",
  competencia: "competencia",
  notificaciones: "notificaciones",
  ejecutivo: "ejecutivo",
};

const TIEMPO_BASE = 8; // segundos por pregunta al inicio

export default function ArcadeClasificador() {
  const game = useGame();
  const [activo, setActivo] = useState(false);
  const [cuestionIdx, setCuestionIdx] = useState(0);
  const [orden, setOrden] = useState<number[]>([]);
  const [puntaje, setPuntaje] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [streak, setStreak] = useState(0);
  const [respuestaIdx, setRespuestaIdx] = useState<number | null>(null);
  const [tiempo, setTiempo] = useState(TIEMPO_BASE);
  const [finalizado, setFinalizado] = useState(false);
  const avance = useAvanceAutomatico();
  const tiempoMaximoRef = useRef(TIEMPO_BASE);

  const cuestionActual = activo && !finalizado ? BANCO[orden[cuestionIdx]] : null;

  function iniciar() {
    avance.cancelar();
    const o = [...Array(BANCO.length).keys()].sort(() => Math.random() - 0.5);
    setOrden(o);
    setCuestionIdx(0);
    setPuntaje(0);
    setCombo(0);
    setMaxCombo(0);
    setStreak(0);
    setRespuestaIdx(null);
    setTiempo(TIEMPO_BASE);
    tiempoMaximoRef.current = TIEMPO_BASE;
    setFinalizado(false);
    setActivo(true);
  }

  // Timer. `fallarEstable` tiene identidad fija pero ejecuta siempre el
  // `fallar` del render actual: se puede declarar como dependencia sin que el
  // intervalo se reinicie, y sin quedarse con un combo caducado.
  const fallarEstable = useCallbackRef(() => fallar());
  useEffect(() => {
    if (!activo || finalizado || respuestaIdx !== null || !cuestionActual || avance.pendiente) return;
    const t = setInterval(() => setTiempo((s) => Math.max(0, s - 0.1)), 100);
    return () => clearInterval(t);
  }, [activo, finalizado, respuestaIdx, cuestionActual, avance.pendiente]);

  // Tiempo agotado: una sola vez por pregunta. Antes se llamaba a `fallar()`
  // desde dentro del actualizador de estado y, como al agotarse el tiempo la
  // respuesta seguía sin registrarse, el intervalo seguía vivo y volvía a
  // fallar cada 100 ms, saltando preguntas.
  useEffect(() => {
    if (!activo || finalizado || respuestaIdx !== null || !cuestionActual || avance.pendiente) return;
    if (tiempo > 0) return;
    fallarEstable();
  }, [tiempo, activo, finalizado, respuestaIdx, cuestionActual, avance.pendiente, fallarEstable]);

  function fallar() {
    setRespuestaIdx(-1);
    setCombo(0);
    setStreak(0);
    sfx.error?.();
    haptica.error();
    avance.programar(siguiente, ESPERA_FALLO);
  }

  function responder(idx: number) {
    if (respuestaIdx !== null || !cuestionActual) return;
    const op = cuestionActual.opciones[idx];
    setRespuestaIdx(idx);
    if (op.correcta) {
      fx.reward();
      sfx.combo?.(combo);
      haptica.acierto();
      const multiplicador = 1 + Math.floor(combo / 3); // x1, x2 a las 3, x3 a las 6, ...
      const bonusTiempo = Math.round(tiempo * 10); // bonus por velocidad
      const puntos = 100 * multiplicador + bonusTiempo;
      setPuntaje((p) => p + puntos);
      setCombo((c) => {
        const nuevo = c + 1;
        setMaxCombo((m) => Math.max(m, nuevo));
        return nuevo;
      });
      setStreak((s) => s + 1);
      game.ajustarAtributo("conocimiento_procesal", 0);
    } else {
      fx.shake();
      sfx.error?.();
      haptica.error();
      setCombo(0);
      setStreak(0);
    }
    avance.programar(siguiente, op.correcta ? ESPERA_ACIERTO : ESPERA_FALLO);
  }

  function siguiente() {
    if (cuestionIdx + 1 >= orden.length) {
      finalizar();
      return;
    }
    setCuestionIdx((i) => i + 1);
    setRespuestaIdx(null);
    // Dificultad progresiva: cada 5 preguntas correctas, -0.5s
    const nuevoMax = Math.max(3.5, TIEMPO_BASE - Math.floor(streak / 5) * 0.5);
    tiempoMaximoRef.current = nuevoMax;
    setTiempo(nuevoMax);
  }

  function finalizar() {
    setFinalizado(true);
    setActivo(false);
    const rank = puntaje >= 4000 ? "S" : puntaje >= 2500 ? "A" : puntaje >= 1500 ? "B" : puntaje >= 800 ? "C" : "D";
    game.pushLog(`Arcade completado: ${puntaje} pts · combo x${maxCombo} · rank ${rank}`, "ARCADE");
    if (rank === "S" || rank === "A") {
      fx.success();
      game.desbloquearLogro({ id: `arcade_${rank.toLowerCase()}`, titulo: `Arcade Rank ${rank}`, descripcion: `${puntaje} pts en clasificador arcade`, articulo: "—", desbloqueado: true });
      game.ajustarReputacion(rank === "S" ? 10 : 5);
    } else if (rank === "D") {
      fx.danger();
    }
  }

  // Shuffle opciones de forma estable por pregunta, antes de cualquier return condicional.
  const shuffled = useMemo(
    () => cuestionActual ? shuffleOptions(cuestionActual.opciones, "correcta") : { options: [], correctIndex: -1, originalIndices: [] },
    [cuestionActual]
  );

  // ─────────────────────────────── PANTALLA INICIO
  if (!activo && !finalizado) {
    return (
      <div className="space-y-4">
        <div className="terminal p-6">
          <div className="font-mono-terminal text-[10px] uppercase tracking-[.3em] text-zona-ejecutivo mb-2">MODO ARCADE</div>
          <h2 className="font-display-grave text-3xl text-doc-aged mb-3">Clasificador Procesal</h2>
          <p className="text-doc-aged/60 text-sm font-mono-terminal mb-4">
            Resoluciones · Recursos · Excepciones · Competencia · Notificaciones · Ejecutivo.
            <br />Velocidad creciente. Combo cada 3 aciertos sube el multiplicador. Fallar reinicia el combo.
          </p>
          <div className="grid grid-cols-3 gap-3 text-xs font-mono-terminal mb-5">
            <Stat label="Preguntas" value={BANCO.length} zona="competencia" />
            <Stat label="Tiempo inicial" value={`${TIEMPO_BASE}s`} zona="prueba" />
            <Stat label="Tiempo mínimo" value="3.5s" zona="nulidad" />
          </div>
          <button onClick={iniciar} className="btn btn-recurso text-base px-6 py-3">▶ INSERTAR FICHA</button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────── PANTALLA FINAL
  if (finalizado) {
    const rank = puntaje >= 4000 ? "S" : puntaje >= 2500 ? "A" : puntaje >= 1500 ? "B" : puntaje >= 800 ? "C" : "D";
    const rankColor = rank === "S" ? "var(--zona-recursos)" : rank === "A" ? "var(--zona-prueba)" : rank === "B" ? "var(--zona-cautelares)" : rank === "C" ? "var(--zona-competencia)" : "var(--zona-nulidad)";
    return (
      <div className="terminal p-8 text-center">
        <div className="font-mono-terminal text-[10px] uppercase tracking-[.3em] text-zona-recursos">RESULTADO</div>
        <div className="my-6">
          <div className="font-display-grave text-[10rem] leading-none" style={{ color: rankColor, textShadow: `0 0 40px ${rankColor}` }}>{rank}</div>
        </div>
        <div className="font-display-grave text-5xl text-doc-aged">{puntaje.toLocaleString("es-CL")}</div>
        <div className="text-zona-prueba text-sm mt-2">PUNTAJE FINAL</div>
        <div className="grid grid-cols-2 gap-4 mt-6 max-w-sm mx-auto text-xs">
          <Stat label="Combo máximo" value={`x${maxCombo}`} zona="ejecutivo" />
          <Stat label="Racha más larga" value={streak || maxCombo} zona="cautelares" />
        </div>
        <button onClick={iniciar} className="btn btn-recurso mt-6">↻ NUEVA PARTIDA</button>
      </div>
    );
  }

  // ─────────────────────────────── PANTALLA DE JUEGO
  if (!cuestionActual) return null;
  const colorRama = COLOR_RAMA[cuestionActual.rama];

  const tiempoPct = (tiempo / tiempoMaximoRef.current) * 100;
  const multiplicador = 1 + Math.floor(combo / 3);

  return (
    <div className="space-y-3">
      {/* HUD arcade */}
      <div className="grid grid-cols-4 gap-2 text-xs">
        <div className="zona-card p-2" style={{ "--zona-color": "var(--zona-recursos)" } as React.CSSProperties}>
          <div className="text-[9px] uppercase tracking-widest text-doc-aged/50 font-mono-terminal">SCORE</div>
          <div className="font-display-grave text-xl text-zona-recursos">{puntaje.toLocaleString("es-CL")}</div>
        </div>
        <div className="zona-card p-2" style={{ "--zona-color": "var(--zona-ejecutivo)" } as React.CSSProperties}>
          <div className="text-[9px] uppercase tracking-widest text-doc-aged/50 font-mono-terminal">COMBO</div>
          <div className="font-display-grave text-xl text-zona-ejecutivo">{combo > 0 ? `×${combo}` : "—"}</div>
        </div>
        <div className="zona-card p-2" style={{ "--zona-color": "var(--zona-cautelares)" } as React.CSSProperties}>
          <div className="text-[9px] uppercase tracking-widest text-doc-aged/50 font-mono-terminal">MULT</div>
          <div className="font-display-grave text-xl text-zona-cautelares">{multiplicador}x</div>
        </div>
        <div className="zona-card p-2" style={{ "--zona-color": "var(--zona-oralidad)" } as React.CSSProperties}>
          <div className="text-[9px] uppercase tracking-widest text-doc-aged/50 font-mono-terminal">PREG</div>
          <div className="font-display-grave text-xl text-zona-oralidad">{cuestionIdx + 1}/{BANCO.length}</div>
        </div>
      </div>

      {/* Timer */}
      <div className="h-1.5 bg-bg-deep border border-bg-steel">
        <motion.div
          animate={{ width: `${tiempoPct}%` }}
          transition={{ duration: 0.1, ease: "linear" }}
          className="h-full"
          style={{ background: tiempoPct > 50 ? "var(--zona-cautelares)" : tiempoPct > 25 ? "var(--zona-prueba)" : "var(--zona-nulidad)" }}
        />
      </div>

      {/* Pregunta */}
      <AnimatePresence mode="wait">
        <motion.div
          key={cuestionIdx}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.2 }}
          className="zona-card p-6"
          style={{ "--zona-color": `var(--zona-${colorRama})` } as React.CSSProperties}
        >
          <div className="flex justify-between items-start mb-3">
            <span className={`tag tag-${colorRama === "cosajuzgada" ? "cosajuzgada" : colorRama === "incidentes" ? "incidente" : colorRama}`}>{cuestionActual.rama}</span>
            <span className="text-[10px] uppercase tracking-widest font-mono-terminal text-doc-aged/40">{cuestionActual.art}</span>
          </div>
          <div className="font-display-grave text-2xl text-doc-aged mb-5 leading-tight">{cuestionActual.enunciado}</div>
          <div className="space-y-2">
            {shuffled.options.map((op, i) => {
              const elegido = respuestaIdx === i;
              const reveal = respuestaIdx !== null;
              return (
                <button
                  key={i}
                  onClick={() => responder(i)}
                  disabled={reveal}
                  className={`block w-full text-left p-3 border text-sm font-mono-terminal transition-all
                    ${!reveal ? "border-bg-steel hover:border-zona-competencia hover:bg-bg-burocratic/30" : ""}
                    ${reveal && op.correcta ? "border-zona-cautelares text-zona-cautelares bg-zona-cautelares/5" : ""}
                    ${reveal && elegido && !op.correcta ? "border-zona-nulidad text-zona-nulidad bg-zona-nulidad/5" : ""}
                    ${reveal && !op.correcta && !elegido ? "opacity-30" : ""}
                  `}
                >
                  <span className="text-[10px] opacity-50 mr-2">{String.fromCharCode(65 + i)}</span>
                  {op.texto}
                </button>
              );
            })}
            {respuestaIdx === -1 && (
              <div className="text-zona-nulidad text-xs font-mono-terminal italic mt-2">⏰ Tiempo agotado. Preclusión.</div>
            )}
            {avance.pendiente && <PistaAvance duracion={avance.duracion} />}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Stat({ label, value, zona }: { label: string; value: string | number; zona: string }) {
  return (
    <div className="border border-bg-steel p-2">
      <div className="text-[9px] uppercase tracking-widest text-doc-aged/50">{label}</div>
      <div className="font-display-grave text-lg" style={{ color: `var(--zona-${zona})` }}>{value}</div>
    </div>
  );
}
