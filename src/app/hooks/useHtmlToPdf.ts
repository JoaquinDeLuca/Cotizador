"use client";
import { useRef } from "react";

export function useHtmlToPdf() {
    const refHtml = useRef<HTMLDivElement>(null);


    // Para que cuando se use en SSR no de error
    if (typeof window === "undefined")
        return {
            refHtml: null,
            html: "",
            downloadPdf: async () => { },
            setHtml: () => { },
        };


    const downloadPdf = async (
        fileName = "documento.pdf",
    ) => {
        try {
            await new Promise((resolve) => setTimeout(resolve, 100));

            const element = refHtml.current;
            if (!element) {
                alert("Error: No se encontró el contenido");
                return;
            }

            // CSS con márgenes consistentes en todas las páginas
            const printCSS = `
        @media print {
          body * { visibility: hidden; }
          #pdf-content, #pdf-content * { visibility: visible; }
          #pdf-content { 
            position: absolute !important; 
            left: 0 !important; 
            top: 0 !important; 
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
          }
          
          @page { 
            margin: 15mm 12mm 15mm 12mm !important; /* márgenes iguales en todas las páginas */
            size: A4 !important;
          }
          
          /* Evitar cortes */
          .keep-together,
          div:has(h3),
          .mb-4 {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          /* Asegurar que el contenido no se salga del área imprimible */
          #pdf-content * {
            max-width: 100% !important;
            word-wrap: break-word !important;
            overflow: visible !important;
          }
          
          /* Espaciado consistente */
          h1, h2, h3, h4, h5, h6 {
            margin: 8px 0 4px 0 !important;
            page-break-after: avoid !important;
          }
          
          p {
            margin: 4px 0 8px 0 !important;
          }
          
          /* Para los divs con fondo gris */
          .bg-\\[\\#f9fafb\\] {
            padding: 8px !important;
            margin: 4px 0 !important;
          }
          
          /* Espaciado entre secciones */
          .mb-4 {
            margin-bottom: 12px !important;
          }
        }
      `;

            // Crear elemento temporal para print
            const printDiv = document.createElement("div");
            printDiv.id = "pdf-content";
            printDiv.innerHTML = element.innerHTML;
            document.body.appendChild(printDiv);

            const style = document.createElement("style");
            style.textContent = printCSS;
            document.head.appendChild(style);

            // Cambiar el título de la página temporalmente para el nombre del PDF
            document.title = fileName.replace(".pdf", "");

            // Usar print del navegador
            window.print();

            // Limpiar
            setTimeout(() => {
                document.body.removeChild(printDiv);
                document.head.removeChild(style);
            }, 1000);

            // return ("PFD Generado");
        } catch (error) {
            console.error("Error:", error);
            return "Error al generar el PDF";
        }
    };

    return { refHtml, downloadPdf };
}
