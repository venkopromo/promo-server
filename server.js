const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
app.use(cors());

app.get('/api/promos', async (req, res) => {
    try {
        // Отиваме директно в седмичните предложения
        const response = await axios.get('https://www.lidl.bg/c/nashi-te-predlozheniya/c559', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        
        const $ = cheerio.load(response.data);
        const promos = [];

        // Този път търсим по-точно елементите
        $('.n-product-grid__item').each((i, el) => {
            const product = $(el).find('.n-product-grid-item__title').text().trim();
            const priceText = $(el).find('.n-product-grid-item__price').text().trim();
            
            // Чистим цената от символи
            const cleanPrice = priceText.replace(',', '.').replace(/[^0-9.]/g, '');
            const newPrice = parseFloat(cleanPrice);
            
            if (product && newPrice > 0) {
                promos.push({
                    store: "ЛИДЛ",
                    product: product,
                    oldPrice: (newPrice * 1.25).toFixed(2),
                    newPrice: newPrice.toFixed(2)
                });
            }
        });

        // Връщаме само първите 15 оферти, за да е бързо
        res.json(promos.slice(0, 15));
    } catch (error) {
        res.status(500).json({ error: "Грешка при четене на Лидл" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Сървърът работи!`));