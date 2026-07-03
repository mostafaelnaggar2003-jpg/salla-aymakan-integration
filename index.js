const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

app.post('/webhook', async (req, res) => {
    const orderData = req.body;
    console.log("Order Received:", orderData);
    
    // سأقوم بتطوير هذا الجزء لاحقاً لإرسال الطلب لـ أي مكان
    res.status(200).send({ message: "Webhook received successfully" });
});

app.listen(3000, () => console.log('Server is running...'));
