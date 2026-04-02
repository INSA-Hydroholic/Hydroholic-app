# Hydroholic - MVP Audit (Frontend + Backend)

Fecha: 2026-03-26  
Objetivo: tener una versión mínima funcional end-to-end (registro, login, hidratación, retos básicos, ranking básico, perfil básico).

---

## 1) Definición de MVP

El MVP está listo cuando un usuario puede:

1. Registrarse e iniciar sesión.
2. Ver su dashboard/home.
3. Registrar consumo de agua.
4. Ver su historial básico de hidratación.
5. Crear o unirse a un challenge.
6. Ver ranking básico.
7. Cerrar sesión y volver a entrar con sesión persistida.

---

## 2) Scope MVP (sí / no)

### Sí entra (MVP)
1. Auth básica (register/login/logout/me).
2. Perfil mínimo (nombre, objetivo diario de agua).
3. Hidratación diaria (agregar registro + listar registros).
4. Challenges básicos (listar, crear, unirse, completar).
5. Ranking básico (top usuarios).
6. Navegación funcional sin pantallas muertas.

### No entra (post-MVP)
1. Recomendaciones avanzadas con IA.
2. Sistema social completo (chat, invitaciones complejas).
3. Notificaciones push complejas.
4. Gamificación avanzada (badges complejos, streaks avanzados).
5. Analytics detallado/admin panel.

---

## 3) Estado actual estimado por módulo (audit funcional)

Nota: estado estimado con base en estructura actual del repo.  
Estados: OK / PARTIAL / TODO.

## Frontend

1. Pantalla Login ([frontend/app/login.tsx](frontend/app/login.tsx)) -> PARTIAL  
   - UI existe, validar conexión real al endpoint.
2. Pantalla Register ([frontend/app/register.tsx](frontend/app/register.tsx)) -> PARTIAL  
   - UI existe, validar submit real y manejo de errores.
3. Home tab ([frontend/app/(tabs)/index.tsx](frontend/app/(tabs)/index.tsx)) -> PARTIAL  
   - validar que todos los botones naveguen o ejecuten acción.
4. Challenges tab ([frontend/app/(tabs)/challenges.tsx](frontend/app/(tabs)/challenges.tsx)) -> PARTIAL  
   - unir con endpoints reales (listar/unirse/completar).
5. Create challenge ([frontend/app/create-challenge.tsx](frontend/app/create-challenge.tsx)) -> PARTIAL  
   - asegurar POST real + feedback de éxito/error.
6. History tab ([frontend/app/(tabs)/history.tsx](frontend/app/(tabs)/history.tsx)) -> PARTIAL  
   - asegurar fetch real por usuario y fecha.
7. Ranking tab ([frontend/app/(tabs)/ranking.tsx](frontend/app/(tabs)/ranking.tsx)) -> PARTIAL  
   - conectar endpoint ranking real.
8. Profile tab ([frontend/app/(tabs)/profile.tsx](frontend/app/(tabs)/profile.tsx)) -> PARTIAL  
   - editar perfil + logout + objetivo diario.
9. Friends ([frontend/app/friends.tsx](frontend/app/friends.tsx)) -> TODO  
   - para MVP puede quedar oculto si no hay backend listo.
10. Recommendations ([frontend/app/recommendations.tsx](frontend/app/recommendations.tsx)) -> TODO  
   - recomendable marcar como “coming soon” para MVP.

## Backend (Node backend)

1. Auth routes ([backend/src/routes/auth.ts](backend/src/routes/auth.ts)) -> PARTIAL  
   - validar login/register/me y errores consistentes.
2. Users routes ([backend/src/routes/users.ts](backend/src/routes/users.ts)) -> PARTIAL  
   - endpoint perfil mínimo y actualización objetivo diario.
3. Challenges routes ([backend/src/routes/challenges.ts](backend/src/routes/challenges.ts)) -> PARTIAL  
   - listar/crear/unirse/completar.
4. DB layer ([backend/src/db.ts](backend/src/db.ts)) -> PARTIAL  
   - actualmente parece mock/local; definir estrategia MVP (JSON o SQL).
5. Server/index ([backend/src/index.ts](backend/src/index.ts)) -> PARTIAL  
   - CORS, prefijos API, healthcheck.

## Integración FE-BE

1. Cliente API ([frontend/services/api.ts](frontend/services/api.ts)) -> PARTIAL  
2. Tipos de request/response ([frontend/services/types.ts](frontend/services/types.ts), [backend/src/types.ts](backend/src/types.ts)) -> PARTIAL  
3. Contextos de sesión ([frontend/context/AuthContext.tsx](frontend/context/AuthContext.tsx), [frontend/context/UserContext.tsx](frontend/context/UserContext.tsx)) -> PARTIAL  
4. Manejo token persistente -> PARTIAL  
5. Manejo expiración token -> TODO

---

## 4) Checklist de tareas faltantes (prioridad)

## P0 - Bloqueantes MVP (hacer primero)

1. Definir `BASE_URL` y entorno dev/prod en [frontend/services/api.ts](frontend/services/api.ts).
2. Confirmar CORS y rutas API base en [backend/src/index.ts](backend/src/index.ts).
3. Implementar flujo completo register/login/logout/me:
   - frontend: [frontend/app/login.tsx](frontend/app/login.tsx), [frontend/app/register.tsx](frontend/app/register.tsx), [frontend/context/AuthContext.tsx](frontend/context/AuthContext.tsx)
   - backend: [backend/src/routes/auth.ts](backend/src/routes/auth.ts)
