# Tic-Tac-Toe Multijugador — Technical Test

Este proyecto es una implementación full-stack de un jeugo **Tic-Tac-Toe** con funcionalidad multijugador en tiempo real, gestión de salas, historial de partidas y panel de estadísticas. Fue desarrollado como parte de una prueba técnica para evaluar habilidades en arquitectura full-stack, comunicación en tiempo real, persistencia de datos y experiencia de usuario.
<img width="1292" height="715" alt="image" src="https://github.com/user-attachments/assets/b00f92ac-8fec-4141-905f-4573acfae768" />


---

## ✅ Características principales

- **Multijugador en tiempo real** mediante WebSockets.
- **Salas privadas** identificadas por ID único (compartible).
- Soporte para **2 jugadores activos** + **observadores ilimitados**.
- **Reinicio de partidas** con confirmación entre jugadores.
- **Historial completo de partidas por sala**.
- **Panel de estadísticas** con:
  - Ranking de jugadores (top 10 por victorias).
  - Estadísticas generales (total de partidas y jugadores).
  - Historial detallado por sala.
  - Perfil individual de jugador.
- **Diseño responsive** y experiencia de usuario intuitiva.
- **Validación robusta** de datos con Zod.
- **Gestión de estado global** con Zustand (sin side effects ni boilerplate).

---

## 🧰 Stack tecnológico

### Frontend
- **Framework**: React 18 + TypeScript
- **Build tool**: Vite
- **Estilado**: Tailwind CSS + Lucide React (iconos)
- **Gestión de estado**: Zustand
- **Validación**: Zod
- **Routing**: React Router DOM

### Backend
- **Lenguaje**: Go (Golang)
- **WebSockets**: `gorilla/websocket`
- **ORM**: GORM
- **Base de datos**: PostgreSQL
- **Arquitectura**: Clean Architecture - ports & adapters
- **Patrones**: Repository, Service, Hub 

### Infraestructura
- **Contenedores**: Docker + Docker Compose
- **Migraciones**: Scripts SQL iniciales (`001_initial_schema.sql`)
- **Variables de entorno**: Configuración segura de URLs y puertos

---

## 🚀 Despliegue local

### Requisitos previos
- Docker y Docker Compose instalados
- Node.js ≥ 18 (solo si deseas ejecutar frontend sin Docker)

### Pasos

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/juan10024/tictactoe-test.git
   cd tictactoe-project
  
2. **Construir e iniciar los servicios**
  ```bash
  docker-compose up --build
  ```

3. **Acceder a la aplicación**
  - Frontend: http://localhost:5173
  - Backend:  http://localhost:8080
  - Base de datos: PostgreSQL en localhost:5432 :
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=po2tgre2
      - POSTGRES_DB=tictactoeDB
        
4. **📂 Estructura del proyecto**

  tictactoe-project/
  
├── backend/               # Aplicación Go

│   ├── main.go            # Punto de entrada

│   ├── internal/          # Lógica de negocio (Clean Architecture)

│   │   ├── core/          # Dominio y puertos
│   │   │   └── domain/    
│   │   │   └── ports/    
│   │   │   └── services/  # Implementaciones (WebSockets, juego, stats)

│   │   └── infra/         # Repositorio 

│   │   └── adapters/      # Handlers HTTP
│   │   │   └── db/    
│   │   │   └── dto/    
│   │   │   └── handlers/  # Administración de Peticiones

│   └── migrations/        # Esquema inicial de BD

├── frontend/              # Aplicación React + TS
│   ├── src/

│   │   ├── components/    # Componentes reutilizables

│   │   ├── pages/         # Vistas principales

│   │   ├── store/         # Zustand: gameStore.ts

│   │   ├── services/      # Llamadas a API y WebSockets

│   │   └── config.ts      # URLs y constantes

├── docker-compose.yml     # Servicios: frontend, backend, postgres
└── README.md

5. **Endpoints**
  - Unirse a una sala WebSocket: ws://localhost:8080/join/{roomId}?playerName=...
  - Historial de sala: GET /api/rooms/history/{roomId}
  - Ranking global: GET /api/stats/ranking
  - Estadísticas generales: GET /api/stats/general
  - Estadísticas de jugador: GET /api/stats/player?playerName=...

