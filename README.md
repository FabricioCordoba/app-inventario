# Sistema de Inventario — Bomberos Voluntarios de Barker

Monorepo del sistema de digitalización de inventarios.

## Estructura

```
app-inventarios/
├── backend/     # API NestJS + TypeORM + MySQL
├── frontend/    # Web React + Vite + CSS Modules
└── docs/        # Documentación (futuro)
```

## Requisitos

- Node.js 20+
- MySQL 8+
- npm

## Inicio rápido

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run migration:run
npm run seed
npm run start:dev
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Stack

| Capa | Tecnología |
|------|------------|
| API | NestJS, TypeScript, TypeORM, MySQL, JWT, bcrypt |
| Web | React, TypeScript, Vite, CSS Modules |
| Móvil V1 | Flutter Android (futuro) |

## Git

Inicializar commits localmente desde la raíz. El remoto puede vincularse en cualquier momento:

```bash
git remote add origin <url-del-repositorio>
git push -u origin main
```
