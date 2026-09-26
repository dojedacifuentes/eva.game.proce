/**
 * La marca de EVA —el símbolo □X y el nombre ƎVΛ—, ya colocada.
 *
 * GENERADO: no se edita a mano. Sale del repositorio de la landing
 * (eva.proyecto01) con `node scripts/brand-assets.mjs --kit <este repositorio>`,
 * a partir de su `src/lib/brand.ts`, donde vive y se prueba la geometría: ocho
 * piezas rígidas (los cuatro lados del cuadrado y los cuatro brazos de la X)
 * que sólo se trasladan y giran. Aquí llegan en sus dos poses.
 *
 * Unidades de la marca: el lado del cuadrado mide 10.
 */

export type PoseMarca = 'simbolo' | 'nombre';

export const MARCA = {
  /** Trazo casi blanco; halo de azul eléctrico a violeta, siempre de izquierda a derecha. */
  colores: {
    trazo: ['#dcf2ff', '#f4f6ff', '#f5e6ff'],
    halo: ['#2a8cff', '#5a60ff', '#a24dff'],
    fondo: '#03050d',
  },
  /** Grosor de todo trazo. */
  grosor: 0.75,
  /** Contorno del color del relleno que tapa la costura de los vértices. */
  costura: 0.05,
  poses: {
    /** El símbolo: el cuadrado sobre la X. */
    simbolo: {
      caja: { x: -5, y: -11.75, ancho: 10, alto: 23.499 },
      piezas: [
        [[-5,-11.75],[5,-11.75],[5,-11],[-5,-11]],
        [[5,-11.75],[5,-1.75],[4.25,-1.75],[4.25,-11.75]],
        [[-5,-2.5],[5,-2.5],[5,-1.75],[-5,-1.75]],
        [[-4.25,-11.75],[-4.25,-1.75],[-5,-1.75],[-5,-11.75]],
        [[-4.8,0.95],[-3.84,0.95],[0,5.75],[0,6.95]],
        [[4.8,0.95],[3.84,0.95],[0,5.75],[0,6.95]],
        [[-4.8,11.75],[-3.84,11.75],[0,6.95],[0,5.75]],
        [[4.8,11.75],[3.84,11.75],[0,6.95],[0,5.75]],
      ],
      svg: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-6.6 -13.35 13.2 26.699\"><defs><linearGradient id=\"g\" gradientUnits=\"userSpaceOnUse\" x1=\"-5\" x2=\"5\" y1=\"0\" y2=\"0\"><stop offset=\"0\" stop-color=\"#2a8cff\"/><stop offset=\"0.5\" stop-color=\"#5a60ff\"/><stop offset=\"1\" stop-color=\"#a24dff\"/></linearGradient><linearGradient id=\"c\" gradientUnits=\"userSpaceOnUse\" x1=\"-5\" x2=\"5\" y1=\"0\" y2=\"0\"><stop offset=\"0\" stop-color=\"#dcf2ff\"/><stop offset=\"0.5\" stop-color=\"#f4f6ff\"/><stop offset=\"1\" stop-color=\"#f5e6ff\"/></linearGradient><filter id=\"b\" x=\"-25%\" y=\"-80%\" width=\"150%\" height=\"260%\"><feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"0.8\" result=\"w\"/><feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"0.256\" result=\"t\"/><feMerge><feMergeNode in=\"w\"/><feMergeNode in=\"t\"/><feMergeNode in=\"t\"/></feMerge></filter></defs><g fill=\"url(#g)\" filter=\"url(#b)\"><polygon points=\"-5,-11.75 5,-11.75 5,-11 -5,-11\"/><polygon points=\"5,-11.75 5,-1.75 4.25,-1.75 4.25,-11.75\"/><polygon points=\"-5,-2.5 5,-2.5 5,-1.75 -5,-1.75\"/><polygon points=\"-4.25,-11.75 -4.25,-1.75 -5,-1.75 -5,-11.75\"/><polygon points=\"-4.8,0.95 -3.84,0.95 0,5.75 0,6.95\"/><polygon points=\"4.8,0.95 3.84,0.95 0,5.75 0,6.95\"/><polygon points=\"-4.8,11.75 -3.84,11.75 0,6.95 0,5.75\"/><polygon points=\"4.8,11.75 3.84,11.75 0,6.95 0,5.75\"/></g><g fill=\"url(#c)\" stroke=\"url(#c)\" stroke-width=\"0.05\"><polygon points=\"-5,-11.75 5,-11.75 5,-11 -5,-11\"/><polygon points=\"5,-11.75 5,-1.75 4.25,-1.75 4.25,-11.75\"/><polygon points=\"-5,-2.5 5,-2.5 5,-1.75 -5,-1.75\"/><polygon points=\"-4.25,-11.75 -4.25,-1.75 -5,-1.75 -5,-11.75\"/><polygon points=\"-4.8,0.95 -3.84,0.95 0,5.75 0,6.95\"/><polygon points=\"4.8,0.95 3.84,0.95 0,5.75 0,6.95\"/><polygon points=\"-4.8,11.75 -3.84,11.75 0,6.95 0,5.75\"/><polygon points=\"4.8,11.75 3.84,11.75 0,6.95 0,5.75\"/></g></svg>",
    },
    /** El nombre: ƎVΛ, las tres letras del mismo alto. */
    nombre: {
      caja: { x: -15.825, y: -3, ancho: 31.65, alto: 6 },
      piezas: [
        [[-15.825,-3],[-5.825,-3],[-5.825,-2.25],[-15.825,-2.25]],
        [[-15.825,2.25],[-5.825,2.25],[-5.825,3],[-15.825,3]],
        [[-15.825,-0.375],[-5.825,-0.375],[-5.825,0.375],[-15.825,0.375]],
        [[-3.725,-3],[-2.765,-3],[1.075,1.799],[1.075,3]],
        [[5.875,-3],[4.915,-3],[1.075,1.799],[1.075,3]],
        [[6.225,3],[7.185,3],[11.025,-1.799],[11.025,-3]],
        [[15.825,3],[14.865,3],[11.025,-1.799],[11.025,-3]],
      ],
      svg: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-17.425 -4.6 34.85 9.2\"><defs><linearGradient id=\"g\" gradientUnits=\"userSpaceOnUse\" x1=\"-15.825000000000001\" x2=\"15.825\" y1=\"0\" y2=\"0\"><stop offset=\"0\" stop-color=\"#2a8cff\"/><stop offset=\"0.5\" stop-color=\"#5a60ff\"/><stop offset=\"1\" stop-color=\"#a24dff\"/></linearGradient><linearGradient id=\"c\" gradientUnits=\"userSpaceOnUse\" x1=\"-15.825000000000001\" x2=\"15.825\" y1=\"0\" y2=\"0\"><stop offset=\"0\" stop-color=\"#dcf2ff\"/><stop offset=\"0.5\" stop-color=\"#f4f6ff\"/><stop offset=\"1\" stop-color=\"#f5e6ff\"/></linearGradient><filter id=\"b\" x=\"-25%\" y=\"-80%\" width=\"150%\" height=\"260%\"><feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"0.8\" result=\"w\"/><feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"0.256\" result=\"t\"/><feMerge><feMergeNode in=\"w\"/><feMergeNode in=\"t\"/><feMergeNode in=\"t\"/></feMerge></filter></defs><g fill=\"url(#g)\" filter=\"url(#b)\"><polygon points=\"-15.825,-3 -5.825,-3 -5.825,-2.25 -15.825,-2.25\"/><polygon points=\"-15.825,2.25 -5.825,2.25 -5.825,3 -15.825,3\"/><polygon points=\"-15.825,-0.375 -5.825,-0.375 -5.825,0.375 -15.825,0.375\"/><polygon points=\"-3.725,-3 -2.765,-3 1.075,1.799 1.075,3\"/><polygon points=\"5.875,-3 4.915,-3 1.075,1.799 1.075,3\"/><polygon points=\"6.225,3 7.185,3 11.025,-1.799 11.025,-3\"/><polygon points=\"15.825,3 14.865,3 11.025,-1.799 11.025,-3\"/></g><g fill=\"url(#c)\" stroke=\"url(#c)\" stroke-width=\"0.05\"><polygon points=\"-15.825,-3 -5.825,-3 -5.825,-2.25 -15.825,-2.25\"/><polygon points=\"-15.825,2.25 -5.825,2.25 -5.825,3 -15.825,3\"/><polygon points=\"-15.825,-0.375 -5.825,-0.375 -5.825,0.375 -15.825,0.375\"/><polygon points=\"-3.725,-3 -2.765,-3 1.075,1.799 1.075,3\"/><polygon points=\"5.875,-3 4.915,-3 1.075,1.799 1.075,3\"/><polygon points=\"6.225,3 7.185,3 11.025,-1.799 11.025,-3\"/><polygon points=\"15.825,3 14.865,3 11.025,-1.799 11.025,-3\"/></g></svg>",
    },
  },
} as const;
