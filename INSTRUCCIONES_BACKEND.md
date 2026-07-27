# Configuración del Backend (Google Apps Script)

Para que el formulario pueda guardar los audios en Google Drive y los registros en Google Sheets sin comprometer la seguridad, debes publicar un "Google Apps Script". 

## Pasos a seguir:

1. Ve a [script.google.com](https://script.google.com/) e inicia sesión con tu cuenta de Google (la que tiene acceso a la carpeta y planilla).
2. Haz clic en **Nuevo proyecto**.
3. Ponle un nombre, por ejemplo: `Registro Quantico 2026`.
4. Borra cualquier código que haya en el editor y pega el siguiente código completo:

```javascript
// Configuración de IDs
const FOLDER_ID = '1Zav2AH_Ob90hfHI70Q7UsL0W2_i7Ojvl';
const SHEET_ID = '1i6tNzEfeflP_vUFtDatgp50yzNHXhraqPpw8T7AQy-0';
const EMAIL_DESTINO = 'jorge@quantico.cl, rafael@quantico.cl';

function probarEnvio() {
  GmailApp.sendEmail("jorge@quantico.cl", "Prueba de permiso", "Si te llega esto, los permisos están arreglados.");
}

function doPost(e) {
  try {
    if (typeof e === 'undefined') {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "No data received" })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = JSON.parse(e.postData.contents);
    const type = data.type;
    
    const now = new Date();
    const fecha = Utilities.formatDate(now, "America/Santiago", "dd/MM/yyyy");
    const hora = Utilities.formatDate(now, "America/Santiago", "HH:mm:ss");
    
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    let cuerpoEmail = "";
    
    if (type === 'audio') {
      const base64Data = data.data;
      const filename = data.filename;
      const mimeType = data.mimeType;
      
      const folder = DriveApp.getFolderById(FOLDER_ID);
      const decodedData = Utilities.base64Decode(base64Data);
      const blob = Utilities.newBlob(decodedData, mimeType, filename);
      const file = folder.createFile(blob);
      
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      const fileUrl = file.getUrl();
      
      sheet.appendRow([fecha, hora, fileUrl, "", "", "", ""]);
      
      cuerpoEmail = `Se ha recibido un nuevo registro de audio.\n\nFecha: ${fecha}\nHora: ${hora}\nEnlace para escuchar el audio: ${fileUrl}`;
      
      GmailApp.sendEmail(EMAIL_DESTINO, "Nuevo Registro para el Evento de Quantico", cuerpoEmail);
      
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', url: fileUrl })).setMimeType(ContentService.MimeType.JSON);
      
    } else if (type === 'text') {
      const nombre = data.nombre || "";
      const correo = data.correo || "";
      const telefono = data.telefono || "";
      const empresa = data.empresa || "";
      
      // Orden: Fecha, Hora, Audio, Nombre, Correo, Teléfono, Empresa
      sheet.appendRow([fecha, hora, "Sin Audio", nombre, correo, telefono, empresa]);
      
      cuerpoEmail = `Se ha recibido un nuevo registro de texto.\n\nFecha: ${fecha}\nHora: ${hora}\nNombre: ${nombre}\nCorreo: ${correo}\nTeléfono: ${telefono}\nEmpresa: ${empresa}`;
      
      GmailApp.sendEmail(EMAIL_DESTINO, "Nuevo Registro para el Evento de Quantico", cuerpoEmail);
      
      return ContentService.createTextOutput(JSON.stringify({ status: 'success' })).setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doOptions(e) {
  return ContentService.createTextOutput("OK").setMimeType(ContentService.MimeType.TEXT);
}
```

5. Haz clic en el botón azul de **Implementar** (Deploy) en la esquina superior derecha y selecciona **Nueva implementación**.
6. En tipo, selecciona **Aplicación Web** (icono de engranaje).
7. Rellena los datos:
   - Ejecutar como: **Yo** (tu correo)
   - Quién tiene acceso: **Cualquier persona** (Esto es clave para que el frontend pueda enviar datos sin iniciar sesión).
8. Haz clic en **Implementar**.
9. Te pedirá **Autorizar accesos**. Sigue los pasos (Google te puede decir que es inseguro porque es tu propio script, haz clic en "Avanzado" -> "Ir al proyecto (inseguro)").
10. ¡Copia la **URL de la aplicación web** que te generará!

## Último paso en el código:

Abre el archivo `app.js` de tu proyecto (el frontend que creamos) y en la **Línea 3**, reemplaza el texto `REEMPLAZAR_CON_TU_URL_DE_APPS_SCRIPT` por la URL que copiaste en el paso 10.

Debe quedar algo como:
`const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycb.../exec';`

¡Listo! Cuando subas este proyecto a Vercel a través de Github, funcionará perfectamente grabando el audio y enviándolo a tu Drive.
