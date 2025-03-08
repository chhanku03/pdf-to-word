const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const cors = require('cors');
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = 'secret_key_16c614cfddbad197818e72268edb1663_7Pk-Wcdbfde7f3794fd759dac0b98d3f7da37'; // Replace with your ILovePDF API key
const upload = multer({ storage: multer.memoryStorage() });

// Proxy endpoint for PDF to Word conversion
app.post('/convert', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Step 1: Start a task
        const startResponse = await axios.post('https://api.ilovepdf.com/v1/start/pdf/to/word', {}, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });

        const { server, task } = startResponse.data;

        // Step 2: Upload the file
        const formData = new FormData();
        formData.append('file', file.buffer, { filename: file.originalname });

        await axios.post(`https://${server}/v1/upload`, formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${API_KEY}`
            }
        });

        // Step 3: Process the task
        await axios.post(`https://${server}/v1/process`, {}, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });

        // Step 4: Get the download URL
        const resultResponse = await axios.get(`https://${server}/v1/download`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });

        const { url } = resultResponse.data;
        res.json({ url });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Conversion failed' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});