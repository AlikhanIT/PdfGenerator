import express, {Request, Response} from 'express';
import bodyParser from 'body-parser';
// @ts-ignore
import puppeteer from 'puppeteer';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 1984;
const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || '';

app.use(cors({origin: '*'}));

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {title: 'Linux PDF Generator', version: '1.0.0'},
    },
    apis: ['./src/**/*.ts'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({extended: true, limit: '50mb'}));

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
 *     tags:
 *       - Generation
 *     summary: Генерация PDF из HTML
 *     description: Этот метод позволяет сгенерировать PDF-документ на основе переданного HTML-кода.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               html:
 *                 type: string
 *                 description: HTML-код основного содержимого документа
 *               margin:
 *                 type: object
 *                 description: Отступы страницы в миллиметрах
 *                 properties:
 *                   top:
 *                     type: number
 *                     description: Отступ сверху
 *                   right:
 *                     type: number
 *                     description: Отступ справа
 *                   bottom:
 *                     type: number
 *                     description: Отступ снизу
 *                   left:
 *                     type: number
 *                     description: Отступ слева
 *     responses:
 *       200:
 *         description: PDF-документ в Base64
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pdfBase64:
 *                   type: string
 *                   description: Base64-кодированный PDF-документ
 */
app.post('/api/v1/generate-pdf', async (req: Request, res: Response) => {
    const {html, margin} = req.body;
    try {
        const pdfBase64 = await generatePdf(html, margin);
        res.json({pdfBase64});
    } catch (error) {
        res.status(500).json({error: 'Не удалось сгенерировать PDF'});
    }
});

/**
 * @swagger
 * /api/v1/generate-pdf-with-header-footer:
 *   post:
 *     tags:
 *       - Generation
 *     summary: Генерация PDF из HTML с хедером и футером
 *     description: Этот метод позволяет сгенерировать PDF-документ на основе HTML-кода. Хедеры и футеры должны быть переданы в виде HTML-кода.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               html:
 *                 type: string
 *                 description: HTML-код основного содержимого документа
 *               margin:
 *                 type: object
 *                 description: Отступы страницы в миллиметрах
 *                 properties:
 *                   top:
 *                     type: number
 *                     description: Отступ сверху
 *                   right:
 *                     type: number
 *                     description: Отступ справа
 *                   bottom:
 *                     type: number
 *                     description: Отступ снизу
 *                   left:
 *                     type: number
 *                     description: Отступ слева
 *               headerTemplate:
 *                 type: string
 *                 description: HTML-код для хедера (верхнего колонтитула)
 *               footerTemplate:
 *                 type: string
 *                 description: HTML-код для футера (нижнего колонтитула)
 *             required:
 *               - html
 *               - margin
 *     responses:
 *       200:
 *         description: PDF-документ в Base64
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pdfBase64:
 *                   type: string
 *                   description: Base64-кодированный PDF-документ
 */
app.post('/api/v1/generate-pdf-with-header-footer', async (req: Request, res: Response) => {
    const {html, margin, headerTemplate, footerTemplate} = req.body;
    try {
        const pdfBase64 = await generatePdf(html, margin, headerTemplate, footerTemplate);
        res.json({pdfBase64});
    } catch (error) {
        res.status(500).json({error: 'Не удалось сгенерировать PDF'});
    }
});

app.listen(port, () => {
    console.log(`Сервер запущен по адресу http://localhost:${port}/swagger`);
});

