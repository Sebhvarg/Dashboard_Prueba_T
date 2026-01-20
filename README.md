# Dashboard - Sistema de Gestion de Pedidos y Clientes

## Descripcion del Proyecto

Dashboard es una aplicacion web full-stack para la gestion de pedidos y clientes. El sistema cuenta con un frontend desarrollado en Angular y un backend basado en microservicios con .NET 8.

## Tecnologias Utilizadas

### Frontend

- Angular 17.3
- TypeScript 5.4
- TailwindCSS 3.4
- Chart.js / ng2-charts (para graficos)
- Karma / Jasmine (para pruebas unitarias)

### Backend

- .NET 8.0
- ASP.NET Core Web API
- Entity Framework Core 8.0
- SQL Server 2022
- JWT para autenticacion
- BCrypt para encriptacion de contrasenas
- Swagger/OpenAPI para documentacion

### Infraestructura

- Docker / Docker Compose

## Estructura del Proyecto

```
Dashboard/
├── src/                          # Codigo fuente del frontend (Angular)
│   ├── app/
│   │   ├── components/           # Componentes reutilizables
│   │   ├── guards/               # Guards de rutas
│   │   ├── models/               # Modelos de datos
│   │   ├── pages/                # Paginas principales
│   │   │   ├── clients/          # Gestion de clientes
│   │   │   ├── dashboard/        # Panel principal
│   │   │   ├── login/            # Inicio de sesion
│   │   │   └── orders/           # Gestion de pedidos
│   │   └── services/             # Servicios (API, Auth, Client, Order)
│   └── assets/                   # Recursos estaticos
├── backend/                      # Codigo fuente del backend (.NET)
│   ├── AuthService/              # Microservicio de autenticacion
│   │   ├── Controllers/          # Controladores de API
│   │   ├── DTOs/                 # Data Transfer Objects
│   │   ├── Data/                 # Contexto de base de datos
│   │   ├── Models/               # Modelos de entidades
│   │   └── Migrations/           # Migraciones de EF Core
│   ├── OrdersService/            # Microservicio de pedidos
│   │   ├── Controllers/          # Controladores de API
│   │   ├── Data/                 # Contexto de base de datos
│   │   ├── Models/               # Modelos de entidades
│   │   └── Migrations/           # Migraciones de EF Core
│   └── tests/                    # Pruebas unitarias e integracion
└── docker-compose.yml            # Configuracion de contenedores
```

## Requisitos Previos

Antes de ejecutar el proyecto, asegurese de tener instalado:

- Node.js (version 18 o superior)
- npm (incluido con Node.js)
- Angular CLI 17.3
- .NET SDK 8.0
- Docker y Docker Compose
- SQL Server 2022 (o usar el contenedor Docker)

## Pasos para Ejecutar el Proyecto

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd Dashboard
```

### 2. Iniciar la Base de Datos

Ejecutar el contenedor de SQL Server con Docker Compose:

```bash
docker-compose up -d
```

Esto iniciara una instancia de SQL Server 2022 en el puerto 1433 con las siguientes credenciales:

- Usuario: sa
- Contrasena: Admin1234!

### 3. Configurar y Ejecutar el Backend

#### AuthService (Puerto 5001)

```bash
cd backend/AuthService
dotnet restore
dotnet run
```

Al iniciar el AuthService por primera vez:

- Las migraciones de la base de datos se aplican automaticamente
- Se crea un usuario administrador con las siguientes credenciales:
  - Usuario: admin
  - Contrasena: Admin1234!
  - Rol: Admin

#### OrdersService (Puerto 5002)

En una nueva terminal:

```bash
cd backend/OrdersService
dotnet restore
dotnet ef database update
dotnet run
```

### 4. Configurar y Ejecutar el Frontend

En una nueva terminal:

```bash
cd Dashboard
npm install
ng serve
```

La aplicacion estara disponible en: http://localhost:4200

## Comandos Utiles

### Frontend

| Comando                          | Descripcion                             |
| -------------------------------- | --------------------------------------- |
| `npm start`                      | Inicia el servidor de desarrollo        |
| `npm run build`                  | Compila el proyecto para produccion     |
| `npm test`                       | Ejecuta las pruebas unitarias con Karma |
| `ng generate component <nombre>` | Genera un nuevo componente              |

### Backend

| Comando                             | Descripcion                       |
| ----------------------------------- | --------------------------------- |
| `dotnet restore`                    | Restaura las dependencias         |
| `dotnet build`                      | Compila el proyecto               |
| `dotnet run`                        | Ejecuta el servicio               |
| `dotnet test`                       | Ejecuta las pruebas unitarias     |
| `dotnet ef migrations add <nombre>` | Crea una nueva migracion          |
| `dotnet ef database update`         | Aplica las migraciones pendientes |

### Docker

| Comando                | Descripcion                              |
| ---------------------- | ---------------------------------------- |
| `docker-compose up -d` | Inicia los contenedores en segundo plano |
| `docker-compose down`  | Detiene y elimina los contenedores       |
| `docker-compose logs`  | Muestra los logs de los contenedores     |

## Endpoints de la API

### AuthService (http://localhost:5001)

- POST /api/auth/register - Registro de usuarios
- POST /api/auth/login - Inicio de sesion

### OrdersService (http://localhost:5002)

- GET /api/orders - Obtener todos los pedidos
- POST /api/orders - Crear un pedido
- GET /api/orders/stats - Obtener estadisticas
- GET /api/clients - Obtener todos los clientes
- POST /api/clients - Crear un cliente

## Pruebas

### Ejecutar pruebas del Frontend

```bash
npm test
```

### Ejecutar pruebas del Backend

```bash
cd backend/tests/AuthService.Tests
dotnet test

cd backend/tests/OrdersService.Tests
dotnet test
```

## Documentacion de la API

Una vez iniciados los servicios del backend, la documentacion Swagger estara disponible en:

- AuthService: http://localhost:5001/swagger
- OrdersService: http://localhost:5002/swagger

## Notas Adicionales

- Asegurese de que los puertos 4200, 5001, 5002 y 1433 esten disponibles antes de ejecutar los servicios.
- Las migraciones de Entity Framework Core deben ejecutarse antes de iniciar los servicios por primera vez.
- Para desarrollo, el proyecto utiliza certificados HTTPS autofirmados de .NET.

## Licencia

Este proyecto es de uso privado.
