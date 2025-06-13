// script.js
// Presentador de Slides PDF/DOCX
// Requiere PDF.js, Mammoth.js y html2canvas
// Instala desde CDN (ver index.html) o por npm:
//   npm install pdfjs-dist mammoth html2canvas

// Configura aquí el enlace del botón Redireccionar
const URL_REDIRECCION = 'https://www.google.com';

// Estado global
let slides = []; // Array de imágenes (dataURL)
let currentSlide = 0;

// Elementos DOM
const fileInput = document.getElementById('fileInput');
const slideViewer = document.getElementById('slideViewer');
const btnAnterior = document.getElementById('btnAnterior');
const btnSiguiente = document.getElementById('btnSiguiente');
const btnInicio = document.getElementById('btnInicio');
const btnIr = document.getElementById('btnIr');
const btnRedireccionar = document.getElementById('btnRedireccionar');

// Maneja la carga de archivos
fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    resetSlides();
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'pdf') {
        await handlePDF(file);
    } else if (ext === 'docx') {
        await handleDOCX(file);
    } else {
        alert('Solo se permiten archivos PDF o DOCX.');
    }
});

// Procesa un archivo PDF usando PDF.js
async function handlePDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    // PDF.js requiere un worker
    if (window['pdfjsLib']) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.js';
    }
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: context, viewport }).promise;
        slides.push(canvas.toDataURL('image/png'));
    }
    currentSlide = 0;
    renderSlide();
}

// Procesa un archivo DOCX usando Mammoth.js y html2canvas
async function handleDOCX(file) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    // Crea un contenedor temporal para el HTML
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = '600px'; // Ancho fijo para capturas
    tempDiv.innerHTML = result.value;
    document.body.appendChild(tempDiv);

    // Divide por "secciones" (puedes ajustar el selector según el formato del Word)
    // Aquí se usa cada <p> como slide, pero puedes usar <h1>, <h2>, etc.
    const sections = Array.from(tempDiv.querySelectorAll('h1, h2, h3, p'));
    if (sections.length === 0) sections.push(tempDiv); // Si no hay secciones, usa todo

    for (let i = 0; i < sections.length; i++) {
        // Oculta todas las secciones menos la actual
        sections.forEach((el, idx) => {
            el.style.display = (idx === i) ? '' : 'none';
        });
        // Espera a que el DOM se actualice
        await new Promise(r => setTimeout(r, 50));
        // Captura la sección como imagen
        const imgData = await html2canvas(tempDiv, { backgroundColor: '#fff' }).then(canvas => canvas.toDataURL('image/png'));
        slides.push(imgData);
    }
    document.body.removeChild(tempDiv);
    currentSlide = 0;
    renderSlide();
}

// Renderiza el slide actual
function renderSlide() {
    slideViewer.innerHTML = '';
    if (slides.length === 0) return;
    const img = document.createElement('img');
    img.src = slides[currentSlide];
    img.className = 'slide-image';
    slideViewer.appendChild(img);
    // Transición fade-in
    setTimeout(() => {
        img.classList.add('visible');
    }, 10);
}

// Navegación
btnAnterior.addEventListener('click', () => {
    if (currentSlide > 0) {
        currentSlide--;
        renderSlide();
    }
});
btnSiguiente.addEventListener('click', () => {
    if (currentSlide < slides.length - 1) {
        currentSlide++;
        renderSlide();
    }
});
btnInicio.addEventListener('click', () => {
    currentSlide = 0;
    renderSlide();
});
btnIr.addEventListener('click', () => {
    if (slides.length === 0) return;
    const num = prompt(`Ir a página (1-${slides.length}):`);
    const idx = parseInt(num, 10) - 1;
    if (!isNaN(idx) && idx >= 0 && idx < slides.length) {
        currentSlide = idx;
        renderSlide();
    }
});
btnRedireccionar.addEventListener('click', () => {
    window.open(URL_REDIRECCION, '_blank');
});

// Reinicia el estado
function resetSlides() {
    slides = [];
    currentSlide = 0;
    slideViewer.innerHTML = '';
} 