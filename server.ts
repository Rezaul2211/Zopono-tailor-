import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '1mb' }));

  // Initialize Gemini AI Client
  const getAiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment.');
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // API endpoint for AI Tailoring & Style Advice
  app.post('/api/tailor-advisor', async (req, res) => {
    try {
      const { message, history } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required' });
      }

      const ai = getAiClient();

      const systemInstruction = `You are the Zopono Master Tailor & AI Style Advisor.
You are an expert in bespoke custom tailoring, suit fitting, fabric selection (e.g. Italian Super 120s Wool, Egyptian Giza Cotton, Mulberry Silk, Linen, Premium Blends), exact body measurement guidelines, and occasion styling (Weddings, Galas, Executive Meetings, Festive Eid, Casual Chic).
Provide warm, professional, concise, and actionable advice.
Suggest matching colors, lapel styles (Notch, Peak, Shawl), cuff types, and fitting preferences (Slim Fit, Tailored Fit, Classic Fit) when relevant. Keep answers helpful and conversational.`;

      // Build conversation contents
      const formattedContents = [];
      if (Array.isArray(history) && history.length > 0) {
        for (const h of history.slice(-6)) {
          formattedContents.push({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.content }],
          });
        }
      }
      formattedContents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const reply = response.text || "I'm sorry, I couldn't generate a recommendation right now. Please ask again!";
      return res.json({ reply });
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      return res.status(500).json({
        error: 'Failed to consult AI Tailor Advisor',
        details: error?.message || String(error),
      });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Vite development middleware vs Static Production serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
