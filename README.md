# Formulario de Registro - Quantico & Kunza.ai 2026

Este proyecto es una aplicación web minimalista de 3 pantallas diseñada para registrar asistentes al evento "Deep tech para la nueva minería". 

Permite a los usuarios registrarse mediante un **mensaje de voz** o a través de un **formulario de texto alternativo**.

## 🏗 Arquitectura del Proyecto

El proyecto está dividido en dos partes principales para mantener la seguridad y evitar exponer credenciales o claves de API.

### 1. Frontend (Vercel / GitHub)
Es una aplicación web estática construida con **HTML, CSS y JavaScript Puro** (Vanilla).
- **`index.html`**: Contiene las 3 pantallas de la aplicación (Bienvenida, Grabación/Formulario de Texto, Despedida).
- **`style.css`**: Define el diseño minimalista (blanco/negro) y las micro-animaciones usando la fuente *Inter*.
- **`app.js`**: Maneja la navegación, la captura del micrófono (MediaRecorder API) y el envío de datos al backend mediante peticiones `fetch`. Utiliza el modo `no-cors` para evitar bloqueos de seguridad en navegadores móviles.

**Despliegue Frontend**:
El código fuente está en el repositorio de GitHub: `RafaQuantico/registro-quantico-2026`. Para ponerlo en línea, basta con conectar este repositorio a **Vercel**. Vercel proveerá un certificado seguro (HTTPS), lo cual es **obligatorio** para que el navegador permita acceder al micrófono de los usuarios.

### 2. Backend (Google Apps Script)
Dado que necesitamos guardar archivos en Drive, registrar filas en Sheets y enviar correos, el backend es un script alojado directamente en la cuenta de Google (Google Apps Script). Esto actúa como un puente seguro.

- Recibe los datos del frontend (tipo audio o tipo texto).
- Si es **Audio**: Decodifica el Base64, lo guarda en Google Drive como `.webm`, anota la fecha/hora y URL en Google Sheets, y notifica por correo electrónico.
- Si es **Texto**: Anota directamente los datos en Google Sheets y notifica por correo electrónico.

**Credenciales Configuradas en el Script Actual**:
- **Carpeta Drive ID**: `1Zav2AH_Ob90hfHI70Q7UsL0W2_i7Ojvl`
- **Planilla Sheets ID**: `1i6tNzEfeflP_vUFtDatgp50yzNHXhraqPpw8T7AQy-0`
- **Correo de Destino Notificaciones**: `jorge@quantico.cl`

## 🛠 Entorno de Desarrollo Local

Si cambias de computador y necesitas seguir desarrollando o probando la aplicación:

1. Clona el repositorio: `git clone https://github.com/RafaQuantico/registro-quantico-2026.git`
2. Abre la carpeta del proyecto.
3. Para probar la grabación del micrófono y las animaciones, **no** puedes simplemente hacer doble clic en `index.html`. Debes levantar un servidor web local. Desde la terminal, ejecuta:
   ```bash
   python3 -m http.server 8000
   ```
4. Ingresa a `http://localhost:8000` en tu navegador.

*(Nota: En localhost, el micrófono funciona por defecto sin HTTPS. Sin embargo, en cualquier otro dominio que no sea localhost, necesitarás HTTPS estrictamente).*

## 📖 Actualizando el Backend (Google Apps Script)

Si en el futuro necesitas cambiar la carpeta, la planilla, o los textos del correo electrónico, no modificarás nada en el código frontend, sino en Google Apps Script:

1. El código actual y completo de este script se encuentra documentado en el archivo **`INSTRUCCIONES_BACKEND.md`** dentro de esta misma carpeta.
2. Si lo modificas en Google, siempre debes hacer clic en **Implementar -> Administrar implementaciones -> Editar (icono lápiz) -> Versión: "Nueva versión"** para que los cambios surtan efecto.
3. Si al hacer la nueva implementación la URL cambia, **deberás actualizar** la constante `GOOGLE_SCRIPT_URL` en la línea 3 del archivo `app.js` y hacer un `git push` a GitHub para que Vercel se actualice.

---
**Estado Actual (Última actualización)**: 
- El frontend está listo y subido a GitHub. 
- El código de Google Apps Script está escrito con la funcionalidad de correos, subida de archivos y planillas (solo resta que el dueño de la cuenta de Google lo despliegue en *script.google.com* como "Nueva versión").
