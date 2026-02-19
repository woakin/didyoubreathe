

## Mejorar Modo Zen y Corregir Superposición de Controles

### Problema 1: Modo Zen no tiene diferencia significativa

Actualmente el Modo Zen solo:
- Oculta el texto dentro del blob (fase + contador)
- Oculta los controles inferiores (voz + pausa/stop)
- Muestra botones de sonido ambiental

Pero el header YA se oculta durante cualquier sesión activa (`isFullyImmersed`), así que la diferencia visual es mínima.

### Problema 2: Controles superpuestos

La fila de voz (Volume2 + "Camila" + icono de ajustes) y los botones (Stop + Pausar) comparten el mismo `flex-col` sin suficiente espacio, causando que los elementos se monten unos sobre otros en pantallas pequeñas.

---

### Cambios Propuestos

**Archivo: `src/pages/BreatheV2.tsx`**

**A) Mejorar Modo Zen** -- Hacerlo realmente inmersivo:
- Ocultar el anillo de progreso del blob (pasar prop `hideRing`)
- Ocultar el header completamente (ya lo hace)
- Ocultar TODOS los controles inferiores (ya lo hace)
- Agregar un tap en el blob para salir del modo zen (en lugar de solo el boton de Sparkles)
- Hacer que el botón de Sparkles se oculte con un fade después de 3 segundos en zen, y reaparezca al tocar la pantalla

**B) Corregir superposición de controles**:
- Aumentar el `gap` entre la fila de voz y los botones de acción
- Darle al contenedor de controles un `pb-safe` para respetar la zona segura del móvil
- Asegurar que la fila de voz tenga un `min-height` fijo para que no colapse

**Archivo: `src/components/BreathingBlob.tsx`**

- Agregar prop `hideRing` para ocultar el anillo de progreso SVG en modo zen
- Cuando `hideRing` es true, no renderizar los circulos SVG del progress ring

---

### Detalle Tecnico

| Archivo | Cambio |
|---------|--------|
| `src/pages/BreatheV2.tsx` | Mejorar zen mode: ocultar anillo de progreso, auto-hide del botón Sparkles, aumentar gap en controles, agregar padding inferior seguro |
| `src/components/BreathingBlob.tsx` | Nueva prop `hideRing` para ocultar el anillo de progreso SVG |

**BreatheV2.tsx - Controles (lineas 614-737)**

Cambiar el gap del contenedor de `gap-4` a `gap-5`, y agregar `pb-4` al contenedor principal de controles para evitar la superposicion con la zona segura del movil.

Cambiar el contenedor de la fila de voz para tener `min-h-[44px]` y asegurar que no colapse.

**BreatheV2.tsx - Modo Zen mejorado**

En modo zen activo:
- Pasar `hideRing={showZenUI}` al BreathingBlob
- El boton Sparkles se auto-oculta despues de 3s usando un estado `zenButtonVisible` con un `setTimeout`, y reaparece al hacer tap en cualquier parte
- El selector de sonidos ambientales se posiciona mejor con `bottom-24` en lugar de `bottom-32` para no flotar demasiado alto

**BreathingBlob.tsx - Nueva prop hideRing**

```
interface BreathingBlobProps {
  // ... existing props
  hideRing?: boolean;
}
```

Envolver los circulos del progress ring (lineas 155-183) en un condicional `{!hideRing && (...)}` para ocultarlos completamente en modo zen.

