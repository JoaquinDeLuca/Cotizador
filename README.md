# Cotizador

App construida con **Next.js**, **Prisma** y **PostgreSQL**.

#### Usuario de prueba

- m.lopez@solucionesandes.com.ar
- Martalopez321

## 🛠️ Desarrollo local

### 1. Clonar el proyecto y configurar el entorno

```bash
git clone https://github.com/JoaquinDeLuca/Cotizador.git
cd Cotizador
```

Crear un `.env` tomando de referencia el `.env.template`:

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/cotizador_dev
JWT_SECRET=
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. (Opcional) Levantar PostgreSQL local con Docker

Si no tienes una base, podés usar el siguiente `docker-compose.yml`:

```bash
docker-compose up -d
```

Esto levantará PostgreSQL local en `localhost:5432` con:

- Usuario: `user`
- Contraseña: `pass`
- Base de datos: `cotizador_dev`

# Consideraciones

Antes de cargar compañías, la base de datos debe contener monedas y categorías de producto.

Ajusta los archivos:

- prisma/seedCategoriesAndCurrencies.ts → para definir monedas y categorías.

- prisma/seedCompanies.ts → para definir compañías.

Para correr los seeds

```bash
pnpm run seed
```

---

### 4. Generar y aplicar esquema de Prisma

```bash
pnpm dlx prisma generate
pnpm dlx prisma migrate dev --name init
```

### 5. Ejecutar la app en modo desarrollo

```bash
pnpm dev
```

📍 Disponible en: http://localhost:3000

---

## 🧳 Variables de entorno necesarias

| Variable       | Descripción                          |
| -------------- | ------------------------------------ |
| `DATABASE_URL` | URL de conexión a la base PostgreSQL |
| `JWT_SECRET`   | JWT secret                           |

---

## 🐳 docker-compose.yml (opcional para desarrollo)

```yaml
version: "3.8"

services:
  db:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: cotizador_dev
    ports:
      - "5432:5432"
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
```
