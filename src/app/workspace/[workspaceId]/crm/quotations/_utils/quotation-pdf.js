import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Robust, client-side PDF generator for CRM quotations.
 * Handles modern CSS Color 4 functions (lab, oklch, oklab) safely so html2canvas doesn't throw.
 * Returns the jsPDF instance and base64 string.
 */
export async function generateQuotationPdf(element) {
    if (!element) {
        throw new Error("Target quotation DOM element not found for PDF generation.");
    }

    const cCanvas = document.createElement('canvas');
    cCanvas.width = 1;
    cCanvas.height = 1;
    const ctx = cCanvas.getContext('2d');

    const sanitizeColorString = (str) => {
        if (!str || typeof str !== 'string') return str;
        if (!str.includes('lab(') && !str.includes('oklch(') && !str.includes('oklab(') && !str.includes('color(')) {
            return str;
        }
        return str.replace(/(lab|oklch|oklab|color)\(([^()]|\([^()]*\))*\)/gi, (match) => {
            try {
                if (ctx) {
                    ctx.fillStyle = '#010203';
                    ctx.fillStyle = match;
                    if (ctx.fillStyle !== '#010203' && ctx.fillStyle !== 'rgb(1, 2, 3)') {
                        return ctx.fillStyle;
                    }
                }
            } catch (e) { }
            if (match.includes('bg') || match.includes('background')) return '#ffffff';
            return '#0f172a';
        });
    };

    const createSanitizedStyleProxy = (style) => {
        return new Proxy(style, {
            get(target, prop) {
                if (prop === 'getPropertyValue') {
                    return function (propertyName) {
                        const raw = target.getPropertyValue(propertyName);
                        return sanitizeColorString(raw);
                    };
                }
                let val;
                try {
                    val = target[prop];
                } catch {
                    val = undefined;
                }
                if (typeof val === 'function') {
                    return val.bind(target);
                }
                if (typeof val === 'string') {
                    return sanitizeColorString(val);
                }
                return val;
            }
        });
    };

    const origWindowGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = function (el, pseudo) {
        const style = origWindowGetComputedStyle.call(window, el, pseudo);
        return createSanitizedStyleProxy(style);
    };

    try {
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: 1200,
            onclone: (clonedDoc) => {
                const clonedWin = clonedDoc.defaultView;
                if (clonedWin && clonedWin !== window) {
                    const origClonedGetComputedStyle = clonedWin.getComputedStyle;
                    clonedWin.getComputedStyle = function (el, pseudo) {
                        const style = origClonedGetComputedStyle.call(clonedWin, el, pseudo);
                        return createSanitizedStyleProxy(style);
                    };
                }

                const allEls = clonedDoc.querySelectorAll('*');
                allEls.forEach((el) => {
                    try {
                        if (el.style && el.style.cssText) {
                            el.style.cssText = sanitizeColorString(el.style.cssText);
                        }
                    } catch (e) { }
                });
            }
        });

        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;

        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const pageHeightPx = pdfHeight / ratio;
        const totalPages = Math.ceil(imgHeight / pageHeightPx);

        for (let page = 0; page < totalPages; page++) {
            if (page > 0) pdf.addPage();

            const sourceY = page * pageHeightPx;
            const sourceHeight = Math.min(pageHeightPx, imgHeight - sourceY);

            const pageCanvas = document.createElement('canvas');
            pageCanvas.width = imgWidth;
            pageCanvas.height = sourceHeight;
            const ctxPage = pageCanvas.getContext('2d');

            if (ctxPage) {
                ctxPage.drawImage(
                    canvas,
                    0, sourceY,
                    imgWidth, sourceHeight,
                    0, 0,
                    imgWidth, sourceHeight
                );

                const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
                const pageScaledHeight = sourceHeight * ratio;
                pdf.addImage(pageImgData, 'JPEG', 0, 0, pdfWidth, pageScaledHeight);
            }
        }

        const dataUri = pdf.output('datauristring');
        const base64 = dataUri.split(',')[1];

        return {
            pdf,
            base64,
            dataUri
        };
    } finally {
        window.getComputedStyle = origWindowGetComputedStyle;
    }
}
