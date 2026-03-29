const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();
app.use(cors());

async function scrapePromotions() {
    const browser = await puppeteer.launch({ 
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    let promos = [];

    try {
        await page.goto('https://www.kaufland.bg/oferti.html', { waitUntil: 'networkidle2' });
        
        promos = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('.product-item')).slice(0, 50); 
            return items.map(item => {
                const product = item.querySelector('.title')?.innerText || 'Продукт';
                const oldPrice = parseFloat((item.querySelector('.old-price')?.innerText || '0').replace(/[^0-9,.]/g, '').replace(',', '.'));
                const newPrice = parseFloat((item.querySelector('.new-price')?.innerText || '0').replace(/[^0-9,.]/g, '').replace(',', '.'));
                
                return { store: "КАУФЛАНД", product, oldPrice, newPrice, valid: "Тази седмица" };
            }).filter(p => p.newPrice > 0);
        });
    } catch (e) {
        console.error("Грешка при сканиране:", e);
    } finally {
        await browser.close();
    }
    return promos;
}

app.get('/api/promos', async (req, res) => {
    const data = await scrapePromotions();
    res.json(data);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сървърът работи на порт ${PORT}`));