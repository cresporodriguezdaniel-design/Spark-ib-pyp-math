
   # ⚡ SPARK — Videojuego de Aventuras Matemáticas e Indagación (IB PYP)

[![React](https://img.shields.io/badge/React-19.0-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Apache_2.0-green.svg)](LICENSE)

**SPARK** es una plataforma y videojuego educativo de matemáticas basado en el marco transdisciplinario del **Programa de la Escuela Primaria (PEP / PYP)** del Bachillerato Internacional (IB). Combina la gamificación inmersiva (isla de aventuras pixel art, avatares personalizables, mascotas y habitaciones) con el aprendizaje por indagación y un completo panel docente de analítica del aprendizaje.

---

## 🎯 Contexto en Hack4edu: Retos Abordados

Para la conceptualización y desarrollo de este proyecto bajo los criterios de **hack4edu**, se han integrado dos retos clave de forma complementaria:

- **Reto Principal (Reto 20 - Detección Temprana de Dificultades)**:  
  Constituye la **idea principal y columna vertebral** del programa. La función primordial de SPARK es la **detección temprana de posibles problemas y dificultades del alumnado en el aprendizaje de las matemáticas**. A través del panel analítico del profesor (*Teacher Dashboard*), el sistema recopila de forma continua métricas de desempeño, identifica errores conceptuales recurrentes (como confusión en fracciones o equivalencias), visualiza un radar competencial cognitivo y emite alertas preventivas que permiten al docente intervenir de forma ágil y personalizada antes de que se consolide una laguna de aprendizaje.

- **Subreto Integrado (Reto 14 - Videojuegos y Gamificación Educativa)**:  
  Como respuesta a la necesidad de motivar e involucrar activamente al estudiante, la solución se diseñó y construyó como un **videojuego interactivo de aventuras en pixel art**. El alumnado no percibe una evaluación constante o punitiva, sino una experiencia lúdica donde viaja por mapas temáticos del IB PYP, resuelve retos manipulativos en el *Math Lab*, personaliza su avatar y habitación, alimenta mascotas y supera misiones. De este modo, la recopilación de datos diagnósticos del Reto 20 ocurre de manera natural y no invasiva a través de la dinámica de juego que proponía el Reto 14.

---

## 🌟 Características Principales

### 🗺️ 1. Mapa de Aventuras & 6 Unidades de Indagación (IB PYP)
- **Quiénes somos**: Fracciones, proporciones y equivalencias en el Templo del Conocimiento.
- **Dónde nos encontramos en el tiempo y el espacio**: Coordenadas, simetrías y transformaciones en la Costa de los Descubrimientos.
- **Cómo nos expresamos**: Patrones, secuencias y lógica en el Valle de la Expresión.
- **Cómo funciona el mundo**: Leyes físicas y matemáticas, probabilidad y estadística en la Montaña de la Innovación.
- **Cómo nos organizamos**: Presupuestos, álgebra introductoria y equilibrio de recursos en la Ciudadela del Progreso.
- **Compartir el planeta**: Geometría ambiental, áreas, perímetros y reparto equitativo en el Santuario Natural.

### 🧪 2. Math Lab (Laboratorio Manipulativo Interactivo)
- **Bloques de Fracciones**: Manipulación visual de círculos y barras fraccionarias con detección automática de equivalencias.
- **Balanza Algebraica**: Balanza física interactiva para experimentar con la conservación de la igualdad matemática.
- **Geoplano y Figuras 2D**: Exploración de ángulos, polígonos, perímetros y áreas.
- **Recta Numérica Interactiva**: Saltos, distancias y operaciones con retroalimentación visual en tiempo real.

### ⚡ 3. Desafíos de Pensamiento Rápido (*Quick Thinking*)
- Modos contrarreloj de cálculo mental y agilidad numérica.
- Respuestas de opción múltiple y teclado numérico adaptado para dispositivos táctiles.
- Rachas, bonificadores de combo y recompensas de gemas y monedas.

### 🏠 4. Habitación del Avatar y Santuario de Mascotas
- **Avatares Pixel Art**: Personalización de personajes con atuendos, gorros y accesorios temáticos.
- **Decoración de la Habitación**: Tienda de muebles y objetos decorativos colocables en la cuadrícula isométrica.
- **Mascotas Virtuales**: Adopta y alimenta mascotas (como el zorro místico) aumentando su nivel de afecto.

### 🏅 5. Insignias y Logros
- Más de 20 insignias desbloqueables clasificadas por rareza (*Común*, *Rara*, *Épica*, *Legendaria* y *Secreta*).
- Recompensas de experiencia (XP), monedas y gemas por superación de hitos conceptuales.

### 👨‍🏫 6. Panel de Control Docente (*Teacher Dashboard*)
- **Radar de Habilidades Cognitivas**: Evaluación multidimensional (Razonamiento Lógico, Resolución de Problemas, Pensamiento Numérico, etc.).
- **Gestión de Aulas**: Creación de clases con códigos de unión únicos para los estudiantes.
- **Asignación de Tareas**: Envío de misiones de refuerzo o tareas específicas con fecha límite.
- **Alertas Tempranas y Errores Frecuentes**: Detección pedagógica de conceptos erróneos recurrentes.

---

## 🛠️ Stack Tecnológico

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Empaquetador & Dev Server**: [Vite 8](https://vitejs.dev/)
- **Estilos**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Efectos 3D & Animación**: [Three.js](https://threejs.org/), [Motion](https://motion.dev/), [Canvas-Confetti](https://github.com/catdad/canvas-confetti)
- **Iconos**: [Lucide React](https://lucide.dev/)
- **Audio Sintetizado**: Web Audio API para efectos de sonido retro sin dependencias externas pesadas.

---

## 🚀 Instalación y Puesta en Marcha

### Prerrequisitos
- [Node.js](https://nodejs.org/) v18 o superior
- Gestor de paquetes: `npm`, `pnpm` o `bun`

### Pasos

### Clonar el repositorio:
   "git clone https://github.com/TU-USUARIO/spark-ib-pyp-math.git
   cd spark-ib-pyp-math"

### instalar dependencias**
   npm install

### Iniciar el servidor de desarrollo**
   npm run dev

### COmpilar para la producción**
   npm run build
   -Los archivos optimizados para producción se generarán en la carpeta dist/

### Verificacion**
   npm run lint
   
