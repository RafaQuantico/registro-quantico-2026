// Endpoint de Google Apps Script. 
// DEBE ser reemplazado por la URL de despliegue real que se obtendrá en el paso del Backend.
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxX4Y0Ar6AyDZsIkb8C-hUpMUoMM3yv_XFGTOs-Q9zLzrEbyX5Z7tqOG1cWW1G-yHgxRQ/exec';

document.addEventListener('DOMContentLoaded', () => {

    // Screens
    const screen1 = document.getElementById('screen-1');
    const screen2 = document.getElementById('screen-2');
    const screen3 = document.getElementById('screen-3');
    const screenForm = document.getElementById('screen-form');

    // Elements
    const btnStart = document.getElementById('btn-start');
    const btnRecord = document.getElementById('btn-record');
    const recordStatus = document.getElementById('record-status');
    const recordContainer = document.querySelector('.record-container');
    const uploadStatus = document.getElementById('upload-status');
    
    // New form elements
    const btnTextForm = document.getElementById('btn-text-form');
    const textForm = document.getElementById('text-form');
    const formUploadStatus = document.getElementById('form-upload-status');

    // Navigation
    function showScreen(screenToShow) {
        document.querySelectorAll('.screen').forEach(s => {
            s.classList.remove('active');
            // Adding a small timeout allows the CSS transition to play smoothly
            setTimeout(() => {
                if (!s.classList.contains('active')) {
                    s.classList.add('hidden');
                }
            }, 500);
        });

        screenToShow.classList.remove('hidden');
        // Force reflow
        void screenToShow.offsetWidth;
        screenToShow.classList.add('active');
    }

    btnStart.addEventListener('click', () => {
        showScreen(screen2);
    });

    btnTextForm.addEventListener('click', () => {
        showScreen(screenForm);
    });

    // Recording Logic
    let mediaRecorder;
    let audioChunks = [];
    let isRecording = false;

    btnRecord.addEventListener('click', async () => {
        if (!isRecording) {
            await startRecording();
        } else {
            stopRecording();
        }
    });

    async function startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Try to use webm or mp4, fallback to standard
            let options = {};
            if (MediaRecorder.isTypeSupported('audio/webm')) {
                options = { mimeType: 'audio/webm' };
            }

            mediaRecorder = new MediaRecorder(stream, options);
            audioChunks = [];

            mediaRecorder.ondataavailable = event => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = handleAudioData;
            mediaRecorder.start();

            isRecording = true;
            btnRecord.classList.add('recording');
            recordStatus.textContent = 'Grabando... Toca para detener';
            recordStatus.classList.add('recording');

        } catch (err) {
            console.error('Error accediendo al micrófono:', err);
            alert('No se pudo acceder al micrófono. Por favor, revisa los permisos de tu navegador.');
        }
    }

    function stopRecording() {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            // Detener todas las pistas de audio para liberar el hardware
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }

        isRecording = false;
        btnRecord.classList.remove('recording');
        recordStatus.textContent = 'Procesando...';
        recordStatus.classList.remove('recording');

        // Hide record button, show spinner
        recordContainer.style.display = 'none';
        uploadStatus.classList.remove('hidden');
    }

    function handleAudioData() {
        // Blob from chunks
        const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType || 'audio/webm' });

        // Convert Blob to Base64 to send via HTTP POST easily
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
            const base64Data = reader.result.split(',')[1];
            uploadAudio(base64Data, audioBlob.type);
        };
    }

    async function uploadAudio(base64Data, mimeType) {

        // Generate a random ID for the filename
        const filename = `registro_${Date.now()}.webm`;

        const payload = {
            type: 'audio',
            filename: filename,
            mimeType: mimeType,
            data: base64Data
        };

        if (GOOGLE_SCRIPT_URL === 'REEMPLAZAR_CON_TU_URL_DE_APPS_SCRIPT') {
            console.warn("Advertencia: No has configurado la URL de Google Apps Script. Simulando envío...");
            setTimeout(() => {
                showScreen(screen3);
            }, 1500);
            return;
        }

        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                // Modo no-cors podría ser necesario si hay problemas de CORS con Apps Script,
                // pero fetch en modo text/plain suele funcionar sin preflight.
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.status === 'success') {
                showScreen(screen3);
            } else {
                throw new Error(result.message || 'Error desconocido');
            }

        } catch (error) {
            console.error('Error al subir el archivo:', error);
            alert('Hubo un problema enviando el registro. Por favor, intenta nuevamente.');
            // Reset UI
            recordContainer.style.display = 'flex';
            uploadStatus.classList.add('hidden');
            recordStatus.textContent = 'Toca para grabar';
        }
    }

    // Text Form Logic
    textForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btnSubmit = textForm.querySelector('button[type="submit"]');
        btnSubmit.style.display = 'none';
        formUploadStatus.classList.remove('hidden');

        const formData = new FormData(textForm);
        const payload = {
            type: 'text',
            nombre: formData.get('nombre'),
            correo: formData.get('correo'),
            empresa: formData.get('empresa')
        };

        if (GOOGLE_SCRIPT_URL === 'REEMPLAZAR_CON_TU_URL_DE_APPS_SCRIPT') {
            setTimeout(() => {
                showScreen(screen3);
            }, 1500);
            return;
        }

        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Evita bloqueos CORS desde localhost o cualquier dominio
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
                body: JSON.stringify(payload)
            });

            // Con mode: 'no-cors' la respuesta es opaca, por lo que si no lanza error de red, asumimos éxito
            showScreen(screen3);

        } catch (error) {
            console.error('Error al enviar el formulario:', error);
            alert('Hubo un problema enviando el registro. Por favor, intenta nuevamente.');
            btnSubmit.style.display = 'block';
            formUploadStatus.classList.add('hidden');
        }
    });
});
