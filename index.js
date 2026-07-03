const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

app.post('/webhook', async (req, res) => {
    const orderData = req.body;
    // هنا بنجيب الـ API Key اللي خزنّاه في Vercel
    const apiKey = process.env.AYMAKAN_API_KEY;

    try {
        console.log("Order Received from Salla:", JSON.stringify(orderData, null, 2));
        
        // إرسال طلب الشحن لشركة أي مكان
        const response = await axios.post('https://api.aymakan.com.sa/v1/shipments', {
            "reference_id": orderData.data.id,
            "customer_name": orderData.data.customer.name,
            "phone": orderData.data.customer.mobile,
            "city": orderData.data.shipping_address.city,
            "address": orderData.data.shipping_address.address
            // يمكن إضافة المزيد من الحقول حسب متطلبات "أي مكان"
        }, {
            headers: { 
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json' 
            }
        });

        console.log("Aymakan Response:", response.data);
        res.status(200).send({ message: "Shipment created successfully", details: response.data });
        
    } catch (error) {
        console.error("Error sending to Aymakan:", error.response ? error.response.data : error.message);
        res.status(500).send({ error: "Failed to create shipment" });
    }
});

// هذا التصدير ضروري لعمل Vercel
module.exports = app;
