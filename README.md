# pruebatecnica2.0
prueba lowcode

Este proyecto es una aplicación SaaS desarrollada con **Next.js 14**, **Supabase**, **Stripe** y **N8N**, que permite a los usuarios autenticarse, registrar métodos de pago y visualizar información personalizada desde su dashboard.

---

## Funcionalidades

- Autenticación de usuarios con Supabase
- Protección de rutas (auth + dashboard)
- Registro y visualización de métodos de pago con Stripe
- Webhook con N8N para eventos personalizados
- UI responsiva y moderna con Tailwind CSS (puede mejorarse el UI mucho)
- Despliegue en Vercel (aun trabajando en este aspecto)

---

## Tecnologías usadas

- Next.js 14 (App Router)
- Supabase (Auth y Base de Datos)
- Stripe (pagos y métodos de pago)
- Tailwind CSS
- N8N (automatización con webhooks)
- Vercel (deploy)

---

## Configuración del entorno

1. Clona el repositorio:
2. Instala las dependencias (con npm install en la carpeta)
3. Crear el archivo .envlocal ( o copiarlo directamente)
4. Colocar tus llaves correctas en el archivo .env(NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...)


## Scripts 
npm run dev # Modo desarrollo
npm run build # Build de producción
npm start # Iniciar build local

## Estructura de las carpetas

src/
├── app/
│ ├── auth/ → Página de login/register
│ ├── dashboard/ → Dashboard del usuario
│ └── api/
│ └── stripe/
│ ├── setup-intent/route.ts → Crear SetupIntent y cliente de Stripe
│ └── payment-methods/route.ts → Verificar tarjetas guardadas
├── components/
│ └── PaymentForm.tsx → Formulario Stripe para guardar tarjeta
├── hooks/
│ └── useUsers.ts → Hook para acceder al usuario autenticado
└── lib/
└── supabase.ts → Cliente Supabase

## Funcionalidad del dashboard

- Vista **Bienvenida** con saludo personalizado
- Vista **Cuenta** con:
  - Email e ID del usuario
  - Estado de tarjeta registrada
  - Listado de tarjetas guardadas (marca, últimos 4 dígitos, expiración)
- Vista **Agregar método de pago** con formulario de Stripe
- Botón de **Cerrar sesión**

---

## Integración con N8N

El webhook de N8N recibe una notificación **cuando un usuario guarda su tarjeta exitosamente**.  
Puedes configurarlo para enviar correos, guardar logs o iniciar otros flujos automáticos.

Ejemplo de webhook: https://elwichopato.app.n8n.cloud/webhook/742cfae3-1619-454c-8e55-5585dc820734

## Deploy en Vercel (aun no funciona revisando el porque aun asi)

1. Sube tu repositorio a GitHub
2. Conecta el repo en [https://vercel.com](https://vercel.com)
3. Configura las variables de entorno en **Settings → Environment Variables**
4. Haz deploy

Resultado: https://vercel.com/patriciotamez193-gmailcoms-projects/pruebatecnica2-0/CH5dSN6qrqzZ5AN8DjbNEbY1mC4B


## Codigo

## `/src/app/auth/page.tsx`

Página de autenticación donde los usuarios pueden registrarse o iniciar sesión usando Supabase. Incluye formularios controlados, validación básica y redirección al dashboard si el login es exitoso. Utiliza `supabase.auth.signUp()` y `supabase.auth.signInWithPassword()`.

### `/src/app/dashboard/page.tsx`

Es la página principal del usuario autenticado. Está protegida, por lo que redirige a `/auth` si no hay sesión activa. Tiene tres vistas internas gestionadas por estado local:

- **Bienvenida:** muestra saludo personalizado
- **Cuenta:** muestra el email, ID del usuario, y tarjetas registradas
- **Agregar Método de Pago:** formulario para guardar tarjetas en Stripe

También permite cerrar sesión con `supabase.auth.signOut()`.

### `/src/app/api/stripe/setup-intent/route.ts`

API Route (usando App Router) que:

1. Verifica si el usuario ya tiene un `stripe_customer_id` en Supabase.
2. Si no existe, crea un cliente en Stripe y guarda el ID en Supabase.
3. Crea un **SetupIntent** de Stripe para permitir guardar una tarjeta.
4. Retorna el `clientSecret` necesario para el frontend.


### `/src/app/api/stripe/payment-methods/route.ts`

API Route para consultar los métodos de pago de un usuario. Recibe el `user_id` y:

1. Busca su `stripe_customer_id` en Supabase.
2. Si existe, consulta con la API de Stripe los métodos de pago tipo "card".
3. Devuelve un listado con marca, últimos 4 dígitos y fecha de expiración.

### `/src/components/PaymentForm.tsx`

Formulario frontend para guardar métodos de pago usando Stripe Elements. Utiliza:

- `loadStripe()` y `<Elements>` para integrar Stripe en React
- `<CardElement />` para mostrar el campo de tarjeta
- `stripe.confirmCardSetup()` con el `clientSecret` del backend

Después de guardar la tarjeta, opcionalmente envía un webhook a N8N.

### `/src/hooks/useUsers.ts`

Hook personalizado que encapsula la lógica para acceder a la sesión de Supabase en el cliente. Devuelve un objeto con:

- `session`: la sesión actual (o `null` si no hay)
- `user`: objeto de usuario (si está autenticado)

Permite acceder de forma centralizada al usuario actual desde cualquier componente.

### `/src/lib/supabase.ts`

Archivo que inicializa y exporta el cliente de Supabase, tanto para el cliente (browser) como para el servidor (API routes). Usa las variables de entorno:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Este cliente es usado en todo el proyecto para funciones de login, logout, queries y updates




