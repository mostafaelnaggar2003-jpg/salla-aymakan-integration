const express = require('express');
const axios = require('axios');
const PDFDocument = require('pdfkit'); // إضافة مكتبة الـ PDF
const app = express();
app.use(express.json());

app.post('/webhook', async (req, res) => {
    const orderData = req.body;
    const apiKey = process.env.AYMAKAN_API_KEY;
    const isTestMode = process.env.TEST_MODE === 'true';

    try {
        console.log("Order Received from Salla:", orderData.data.id);

        if (isTestMode) {
            console.log("--- [TEST MODE ACTIVE] ---");
            
            // إنشاء الـ PDF في وضع الاختبار
            const doc = new PDFDocument();
            let buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                let pdfData = Buffer.concat(buffers);
                res.writeHead(200, {
                    'Content-Length': Buffer.byteLength(pdfData),
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': 'attachment;filename=shipment.pdf',
                }).end(pdfData);
            });

            doc.fontSize(20).text('Shipment Label (Test)');
            doc.fontSize(12).text('Order ID: ' + orderData.data.id);
            doc.text('Customer: ' + orderData.data.customer.name);
            doc.end();

        } else {
            // وضع الإنتاج (إرسال حقيقي لشركة الشحن)
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
        console.error("Error:", error.response ? error.response.data : error.message);
        res.status(500).send({ error: "Failed to create shipment" });
    }
});

module.exports = app;
