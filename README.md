# Dino Jump

**Dino Jump** es una reinvención premium con temática espacial y astronauta del clásico e icónico juego de carrera infinita sin conexión del navegador Google Chrome. El jugador asume el control de un simpático dinosaurio astronauta que explora la superficie lunar, esquivando obstáculos y acumulando puntos en un entorno dinámico y geométrico.

Este proyecto ha sido diseñado bajo una cuidada dirección artística de estilo **poly-futurista**, con colores sobrios, líneas limpias y una estética de exploración espacial atemporal, alejándose de los destellos y luces de neón del estilo cyberpunk tradicional.

---

## 🚀 ¿En qué consiste el juego?

El objetivo principal es sobrevivir el mayor tiempo posible mientras el dinosaurio astronauta corre de manera automática sobre la superficie lunar:

1. **Pantalla de Bienvenida**: Un panel interactivo con un diseño geométrico sofisticado, que muestra un casco de astronauta minimalista en formato SVG, las instrucciones del juego y un sistema de validación de apodos (nicknames) de entre 3 y 30 caracteres.
2. **Tablero de Clasificación (Leaderboard)**: Muestra los mejores puntajes históricos guardados de manera persistente en el dispositivo del usuario.
3. **Mecánica de Juego**:
   - **Salto Lunar**: Esquivar rocas y cráteres espaciales en el momento preciso.
   - **Física del Juego**: Incremento progresivo de velocidad y dificultad a medida que aumenta la puntuación para ofrecer un reto competitivo.
   - **Puntuación en tiempo real**: Visualización digital en colores desaturados que registra la puntuación actual.
4. **Pantalla de Fin de Juego (Game Over)**: Si ocurre una colisión, el juego se pausa y presenta una tarjeta interactiva espacial en español para ingresar tu nombre y registrar la nueva marca si supera el puntaje anterior.

### 🎮 Controles
* **Espacio (Space)** o **Flecha Arriba (ArrowUp)**: Realizar un salto lunar.
* **Enter**: Iniciar o reiniciar la partida rápidamente.

---

## 🛠️ Tecnologías Utilizadas

La interfaz gráfica y el motor del juego se construyeron utilizando un conjunto de tecnologías modernas del desarrollo frontend que aseguran un rendimiento óptimo y una experiencia interactiva fluida:

* **React 18**: Librería principal para la gestión reactiva del estado del juego, renderizado de componentes de la interfaz de usuario (pantalla de bienvenida, modales, scoreboard) y manejo de eventos.
* **TypeScript 5**: Superconjunto de JavaScript que aporta tipado estático estricto, mejorando la mantenibilidad, robustez del código y la prevención de errores durante el desarrollo del motor de físicas.
* **Vite 5**: Herramienta de construcción (bundler) ultra rápida que proporciona un entorno de desarrollo ágil con recarga en caliente instantánea (HMR) y compilaciones de producción altamente optimizadas.
* **HTML5 Canvas API**: Utilizado para renderizar de manera eficiente los gráficos interactivos bidimensionales en tiempo real, incluyendo la animación del dinosaurio astronauta, la generación fluida de obstáculos lunares y el fondo dinámico de estrellas y constelaciones.
* **Vanilla CSS (CSS Puro)**: Diseño visual personalizado y premium sin frameworks adicionales. Implementa técnicas avanzadas como *glassmorphism* (paneles traslúcidos con desenfoque de fondo), variables personalizadas de color CSS (HSL y colores espaciales desaturados), tipografía responsiva y sutiles micro-animaciones en los botones y estados de interacción (*hover*).
* **Fuentes Tipográficas (Google Fonts)**:
  - *Outfit*: Utilizada para títulos principales y texto de interfaz por su aspecto futurista, limpio y moderno.
  - *Share Tech Mono*: Utilizada para los números y marcadores digitales, brindando una estética retro-futurista perfecta para un tablero arcade.
* **LocalStorage API**: Mecanismo del navegador para la persistencia local de los nombres de los jugadores y sus respectivos récords de puntuación de forma offline.
* **Vitest & React Testing Library**: Suite de pruebas unitarias y de integración para garantizar que las lógicas de guardado, inicialización del juego y detección de colisiones funcionen correctamente.