4. Guardar token y enviarlo en todas las requests autenticadas ([frontend/services/api.ts](frontend/services/api.ts)).
5. Proteger navegación privada en [frontend/app/_layout.tsx](frontend/app/_layout.tsx) y/o [frontend/app/(tabs)/_layout.tsx](frontend/app/(tabs)/_layout.tsx).
6. Hidratación mínima funcional:
   - endpoint POST log hidratación
   - endpoint GET historial hidratación del usuario
   - UI conectada en home/historial.
7. Challenges mínimos funcionales:
   - listar challenges
   - crear challenge
   - unirse a challenge
   - completar challenge.
8. Ranking básico (GET top usuarios) conectado en [frontend/app/(tabs)/ranking.tsx](frontend/app/(tabs)/ranking.tsx).
9. Estandarizar formato de errores backend (ejemplo: `{ message, code }`) en todas las rutas.
10. Agregar endpoint `GET /health` para comprobar que backend está vivo.

## P1 - Muy recomendado para estabilidad MVP

1. Validación frontend de formularios (required, email, password mínima).
2. Validación backend de payloads (evitar datos corruptos).
3. Estados de UI por pantalla: loading, empty, error, success.
4. Manejo de sesión expirada (401 -> limpiar sesión y redirigir login).
5. Mejorar tipos compartidos y eliminar `any` en API.
6. Mensajes consistentes de éxito/error (toast/alert).

## P2 - Post-MVP inmediato

1. Friends real o desactivar temporalmente el acceso desde menú.
2. Recommendations reales o placeholder claro.
3. Paginación simple en ranking/historial.
4. Tests básicos de endpoints críticos (auth, hidratación, challenges).

---

## 5) Botones/pantallas potencialmente “sin salida” a revisar

Validar uno por uno:

1. CTAs en [frontend/app/(tabs)/index.tsx](frontend/app/(tabs)/index.tsx):
   - todos deben navegar o ejecutar acción API real.
2. Acciones de challenge cards en [frontend/components/ChallengeCard.tsx](frontend/components/ChallengeCard.tsx):
   - join/start/complete conectados.
3. Acciones de profile en [frontend/app/(tabs)/profile.tsx](frontend/app/(tabs)/profile.tsx):
   - guardar cambios + logout.
4. Side menu en [frontend/components/SideMenu.tsx](frontend/components/SideMenu.tsx):
   - cada item debe tener destino real o estar oculto.
5. Botones genéricos en [frontend/components/Button.tsx](frontend/components/Button.tsx):
   - asegurar que no haya `onPress={() => {}}` en uso productivo.
6. Pantallas [frontend/app/friends.tsx](frontend/app/friends.tsx) y [frontend/app/recommendations.tsx](frontend/app/recommendations.tsx):
   - si no están listas, ocultar o poner “próximamente”.

---

## 6) Endpoints mínimos requeridos para MVP

Sugerencia de contrato mínimo:

1. `POST /auth/register`
2. `POST /auth/login`
3. `GET /auth/me`
4. `PATCH /users/me`
5. `GET /hydration`
6. `POST /hydration`
7. `GET /challenges`
8. `POST /challenges`
9. `POST /challenges/:id/join`
10. `POST /challenges/:id/complete`
11. `GET /rankings`
12. `GET /health`

---

## 7) Riesgos principales y mitigación

1. Riesgo: contratos FE/BE no alineados.  
   Mitigación: definir tipos únicos y ejemplos JSON por endpoint.
2. Riesgo: sesión rota al recargar app.  
   Mitigación: persistir token y cargar usuario con `/auth/me` al iniciar.
3. Riesgo: botones que no hacen nada generan mala UX.  
   Mitigación: ocultar features incompletas o mostrar “próximamente”.
4. Riesgo: errores silenciosos en frontend.  
   Mitigación: centralizar manejo de errores en cliente API.
5. Riesgo: backend mock con datos inconsistentes.  
   Mitigación: definir claramente si MVP usa JSON DB o DB real, y mantener una sola fuente de verdad.

---

## 8) Definición de Terminado (DoD) MVP

MVP terminado si se cumplen todos:

1. Usuario nuevo puede registrarse y loguearse.
2. Usuario autenticado puede registrar hidratación y verla en historial.
3. Usuario puede crear/unirse/completar challenge.
4. Ranking muestra datos reales desde backend.
5. No hay pantallas accesibles con botones sin acción.
6. Logout funciona y bloquea rutas privadas.
7. Checklist de pruebas manuales pasa al 100%.

---

## 9) Pruebas manuales finales (go-live checklist)

1. Registro exitoso con usuario nuevo.
2. Login exitoso con usuario existente.
3. Error correcto con credenciales inválidas.
4. Home carga datos del usuario autenticado.
5. Registrar hidratación incrementa datos y aparece en historial.
6. Crear challenge aparece en listado.
7. Unirse/completar challenge actualiza estado en UI.
8. Ranking carga sin errores.
9. Logout limpia sesión y redirige a login.
10. Reabrir app mantiene sesión si token válido.

---

## 10) Plan sugerido de implementación (3 días)

## Día 1 (P0 auth + base integración)
1. BASE_URL, CORS, auth endpoints, AuthContext, rutas protegidas.
2. Validar flujo completo login/register/me/logout.

## Día 2 (P0 features core)
1. Hidratación (POST/GET + UI).
2. Challenges (listar/crear/unirse/completar + UI).

## Día 3 (P0 cierre + P1 estabilidad)
1. Ranking real.
2. Manejo de errores y estados de carga.
3. Quitar/ocultar features no listas (friends/recommendations).
4. Ejecutar checklist final.

---

## 11) Decisión técnica pendiente (importante)

Elegir una sola opción para MVP backend:

1. Mantener backend Node actual en [backend](backend) y completar rutas faltantes.
2. Migrar al backend Python de [backendmio](backendmio) y adaptar frontend.

Recomendación MVP rápida: opción 1 (menos cambio y menor riesgo inmediato).