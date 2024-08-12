import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
// @ts-ignore
import puppeteer from 'puppeteer';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 1984;
const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || '';

app.use(cors({ origin: '*' }));

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: { title: 'PDF Generator', version: '1.0.0' },
    },
    apis: ['./src/**/*.ts'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

const launchBrowser = async () => {
    return puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: executablePath,
    });
};

const generatePdf = async (html: string, margin: any, headerTemplate?: string, footerTemplate?: string) => {
    const browser = await launchBrowser();
    const page = await browser.newPage();
    await page.setContent(html);

    const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
            top: margin?.top ? `${margin.top}mm` : '0mm',
            right: margin?.right ? `${margin.right}mm` : '0mm',
            bottom: margin?.bottom ? `${margin.bottom}mm` : '0mm',
            left: margin?.left ? `${margin.left}mm` : '0mm',
        },
        printBackground: true,
        displayHeaderFooter: !!headerTemplate || !!footerTemplate,
        headerTemplate: headerTemplate || '',
        footerTemplate: footerTemplate || '',
    });

    await browser.close();
    return pdfBuffer.toString('base64');
};

/**
 * @swagger
 * /api/v1/generate-pdf:
 *   post:
 *     summary: Generate PDF from HTML
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               html:
 *                 type: string
 *               margin:
 *                 type: object
 *                 properties:
 *                   top:
 *                     type: number
 *                   right:
 *                     type: number
 *                   bottom:
 *                     type: number
 *                   left:
 *                     type: number
 *     responses:
 *       200:
 *         description: Base64-encoded PDF
 */
app.post('/api/v1/generate-pdf', async (req: Request, res: Response) => {
    const { html, margin } = req.body;
    try {
        const pdfBase64 = await generatePdf(html, margin);
        res.json({ pdfBase64 });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
});

/**
 * @swagger
 * /api/v1/generate-pdf-with-header-footer:
 *   post:
 *     summary: Generate PDF from HTML with header and footer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               html:
 *                 type: string
 *               margin:
 *                 type: object
 *               headerTemplate:
 *                 type: string
 *               footerTemplate:
 *                 type: string
 *     responses:
 *       200:
 *         description: Base64-encoded PDF
 */
app.post('/api/v1/generate-pdf-with-header-footer', async (req: Request, res: Response) => {
    const { html, margin, headerTemplate, footerTemplate } = req.body;
    try {
        const pdfBase64 = await generatePdf(html, margin, headerTemplate, footerTemplate);
        res.json({ pdfBase64 });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
