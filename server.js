require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 🚀 ฟังก์ชันพิเศษ: ให้ระบบเช็คว่า API Key ของคุณใช้ AI รุ่นไหนได้บ้าง
async function listAvailableModels() {
    try {
        console.log("กำลังตรวจสอบรายชื่อ AI Models ที่คุณใช้งานได้...");
        // ยิง API ไปขอดูรายชื่อรุ่นทั้งหมด
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        
        console.log("=== รายชื่อ AI Models ที่ API Key ของคุณรองรับ ===");
        // กรองเอาเฉพาะชื่อรุ่นที่มีคำว่า gemini
        const models = data.models.map(m => m.name.replace('models/', '')).filter(name => name.includes('gemini'));
        console.log(models);
        console.log("==================================================");
    } catch (error) {
        console.error("ไม่สามารถดึงรายชื่อ Model ได้ โปรดตรวจสอบ API Key:", error);
    }
}
// เรียกใช้งานฟังก์ชันทันทีที่เปิดเซิร์ฟเวอร์
listAvailableModels();

app.post('/api/ask-ai', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: 'กรุณาส่ง Prompt มาด้วย' });
        }

        console.log("กำลังถาม Gemini...");
        
        // 🚀 ลองเปลี่ยนมาใช้รุ่นล่าสุดดูครับ (ถ้ายัง Error เราจะเอาชื่อจากใน Log ข้างบนมาใส่แทน)
        const model = genAI.getGenerativeModel({ model: "Gemini 3.1 Flash Lite" });
        
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        console.log("================ AI RESPONSE ================");
        console.log(responseText); 
        console.log("=============================================");

        console.log("Gemini ตอบกลับสำเร็จ!");
        res.json({ answer: responseText });

    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการเรียก Gemini:', error);
        res.status(500).json({ error: 'ไม่สามารถติดต่อ AI ได้ในขณะนี้' });
    }
});

app.listen(port, () => {
    console.log(`🚀 Backend เปิดทำงานแล้วที่ http://localhost:${port}`);
});
