# 📱 **SmartStream – Plataforma multimedia + Foro + Notificaciones**

<div align="center">
  <img src="https://img.shields.io/badge/Flutter-3.19-blue?logo=flutter&style=flat-square">
  <img src="https://img.shields.io/badge/Dart-3.3-blue?logo=dart&style=flat-square">
  <img src="https://img.shields.io/badge/Backend-Spring Boot 3.5-green?logo=spring&style=flat-square">
  <img src="https://img.shields.io/badge/Database-MySQL-orange?logo=mysql&style=flat-square">
  <img src="https://img.shields.io/badge/Notifications-FCM / Awesome-lightgrey?logo=firebase&style=flat-square">
</div>

---

##  **Descripción del proyecto**

**SmartStream** es una plataforma multimedia desarrollada en **Flutter**, que permite:

-  Reproducir contenido multimedia **interno y externo** (AceStream/AcePlayer).
-  Visualizar catálogo de **películas, series y deportes**.
-  Participar en un **foro** (crear posts, comentar, responder).
-  Recibir **notificaciones push** en tiempo real (nuevo post / nueva respuesta).
-  Gestión completa de usuarios: registro, login JWT, edición, eliminación.
-  Compatibilidad con **Fire TV / Android TV**.

Proyecto desarrollado como parte de la asignatura **Calidad de los Sistemas Informáticos** (UCA).

---

---

##  **Características principales**

###  Plataforma multimedia
- Catálogo dinámico de películas, series y deportes.
- Reproducción interna.
- Reproducción externa mediante:
  - **acestream://**
  - **aceplayer://**

###  Foro integrado
- Crear posts.
- Comentar posts.
- Responder comentarios.
- Eliminar posts/comentarios propios.
- Vista anidada estilo chat.
- Notificaciones cuando alguien responde a tu comentario.

###  Notificaciones push
- Registro automático del token FCM.
- Notificación por:
  -  Nuevos posts.
  -  Nuevas respuestas.

### Gestión de usuario
- Registro.
- Login con JWT.
- Recuperación de contraseña.
- Ver perfil.
- Editar perfil.
- Eliminar cuenta.
- Multi-dispositivo.

###  Compatibilidad Fire TV
- Navegación sin touch.
- Optimización para control remoto.
- Reproducción adaptada a TV.

---

##  **Arquitectura del sistema**

###  Frontend — Flutter

Usa:
- Dio / HTTP
- Firebase Messaging
- Awesome Notifications
- Navegación por rutas
- Integración con apps externas (AcePlayer)

###  Backend — Spring Boot
Usa:
- JWT
- MySQL
- JPA + Hibernate
- Auditoría con Envers
- Controladores REST
- Servicios de notificaciones

---

## 🧪 **Endpoints principales del Backend**

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/login` | Iniciar sesión |
| POST | `/auth/register` | Registrar usuario |
| POST | `/usuarios/fcm-token` | Registrar token FCM |
| GET  | `/contenido` | Obtener catálogo |
| GET  | `/foro/posts` | Listar posts |
| POST | `/foro/posts` | Crear post |
| POST | `/foro/comments` | Crear comentario |
| DELETE | `/foro/comments/{id}` | Eliminar comentario |


---


