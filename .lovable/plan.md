

## Mejorar Touch Targets del Selector de Ciclos

### Problema
Los botones de - y + para ajustar ciclos miden solo 20x20px (`h-5 w-5`), muy por debajo del minimo recomendado de 44px para dispositivos tactiles. Ademas, el icono de reloj, la duracion, el icono de barras y el selector de ciclos estan todos comprimidos en una sola linea horizontal, dificultando la interaccion en telefonos.

### Solucion
Separar la informacion en dos filas y aumentar el tamano de los controles tactiles.

**Archivo: `src/components/TechniqueCard.tsx` (lineas ~152-176)**

Cambiar el layout de la seccion de duracion y ciclos:

**Antes (1 fila apretada):**
```
[Clock] 2 min  [BarChart] [-] 6 [+] ciclos
```

**Despues (2 filas con espacio):**
```
[Clock] 2 min  ·  6 ciclos
        [-]  6  [+]
```

- Primera fila: informacion de solo lectura (duracion estimada + ciclos actuales)
- Segunda fila: controles interactivos con botones mas grandes

Cambios especificos:
- Aumentar botones de `h-5 w-5` (20px) a `h-9 w-9` (36px) con area tactil minima de 44px usando padding
- Aumentar los iconos dentro de los botones de `h-3 w-3` a `h-4 w-4`
- El numero de ciclos central pasa de `text-xs` a `text-sm font-semibold` con ancho minimo de `min-w-[2rem]`
- Eliminar el icono `BarChart2` que no aporta informacion util
- Separar la fila informativa de la fila de controles con un `flex-col gap-2`

### Detalle Tecnico

| Archivo | Cambio |
|---------|--------|
| `src/components/TechniqueCard.tsx` | Reestructurar la seccion de duracion/ciclos en dos filas, aumentar touch targets de los botones +/- |

### Impacto
- Touch targets cumplen con las guias de accesibilidad (minimo 44px de area tactil)
- Separacion visual clara entre informacion y controles interactivos
- Mas facil de usar con el pulgar en una mano

