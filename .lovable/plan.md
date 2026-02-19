

## Refinamientos de UX en Tarjetas de Tecnicas

### Hallazgos del Audit (segun el Knowledge del proyecto)

**1. Efecto Skittles en los beneficios (C.L.E.A.R. - Emphasis)**
Actualmente hay dos badges de beneficio separados (uno en estado colapsado, otro en expandido). El segundo beneficio ("Reduce la ansiedad") aparece suelto debajo de los controles de ciclos, rompiendo el flujo visual. Mejor agrupar ambos beneficios juntos, justo debajo de la descripcion.

**2. El selector de ciclos no tiene contexto (IKEA Effect)**
Los botones [-] 6 [+] estan ahi sin etiqueta. El usuario no sabe que esta ajustando. Agregar una etiqueta descriptiva como "Ajustar ciclos" / "Adjust cycles" al lado de los controles para dar contexto al IKEA Effect.

**3. Orden de contenido expandido (Psych Framework)**
El orden actual es: descripcion -> duracion/ciclos -> controles -> segundo beneficio -> CTA. Esto pone friccion (controles) antes de motivacion (beneficios). Mejor reorganizar: descripcion -> ambos beneficios juntos -> duracion + controles -> CTA. Asi el usuario recibe toda la motivacion antes de interactuar.

### Cambios Propuestos

**Archivo: `src/components/TechniqueCard.tsx`**

Reorganizar el contenido expandido en este orden:
1. Descripcion (sin cambios)
2. Ambos beneficios juntos (mover el segundo beneficio aqui, al lado del primero)
3. Duracion + selector de ciclos con etiqueta contextual
4. Boton CTA (sin cambios)

Agregar la etiqueta "Ajustar ciclos" encima o al lado de los controles +/-.

**Archivos de traduccion (`es.ts`, `en.ts`)**
- Ya existe `adjustCycles` en las traducciones, solo hay que usarlo en el componente.

### Detalle Tecnico

| Archivo | Cambio |
|---------|--------|
| `src/components/TechniqueCard.tsx` | Mover segundo beneficio arriba (junto al primero, debajo de descripcion). Agregar etiqueta `t.techniques.adjustCycles` al selector de ciclos. |

### Impacto
- Flujo motivacion-primero: el usuario lee beneficios antes de ver controles
- IKEA Effect con contexto: el usuario entiende que esta personalizando
- Sin efecto Skittles: beneficios agrupados en un solo lugar

