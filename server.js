const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
app.use(cors());

app.get('/api/promos', async (req, res) => {
    try {
        // Отиваме директно в сайта на Лидл
        const response = await axios.get('https://www.lidl.bg/c/nashi-te-predlozheniya/c559', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        
        const $ = cheerio.load(response.data);
        const promos = [];

        // Роботът търси продуктите на Лидл
        $('.n-product-grid__item').slice(0, 15).each((i, el) => {
            const product = $(el).find('.n-product-grid-item__title').text().trim();
            const priceText = $(el).find('.n-product-grid-item__price').text().trim();
            
            // Превръщаме цената в число за евро
            const newPrice = parseFloat(priceText.replace(',', '.').replace(/[^0-9.]/g, ''));
            
            if (product && newPrice > 0) {
                promos.push({
                    store: "ЛИДЛ",
                    product: product,
                    oldPrice: (newPrice * 1.25).toFixed(2), // Изчисляваме стара цена ориентировъчно
                    newPrice: newPrice.toFixed(2)
                });
            }
        });

        console.log(`Намерени ${promos.length} оферти от Лидл!`);
        res.json(promos);
    } catch (error) {
        console.error("Грешка при Лидл:", error.message);
        res.status(500).json({ error: "Сървърът е зает, опитай пак след малко!" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Сървърът за Лидл работи!`));