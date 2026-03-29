const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/promos', (req, res) => {
    // ТЕСТОВИ ОФЕРТИ - ТРЯБВА ДА СЕ ПОЯВЯТ ВЕДНАГА
    const testPromos = [
        { store: "ЛИДЛ", product: "Прясно мляко 1.5%", oldPrice: "1.45", newPrice: "1.10" },
        { store: "ЛИДЛ", product: "Краве сирене 1кг", oldPrice: "12.50", newPrice: "8.99" },
        { store: "ЛИДЛ", product: "Банани 1кг", oldPrice: "1.60", newPrice: "1.20" },
        { store: "КАУФЛАНД", product: "Свински бут", oldPrice: "9.50", newPrice: "6.45" },
        { store: "КАУФЛАНД", product: "Кафе 500гр", oldPrice: "7.80", newPrice: "5.50" }
    ];

    console.log("Изпращам тестови оферти към сайта...");
    res.json(testPromos);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Тестовият сървър е готов!`));