# ExtremeNotes - Microservices Notes App

## Integrantes del Equipo
| Integrante | Rol |
|-----------|-----|
| Víctor Ordoñez | 
| Franchesca figueroa|
| Alejandra cuetia |

---

# Descripción General del Proyecto

ExtremeNotes es una aplicación web diseñada para gestionar notas personales mediante una arquitectura cloud modular basada en microservicios.  
El sistema demuestra los temas vistos durante el curso: arquitectura cloud, contenedores, CI/CD, monitoreo, pruebas de rendimiento, costos y escalabilidad.

---

# Arquitectura General

El proyecto se divide en dos microservicios principales:

### 1. Frontend (React + Vite)
- Interfaz de usuario.
- Despliegue automático mediante GitHub Pages.
- Consume la API del backend.

### 2. Backend (Node.js + Express + MongoDB)
- Endpoints REST para CRUD de notas.
- Exposición de métricas en /metrics usando prom-client.
- Preparado para escalabilidad horizontal.

Los servicios se ejecutan mediante Docker y docker-compose.

---

# Contenedores y Orquestación

Dockerfiles incluidos:

- backend/Dockerfile
- frontend/Dockerfile

Orquestación con docker-compose:

```
docker-compose up --build
```

---

# CI/CD (GitHub Actions)

La automatización se realiza mediante .github/workflows/ci.yml:

Incluye:

- Instalación de dependencias
- Ejecución de pruebas
- Construcción de frontend y backend
- Deploy automático del frontend a GitHub Pages

Configurado con permisos:

```
permissions:
  contents: write
  pages: write
  id-token: write
```

Estado: CI/CD funcional.

---

# Despliegue

### Frontend desplegado en GitHub Pages:
https://victorOR18532.github.io/ExtremeNotes/

### Backend ejecución local:
```
docker-compose up --build
```

---

# Tecnologías Utilizadas

### Frontend
- React 18
- Vite
- GitHub Pages

### Backend
- Node.js
- Express
- MongoDB Atlas
- prom-client

### DevOps / Arquitectura
- Docker
- Docker Compose
- GitHub Actions
- Prometheus
- Grafana
- k6

---

# Guía Para Ejecutar el Proyecto

## 1. Clonar el repositorio
```
git clone https://github.com/victorOR18532/ExtremeNotes.git
cd ExtremeNotes
```

## 2. Ejecutar todo con Docker
```
docker-compose up --build
```

Servicios:
- Frontend → http://localhost:3000  
- Backend → http://localhost:4000  
- Métricas → http://localhost:4000/metrics  

## 3. Ejecutar backend manualmente
```
cd backend
npm install
npm start
```

## 4. Ejecutar frontend manualmente
```
cd frontend
npm install
npm run dev
```

## 5. Ejecutar pruebas de rendimiento con k6
```
cd k6
k6 run load-test.js
```

---

# Monitoreo y Métricas

El backend expone métricas en `/metrics`.

Metricas incluidas:
- Latencia
- Total de peticiones
- Status codes
- Tiempo de respuesta
- Uso de memoria

Prometheus configurado con:

```
scrape_configs:
  - job_name: backend
    static_configs:
      - targets: ['backend:4000']
```

Grafana utilizado para dashboards (latencia, errores, RPS, uso de recursos).

---

# Pruebas de Rendimiento (k6)

Ubicado en /k6/load-test.js

Ejemplo:
```
k6 run load-test.js
```

Resultados guardados en /evidencias/k6/

---

# Estimación de Costos y Sostenibilidad

- GitHub Pages: costo 0
- MongoDB Atlas Free Tier: gratuito
- Docker local: gratuito

Estrategias de sostenibilidad:
- Contenedores ligeros (Node Alpine)
- Ejecutar CI/CD solo en cambios
- Servicios desacoplados
- Monitoreo activo para optimización de recursos

---

# Aplicación de Temas del Curso

| Tema | Implementación |
|------|----------------|
| Arquitectura Cloud | Microservicios + Docker |
| CI/CD | GitHub Actions funcional |
| Contenedores | Dockerfile y docker-compose |
| Monitoreo | Prometheus + Grafana |
| Pruebas | k6 load test |
| Escalabilidad | Contenedores escalables |
| Costos | Infraestructura gratuita |

---

# Evidencias

La carpeta `/evidencias` contiene:

- Arquitectura del sistema
- Capturas de k6
- Métricas Prometheus
- Dashboards Grafana
- Costos estimados
- Ejecución en Docker
- Logs
- Estado del pipeline CI/CD

---

# Video Final

Debe incluir:

1. Presentación personal y profesional  
2. Explicación técnica  
3. Demostración funcional  
4. Pruebas y monitoreo  
5. CI/CD  
6. Cierre  

---

# Contacto

Para dudas y soporte técnico, contactar al equipo mediante GitHub.




Access the app at http://localhost:8080/
