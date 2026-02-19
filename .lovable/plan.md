

## Optimizar Tarjetas de Tecnicas: Menos Friccion, Mas Motivacion

### Resumen
Simplificar las tarjetas de tecnicas aplicando los principios del Psych Framework: reducir la densidad de informacion, usar copy orientado a resultados, y hacer que el camino hacia "empezar a respirar" sea lo mas corto posible.

### Cambios Propuestos

**1. Eliminar el badge de dificultad**
- Quitar "Principiante" / "Intermedio" / "Avanzado" de las tarjetas
- Razon: implica juicio y crea friccion para usuarios nuevos. Los beneficios ya comunican la complejidad indirectamente

**2. Reducir beneficios visibles a solo 1 en estado colapsado**
- Ya se muestra solo 1 en estado colapsado (correcto)
- En estado expandido: mostrar maximo 2 beneficios en lugar de todos
- Eliminar la seccion extra de "beneficios adicionales" del estado expandido

**3. Reescribir el copy para ser outcome-oriented**
- Cambiar las descripciones de "que es la tecnica" a "que vas a sentir"
- Ejemplos:

| Tecnica | Antes | Despues |
|---------|-------|---------|
| Box Breathing | "Tecnica utilizada por Navy SEALs para mantener la calma bajo presion..." | "Encuentra claridad y enfoque en solo 4 minutos. Tu mente se calma, tu cuerpo responde." |
| Diafragmatica | "La base de toda respiracion consciente. Activa tu diafragma..." | "Siente como la tension se disuelve con cada respiracion. La calma mas natural que existe." |
| 4-7-8 | "Desarrollada por el Dr. Andrew Weil..." | "Tu cuerpo se prepara para descansar. Ideal antes de dormir o en momentos de estres intenso." |
| Nadi Shodhana | "Respiracion alterna nasal del yoga..." | "Equilibra tu energia y aclara tu mente. Como un reinicio suave para tu sistema nervioso." |

Mismos cambios en ingles.

**4. Acortar el CTA del boton**
- "Continua donde lo dejaste" se acorta a "Continuar" (el badge de Zeigarnik arriba ya da el contexto)
- "Comenzar practica" se acorta a "Comenzar"

**5. Hacer el visual de ritmo mas prominente**
- Aumentar la opacidad del BreathRhythmVisual de 15% a 25% en estado normal
- Aumentar de 25% a 35% en hover
- Esto ayuda al usuario a "sentir" el ritmo antes de empezar

---

### Detalle Tecnico

| Archivo | Cambio |
|---------|--------|
| `src/data/techniques.ts` | Reescribir las descripciones en ES y EN a copy outcome-oriented |
| `src/components/TechniqueCard.tsx` | Eliminar badge de dificultad, limitar beneficios expandidos a 2, acortar texto del CTA |
| `src/components/TechniqueCard.tsx` | Aumentar opacidad del BreathRhythmVisual (15% a 25% normal, 25% a 35% hover) |
| `src/i18n/translations/es.ts` | Acortar `startPractice` a "Comenzar" y `continueSession` a "Continuar" |
| `src/i18n/translations/en.ts` | Acortar `startPractice` a "Begin" y `continueSession` a "Continue" |

### Impacto Esperado
- Reduccion de friccion cognitiva: menos texto que leer antes de actuar
- Copy que genera anticipacion emocional en lugar de informar
- CTA mas limpio y directo
- Visual de ritmo mas presente para conexion intuitiva

