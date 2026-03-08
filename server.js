require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3000;

// อนุญาตให้หน้าเว็บ Front-end เรียกใช้ API นี้ได้
app.use(cors());
// อนุญาตให้รับส่งข้อมูลรูปแบบ JSON
app.use(express.json());

// เรียกใช้ Gemini AI ด้วย Key จากไฟล์ .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// สร้าง Endpoint (ช่องทางรับข้อมูล) POST /api/ask-ai
app.post('/api/ask-ai', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: 'กรุณาส่ง Prompt มาด้วย' });
        }

        console.log("กำลังถาม Gemini...");
        
        // ใช้ Model gemini-1.5-flash ซึ่งทำงานเร็วและเหมาะกับข้อความ
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        console.log("Gemini ตอบกลับสำเร็จ!");
        
        // ส่งคำตอบกลับไปให้หน้าเว็บ
        res.json({ answer: responseText });

    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการเรียก Gemini:', error);
        res.status(500).json({ error: 'ไม่สามารถติดต่อ AI ได้ในขณะนี้' });
    }
});

// เปิดเซิร์ฟเวอร์
app.listen(port, () => {
    console.log(`🚀 Backend เปิดทำงานแล้วที่ http://localhost:${port}`);
});