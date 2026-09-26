import { ARCADE } from "@/lib/brand";
import EvaMark from "./EvaMark";

/**
 * VUELTA A EVA ARCADE — el símbolo □X de EVA con el nombre del Arcade, como
 * botón. Lleva a la puerta del Arcade (`/links` de la landing de EVA), en la
 * misma pestaña: por ahí se llega al juego y por ahí se vuelve.
 *
 * Es la misma pieza que los botones de la cabecera (`.cabecera-boton`). En la
 * portada va completo, con la flecha de volver; en la cabecera, `compacto` y
 * sólo desde tableta (en el teléfono la fila de 56 px ya va llena: ahí se sale
 * por la portada).
 */
export default function VolverArcade({
  compacto = false,
  className = "",
}: {
  compacto?: boolean;
  className?: string;
}) {
  return (
    <a
      href={ARCADE.puerta}
      className={`cabecera-boton volver-arcade ${compacto ? "volver-arcade-cabecera" : ""} ${className}`}
      aria-label={ARCADE.volver}
      title={ARCADE.volver}
    >
      {!compacto && <span aria-hidden="true">←</span>}
      <EvaMark size={22} />
      <span className="volver-arcade-nombre">{ARCADE.nombre}</span>
    </a>
  );
}
