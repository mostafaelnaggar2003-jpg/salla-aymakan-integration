const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

app.post('/webhook', async (req, res) => {
    const orderData = req.body;
    const apiKey = process.env.AYMAKAN_API_KEY;
    
    // وضعية الأمان: إذا كانت TEST_MODE تساوي 'true' في Vercel، لن يتم إرسال طلب حقيقي
    const isTestMode = process.env.TEST_MODE === 'true';

    try {
        console.log("Order Received from Salla:", JSON.stringify(orderData, null, 2));
        
        if (isTestMode) {
            // وضع الاختبار
            console.log("--- [TEST MODE ACTIVE] ---");
            console.log("Simulating shipment creation for Order ID:", orderData.data.id);
            res.status(200).send({ message: "Test successful: Data logged, no shipment created." });
        } else {
            // وضع الإنتاج (إرسال حقيقي)
            const response = await axios.post('https://api.aymakan.com.sa/v1/shipments', {
                "reference_id": orderData.data.id,
                "customer_name": orderData.data.customer.name,
                "phone": orderData.data.customer.mobile,
                "city": orderData.data.shipping_address.city,
                "address": orderData.data.shipping_address.address
            }, {
                headers: { 
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json' 
                }
            });

            console.log("Aymakan Response:", response.data);
            res.status(200).send({ message: "Shipment created successfully", details: response.data });
        }
        
    } catch (error) {
        console.error("Error sending to Aymakan:", error.response ? error.response.data : error.message);
        res.status(500).send({ error: "Failed to create shipment" });
    }
});

module.exports = app;
