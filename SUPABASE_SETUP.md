# Configuración de Supabase

Este proyecto usa Supabase para base de datos PostgreSQL y almacenamiento de archivos en producción.

## Variables de Entorno Requeridas

Añade estas variables a tu `.env.local` (desarrollo) y a las variables de entorno de tu plataforma de deployment (producción):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://ugaxjotnixozmgazlzdu.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-anon-key-aqui"
SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key-aqui"

# Database URL (obtener de Supabase Dashboard > Project Settings > Database)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
```

## Obtener las Credenciales de Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **Project Settings** > **API**
3. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Mantener segura, solo servidor)

4. Para el DATABASE_URL:
   - Ve a **Project Settings** > **Database**
   - En "Connection string" selecciona **Transaction mode** o **Session mode**
   - Copia la URI y reemplaza `[YOUR-PASSWORD]` con tu contraseña de base de datos

## Configuración de Storage en Supabase

### 1. Crear Buckets

En Supabase Dashboard > Storage, crea **tres** buckets:

#### Bucket: `images`
- **Public**: ✅ Sí
- **File size limit**: 50 MB
- **Allowed MIME types**: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`, `image/gif`

#### Bucket: `videos`
- **Public**: ✅ Sí
- **File size limit**: 200 MB (o el límite que prefieras)
- **Allowed MIME types**: `video/mp4`, `video/webm`, `video/ogg`, `video/quicktime`, `video/x-msvideo`

#### Bucket: `documents`
- **Public**: ✅ Sí  
- **File size limit**: 50 MB
- **Allowed MIME types**: 
  - PDFs: `application/pdf`
  - Word: `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
  - Excel: `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
  - PowerPoint: `application/vnd.ms-powerpoint`, `application/vnd.openxmlformats-officedocument.presentationml.presentation`
  - Archives: `application/zip`, `application/x-zip-compressed`, `application/x-rar-compressed`, `application/x-7z-compressed`
  - Text: `text/plain`

### 2. Políticas de Acceso (RLS)

Para cada bucket, añade estas políticas en Storage > Policies:

**Policy Name**: "Public Read Access"
- **Allowed operation**: SELECT
- **Target roles**: public
- **USING expression**: `true`

**Policy Name**: "Authenticated Upload"
- **Allowed operation**: INSERT
- **Target roles**: authenticated
- **WITH CHECK expression**: `true`

**Policy Name**: "Authenticated Delete"
- **Allowed operation**: DELETE
- **Target roles**: authenticated
- **USING expression**: `true`

## Migrar Base de Datos a Supabase

1. Asegúrate de tener las migraciones generadas:
```bash
pnpm db:generate
```

2. Ejecuta las migraciones contra Supabase:
```bash
# Actualiza DATABASE_URL a tu Supabase URL
pnpm db:migrate
```

3. O usa Drizzle Studio para ver/editar datos:
```bash
pnpm db:studio
```

## Funcionamiento

### Desarrollo (Local)
- ✅ Base de datos: PostgreSQL local
- ✅ Archivos: Sistema de archivos local (`/public/uploads`)

### Producción (Supabase)
- ✅ Base de datos: Supabase PostgreSQL
- ✅ Archivos: Supabase Storage (buckets `images`, `videos` y `documents`)
- ⚠️ **Importante**: En producción (Vercel, etc.) NO se puede escribir en `/public`, por eso todos los archivos van a Supabase

El sistema detecta automáticamente el entorno usando `NODE_ENV` y usa el servicio correspondiente.

## Verificar Configuración

Para verificar que todo está configurado correctamente:

1. Verifica que las variables de entorno estén cargadas:
```bash
pnpm dev
```

2. El servidor debe iniciarse sin errores de validación de env

3. Intenta subir una imagen desde el panel de administración

4. Verifica en Supabase Dashboard > Storage que el archivo aparece en el bucket correspondiente

## Seguridad

⚠️ **IMPORTANTE**: 
- Nunca expongas `SUPABASE_SERVICE_ROLE_KEY` en el cliente
- Solo usa esta key en rutas API del servidor
- La `NEXT_PUBLIC_SUPABASE_ANON_KEY` es segura para el cliente (tiene RLS habilitado)

## Troubleshooting

### Error: "No storage bucket found, `videos`"
- Verifica que los buckets `images` y `documents` existen en Supabase Storage
- Verifica que tienen políticas de acceso público

### Error: "Invalid credentials"
- Verifica que `SUPABASE_SERVICE_ROLE_KEY` es correcta
- No uses la anon key para operaciones del servidor

### Error: "Connection refused"
- Verifica que `DATABASE_URL` apunta al pooler de Supabase (puerto 6543)
- Verifica que tu IP está en la lista permitida si tienes restricciones

### Archivos no se ven después de subir
- Verifica que el bucket tiene política de lectura pública
- Verifica que la URL pública es correcta
- Revisa los logs en Supabase Dashboard > Logs
