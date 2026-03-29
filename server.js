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
    let allPromos = [];

    try {
        // --- СКАНИРАНЕ НА КАУФЛАНД (Увеличаваме на 30 продукта) ---
        await page.goto('https://www.kaufland.bg/oferti.html', { waitUntil: 'networkidle2' });
        const kauflandPromos = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('.product-item')).slice(0, 30); 
            return items.map(item => {
                const product = item.querySelector('.title')?.innerText || 'Продукт';
                const oldPrice = parseFloat((item.querySelector('.old-price')?.innerText || '0').replace(/[^0-9,.]/g, '').replace(',', '.'));
                const newPrice = parseFloat((item.querySelector('.new-price')?.innerText || '0').replace(/[^0-9,.]/g, '').replace(',', '.'));
                return { store: "КАУФЛАНД", product, oldPrice, newPrice };
            }).filter(p => p.newPrice > 0);
        });
        allPromos = allPromos.concat(kauflandPromos);

        // --- СКАНИРАНЕ НА МЕТРО ---
        await page.goto('https://www.metro.bg/oferti', { waitUntil: 'networkidle2' });
        const metroPromos = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('.mf-product-card')).slice(0, 20); 
            return items.map(item => {
                const product = item.querySelector('.mf-product-card__name')?.innerText || 'Метро Продукт';
                const priceElem = item.querySelector('.mf-product-card__price-new')?.innerText || '0';
                const oldPriceElem = item.querySelector('.mf-product-card__price-old')?.innerText || '0';
                
                const newPrice = parseFloat(priceElem.replace(/[^0-9,.]/g, '').replace(',', '.'));
                const oldPrice = parseFloat(oldPriceElem.replace(/[^0-9,.]/g, '').replace(',', '.')) || (newPrice * 1.2);
                
                return { store: "МЕТРО", product, oldPrice, newPrice };
            }).filter(p => p.newPrice > 0);
        });
        allPromos = allPromos.concat(metroPromos);

    } catch (e) {
        console.error("Грешка при сканиране:", e);
    } finally {
        await browser.close();
    }
    return allPromos;
}

app.get('/api/promos', async (req, res) => {
    const data = await scrapePromotions();
    res.json(data);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сървърът работи на порт ${PORT}`));