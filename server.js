const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

app.get('/api/promos', async (req, res) => {
    try {
        // Пробен списък с оферти, за да сме сигурни, че СЪРВЪРЪТ РАБОТИ
        const testData = [
            { store: "КАУФЛАНД", product: "Банани 1кг", oldPrice: 1.80, newPrice: 1.25 },
            { store: "КАУФЛАНД", product: "Прясно мляко", oldPrice: 1.50, newPrice: 1.10 },
            { store: "КАУФЛАНД", product: "Кафе 500гр", oldPrice: 8.50, newPrice: 5.99 },
            { store: "МЕТРО", product: "Сирене 1кг", oldPrice: 12.00, newPrice: 9.50 },
            { store: "МЕТРО", product: "Олио 1л", oldPrice: 2.20, newPrice: 1.85 }
        ];
        
        console.log("Изпращам оферти...");
        res.json(testData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Сървърът е готов на порт ${PORT}`));