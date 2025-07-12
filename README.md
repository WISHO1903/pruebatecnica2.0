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





