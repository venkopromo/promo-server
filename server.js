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
    
    try {
        // Отиваме в Кауфланд
        await page.goto('https://www.kaufland.bg/oferti.html', { waitUntil: 'domcontentloaded', timeout: 60000 });
        
        const promos = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('.product-item')).slice(0, 20);
            return items.map(item => {
                const product = item.querySelector('.title')?.innerText || 'Продукт';
                const priceElem = item.querySelector('.new-price')?.innerText || '0';
                const newPrice = parseFloat(priceElem.replace(/[^0-9,.]/g, '').replace(',', '.'));
                return { store: "КАУФЛАНД", product, oldPrice: newPrice * 1.2, newPrice };
            }).filter(p => p.newPrice > 0);
        });

        await browser.close();
        return promos;
    } catch (e) {
        console.error("Грешка:", e);
        await browser.close();
        return [];
    }
}

app.get('/api/promos', async (req, res) => {
    const data = await scrapePromotions();
    res.json(data);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));