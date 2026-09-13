"use client";

// ============================================================================
// TEMPLATE — entrada común a cada pantalla.
//
// `template.tsx` (a diferencia de `layout.tsx`) se vuelve a montar en cada
// navegación, que es justo lo que hace falta para animar la entrada. Antes no
// existía: pasar de una ruta a otra era un corte seco en las 50 pantallas.
//
// AVISO IMPORTANTE para quien lo edite: aquí **sólo se anima la opacidad**.
// Un `transform` o un `filter` en este contenedor lo convertiría en el bloque
// contenedor de todos sus descendientes `position: fixed` —la navegación
// inferior, los modales, el aviso de nivel— y los mandaría fuera de la
// pantalla. Ese error ya ocurrió una vez con la animación de fondo del `body`,
// y dejó la barra de navegación en el píxel 2018. Está documentado en
// docs/HANDOFF.md §4.
// ============================================================================

export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="entrada-pantalla">{children}</div>;
}
