# Roadmap

Lo que viene, en el orden en que va a llegar. Y, al final, lo que no va a
llegar nunca — que en una librería de animación importa igual.

Las fechas son intenciones, no promesas. Si algo te hace falta antes,
[ábrelo como issue](https://github.com/soyrageagency/rage-motion/issues) y lo
subo.

---

## 0.1 — Publicado

- [x] 33 componentes en nueve módulos, cada uno independiente y copiable.
- [x] `core/motion.js`: preferencia de movimiento, easings, un solo `rAF`
      compartido y un `animate()` que salta al estado final en vez de saltarse
      la animación.
- [x] Partido de texto que conserva el nombre accesible, el copiar-pegar y los
      saltos de línea.
- [x] Servidor MCP: `list_components`, `get_component`, `get_tokens`,
      `get_stylesheet`, `about`, más un *prompt* y un recurso.
- [x] Demo pública que es a la vez la documentación viva.
- [x] `npm run check`: la demo en Chromium real, con y sin `reduced-motion`,
      fallando ante cualquier error de consola o elemento que quede invisible.

## 0.2 — Control más fino *(próximo)*

- [ ] **`data-rm-once="false"` por elemento.** Hoy `once` es una opción del
      conjunto, no del elemento; la demo tuvo que quitar el atributo porque no
      hacía nada, y un atributo que no hace nada es peor que no tenerlo.
- [ ] **`data-rm-*` para todas las opciones.** El markup debería poder
      configurar lo mismo que JavaScript en todos los componentes, no sólo en
      algunos.
- [ ] **Tipos.** `.d.ts` generados desde el JSDoc que ya está escrito.
- [ ] **Presets de escena**: combinaciones probadas (hero, índice de proyectos,
      página de precios) que se activan con un atributo.

## 0.3 — Rendimiento visible

- [ ] **Presupuesto de movimiento.** Un aviso en consola cuando una página
      arranca más componentes de los que puede sostener a 60fps, con cuáles
      son los caros.
- [ ] **Scroll timelines nativos en todo lo que se pueda.** `progress` ya los
      usa; `parallax`, `scrub` y `stack` pueden.
- [ ] **Carga por partes.** Un `init()` que sólo importe los módulos cuyos
      atributos aparecen realmente en el documento.

## 0.4 — Que se note fuera

- [ ] **Envoltorios para React, Vue y Svelte.** Paquetes aparte: el núcleo
      sigue sin dependencias y sin *framework*.
- [ ] **Galería de plantillas.** Páginas completas — estudio, producto,
      portfolio — para copiar enteras.
- [ ] **Más componentes de vitrina**, a partir de lo que la gente pida en los
      issues.

## Sin fecha, pero en la lista

- [ ] Vídeo corto de cada componente en el README, generado desde la demo.
- [ ] Modo *debug* que dibuja los umbrales de disparo sobre la página.
- [ ] Traducción del README y de la demo al inglés.

---

## Lo que no va a pasar

Esto no es pereza: cada una de estas cosas haría peor la librería.

- **Dependencias.** Ninguna. Ni GSAP, ni Lenis, ni una utilidad de 2 KB. El día
  que este paquete tenga un `dependencies` no vacío, deja de ser lo que es.
- **Scroll suave que sustituya al del navegador.** Rompe la barra de scroll, el
  buscar-en-página, el teclado y media accesibilidad. `skew()` da la parte que
  se ve — la inclinación — sin tocar el scroll.
- **Un `* { animation: none !important }` para `reduced-motion`.** Es el
  recorte habitual y deja invisible todo elemento cuyo estado visible sea el
  final de una animación. Cada componente lo resuelve él.
- **Animar propiedades de layout.** Nada de `top`, `left`, `width` o `margin`.
  Si un efecto lo necesita, es que el efecto está mal planteado.
- **Un *bundle* mínimo a costa de los comentarios.** El código explica por qué
  hace lo que hace. Eso es la mitad del valor cuando lo copias en tu proyecto —
  y lo que tu IA lee por MCP.

---

Hecho por [SoyRage Agency](https://soyrage.es/).
