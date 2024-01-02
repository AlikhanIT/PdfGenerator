import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import puppeteer from 'puppeteer';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const app = express();
const port = 987;

// Swagger options
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'My API',
            version: '1.0.0',
        },
    },
    apis: ['./src/**/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Serve Swagger UI at /swagger/index.html
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware to parse JSON and form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Endpoint for generating PDF from HTML
/**
 * @swagger
 * /api/v1/generate-pdf:
 *   post:
 *     summary: Generate PDF from HTML
 *     description: Generates a PDF file from HTML content with customizable margin.
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

    // Helper function to add units to numerical values
    const addUnits = (value: number | string, defaultUnit: string): string => {
        if (typeof value === 'number') {
            return `${value}${defaultUnit}`;
        }
        return value;
    };

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox'],
        pipe: true
    });

    const page = await browser.newPage();

    // Set content and generate PDF
    await page.setContent(html);

    // Set margin options
    const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
            top: addUnits(margin?.top, 'mm'),
            right: addUnits(margin?.right, 'mm'),
            bottom: addUnits(margin?.bottom, 'mm'),
            left: addUnits(margin?.left, 'mm'),
        },
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: '<div></div>',
        footerTemplate: '<div></div>',
    });

    await browser.close();

    const pdfBase64 = pdfBuffer.toString('base64');
    res.json({ pdfBase64 });
});

// Endpoint for generating PDF from HTML with header and footer
/**
 * @swagger
 * /api/v1/generate-pdf-with-header-footer:
 *   post:
 *     summary: Generate PDF from HTML with header and footer
 *     description: Generates a PDF file from HTML content with customizable header and footer.
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

    // Helper function to add units to numerical values
    const addUnits = (value: number | string, defaultUnit: string): string => {
        if (typeof value === 'number') {
            return `${value}${defaultUnit}`;
        }
        return value;
    };

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set content and generate PDF with header and footer
    await page.setContent(html);

    // Set margin options, header, and footer templates
    const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
            top: addUnits(margin?.top, 'mm'),
            right: addUnits(margin?.right, 'mm'),
            bottom: addUnits(margin?.bottom, 'mm'),
            left: addUnits(margin?.left, 'mm'),
        },
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate,
        footerTemplate,
    });

    await browser.close();

    const pdfBase64 = pdfBuffer.toString('base64');
    res.json({ pdfBase64 });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
