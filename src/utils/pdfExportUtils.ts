import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Build } from '../services/builds';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable;
  }
}

interface ComponenteParaPDF {
  Id?: number;
  ComponenteId?: number;
  Nombre?: string;
  Tipo?: string;
  TipoId?: number;
  Marca?: string;
  Modelo?: string;
  Precio?: number;
  ConsumoEnergetico?: number;
  Especificaciones?: string;
  Cantidad?: number;
  _ComponenteId?: {
    Nombre?: string;
    Marca?: string;
    Modelo?: string;
    Precio?: number;
    ConsumoEnergetico?: number;
    Especificaciones?: string;
    TipoId?: number;
  };
}

/**
 * Convierte imagen local a Base64
 */
const getImageBase64 = async (imagePath: string): Promise<string | null> => {
  try {
    const response = await fetch(imagePath);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error cargando imagen:', error);
    return null;
  }
};

/**
 * Exporta una build a PDF con formato profesional
 */
export const exportarBuildAPDF = async (
  build: Build,
  componentesEnBuild?: ComponenteParaPDF[]
): Promise<void> => {
  try {
    console.log('🔍 Datos recibidos:', { build, componentesEnBuild });

    // Crear documento PDF en formato A4
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // ==================== HEADER ====================
    // Fondo del header
    doc.setFillColor(30, 30, 40);
    doc.rect(0, 0, pageWidth, 50, 'F');

    // Intentar cargar logo
    try {
      const logoBase64 = await getImageBase64('/logo.png');
      if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', 15, 15, 20, 20);
      } else {
        // Fallback: círculo verde si no se carga el logo
        doc.setFillColor(0, 255, 157);
        doc.circle(20, 25, 8, 'F');
      }
    } catch {
      // Fallback: círculo verde
      doc.setFillColor(0, 255, 157);
      doc.circle(20, 25, 8, 'F');
    }

    // Título principal
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('PC BUILD REPORT', 40, 25);

    // Subtítulo
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(180, 180, 180);
    doc.text('Configuración de PC Personalizada', 40, 32);

    // Fecha de generación
    const fechaActual = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    doc.text(`Generado: ${fechaActual}`, pageWidth - 15, 45, { align: 'right' });

    yPosition = 60;

    // ==================== INFORMACIÓN DE LA BUILD ====================
    doc.setFillColor(240, 240, 245);
    doc.rect(15, yPosition, pageWidth - 30, 35, 'F');

    // Nombre de la build
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(build.Nombre || 'Sin nombre', 20, yPosition + 10);

    // Información adicional
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);

    const infoTexts = [
      `Versión: ${build.Version || '1.0'}`,
      `Estado: ${build.Estado || 'Activa'}`,
      `ID: #${build.Id}`,
    ];

    let xPos = 20;
    infoTexts.forEach((text) => {
      doc.text(text, xPos, yPosition + 20);
      xPos += 50;
    });

    // Fecha de creación
    if (build.Fecha) {
      const fechaBuild = new Date(build.Fecha).toLocaleDateString('es-ES');
      doc.text(`Creada: ${fechaBuild}`, 20, yPosition + 28);
    }

    yPosition += 45;

    // ==================== COMPONENTES ====================
    console.log('📦 Procesando componentes:', componentesEnBuild);

    if (componentesEnBuild && componentesEnBuild.length > 0) {
      // Preparar datos procesando la estructura de respuesta del backend
      const componentesProcesados = componentesEnBuild.map((item) => {
        // El backend puede devolver los datos en _ComponenteId
        const comp = item._ComponenteId || item;
        
        return {
          Nombre: comp.Nombre || item.Nombre || 'Sin nombre',
          Marca: comp.Marca || item.Marca || 'N/A',
          Modelo: comp.Modelo || item.Modelo || 'N/A',
          Precio: comp.Precio || item.Precio || 0,
          ConsumoEnergetico: comp.ConsumoEnergetico || item.ConsumoEnergetico || 0,
          Especificaciones: comp.Especificaciones || item.Especificaciones || '',
          Cantidad: item.Cantidad || 1,
        };
      });

      console.log('✅ Componentes procesados:', componentesProcesados);

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('COMPONENTES DE LA BUILD', 15, yPosition);

      yPosition += 5;

      // Preparar datos para la tabla
      const tableData = componentesProcesados.map((comp) => [
        comp.Marca,
        comp.Nombre,
        comp.Modelo,
        `${comp.ConsumoEnergetico}W`,
        `$${comp.Precio.toLocaleString()}`,
      ]);

      // Calcular totales
      const precioTotal = componentesProcesados.reduce((sum, comp) => sum + (comp.Precio * comp.Cantidad), 0);
      const consumoTotal = componentesProcesados.reduce((sum, comp) => sum + (comp.ConsumoEnergetico * comp.Cantidad), 0);

      autoTable(doc, {
        startY: yPosition,
        head: [['Marca', 'Componente', 'Modelo', 'Consumo', 'Precio']],
        body: tableData,
        foot: [
          [
            { content: 'TOTALES', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } },
            `${consumoTotal}W`,
            `$${precioTotal.toLocaleString()}`
          ]
        ],
        theme: 'striped',
        headStyles: {
          fillColor: [30, 30, 40],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'center',
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [50, 50, 50],
        },
        footStyles: {
          fillColor: [0, 255, 157],
          textColor: [0, 0, 0],
          fontSize: 11,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 250],
        },
        margin: { left: 15, right: 15 },
        columnStyles: {
          0: { cellWidth: 35 }, // Marca
          1: { cellWidth: 50 }, // Componente
          2: { cellWidth: 45 }, // Modelo
          3: { cellWidth: 25, halign: 'center' }, // Consumo
          4: { cellWidth: 25, halign: 'right' }, // Precio
        },
      });

      // Actualizar posición Y después de la tabla
      yPosition = (doc as any).lastAutoTable.finalY + 15;

      // ==================== RESUMEN DE POTENCIA ====================
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 20;
      }

      // Cuadro de resumen
      doc.setFillColor(255, 248, 220);
      doc.rect(15, yPosition, pageWidth - 30, 30, 'F');
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Resumen de Consumo Energético', 20, yPosition + 10);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Consumo Total: ${consumoTotal}W`, 20, yPosition + 18);
      doc.text(`PSU Recomendada: ${Math.ceil(consumoTotal * 1.3)}W o superior`, 20, yPosition + 25);

      yPosition += 40;

      // ==================== ESPECIFICACIONES DETALLADAS ====================
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Especificaciones Detalladas', 15, yPosition);
      yPosition += 8;

      componentesProcesados.forEach((comp, index) => {
        // Verificar si necesitamos una nueva página
        if (yPosition > pageHeight - 50) {
          doc.addPage();
          yPosition = 20;
        }

        // Fondo alternado
        if (index % 2 === 0) {
          doc.setFillColor(250, 250, 252);
          doc.rect(15, yPosition - 5, pageWidth - 30, 30, 'F');
        }

        // Nombre del componente
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 40);
        doc.text(`${comp.Marca} ${comp.Nombre}`, 20, yPosition);

        yPosition += 6;

        // Especificaciones
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);

        if (comp.Especificaciones && comp.Especificaciones.trim()) {
          const specs = doc.splitTextToSize(comp.Especificaciones, pageWidth - 50);
          doc.text(specs, 20, yPosition);
          yPosition += specs.length * 4 + 2;
        } else {
          doc.text('Sin especificaciones disponibles', 20, yPosition);
          yPosition += 6;
        }

        // Info adicional
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text(`Precio: $${comp.Precio.toLocaleString()} | Consumo: ${comp.ConsumoEnergetico}W`, 20, yPosition);

        yPosition += 12;
      });
    } else {
      // Sin componentes
      doc.setFontSize(12);
      doc.setTextColor(150, 150, 150);
      doc.text('Esta build no tiene componentes asociados', 15, yPosition);
      console.warn('No hay componentes para mostrar');
      yPosition += 10;
    }

    // ==================== FOOTER ====================
    const addFooter = (pageNum: number) => {
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.setFont('helvetica', 'italic');
      doc.text(
        'Documento generado automáticamente por PC Builder',
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      doc.text(`Página ${pageNum}`, pageWidth - 15, pageHeight - 10, { align: 'right' });
    };

    // Agregar footer a todas las páginas
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      addFooter(i);
    }

    // ==================== GUARDAR PDF ====================
    const nombreArchivo = `${build.Nombre?.replace(/[^a-z0-9]/gi, '_') || 'build'}_${Date.now()}.pdf`;
    doc.save(nombreArchivo);

    console.log('✅ PDF generado exitosamente:', nombreArchivo);
  } catch (error) {
    console.error('❌ Error al generar PDF:', error);
    throw new Error('No se pudo generar el PDF');
  }
};

/**
 * Exporta múltiples builds en un solo PDF
 */
export const exportarVariasBuildsAPDF = async (builds: Build[]): Promise<void> => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Header
    doc.setFillColor(30, 30, 40);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('MIS BUILDS - RESUMEN', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Total: ${builds.length} configuraciones`, pageWidth / 2, 30, { align: 'center' });

    yPosition = 50;

    // Tabla resumen
    const tableData = builds.map((build) => [
      build.Nombre || 'Sin nombre',
      build.Version || '1.0',
      build.Estado || 'Activa',
      build.Fecha ? new Date(build.Fecha).toLocaleDateString('es-ES') : 'N/A',
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Nombre', 'Versión', 'Estado', 'Fecha']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 30, 40],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      margin: { left: 15, right: 15 },
    });

    doc.save(`mis_builds_${Date.now()}.pdf`);
  } catch (error) {
    console.error('Error al exportar múltiples builds:', error);
    throw error;
  }
};