import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔑 CONFIGURAÇÃO DA LICENÇA DO CLIENTE
// Altera estas variáveis consoante o cliente ou subscrição
const CLIENT_LICENSE = {
  clientName: 'Restaurante / Supermercado Exemplo',
  licenseKey: 'SF-2026-SAAS-8921',
  startDate: '2026-08-01',
  endDate: '2026-08-31', // 🚨 No dia 2026-09-01 o servidor bloqueia o acesso
  planType: 'Restauração & Supermercado'
};

// ⚙️ FUNÇÃO DE VERIFICAÇÃO DE LICENÇA
function getLicenseState() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endDate = new Date(CLIENT_LICENSE.endDate);
  endDate.setHours(23, 59, 59, 999);

  const diffTime = endDate.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isValid = daysRemaining > 0;

  let status: 'active' | 'expiring_soon' | 'expired' = 'active';
  if (!isValid) {
    status = 'expired';
  } else if (daysRemaining <= 7) {
    status = 'expiring_soon';
  }

  return {
    ...CLIENT_LICENSE,
    isValid,
    daysRemaining: Math.max(0, daysRemaining),
    status
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Shared Gemini client instance
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not set. AI features will fallback gracefully.');
      return null;
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  };

  // -------------------------------------------------------------
  // 🔓 ENDPOINTS PÚBLICOS (Acessíveis mesmo com licença expirada)
  // -------------------------------------------------------------

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Endpoint de Consulta do Estado da Licença (Para o Frontend e Ícones)
  app.get('/api/license-status', (req, res) => {
    const licenseState = getLicenseState();
    res.json(licenseState);
  });

  // -------------------------------------------------------------
  // 🛡️ MIDDLEWARE DE BLOQUEIO DE LICENÇA (Protege as rotas da API)
  // -------------------------------------------------------------
  app.use('/api', (req, res, next) => {
    const { isValid, endDate, clientName, licenseKey } = getLicenseState();
    
    if (!isValid) {
      return res.status(403).json({
        error: 'Licença Expirada',
        message: `A subscrição do SustentaFood para "${clientName}" expirou a ${endDate}.`,
        clientName,
        licenseKey,
        endDate
      });
    }
    next();
  });

  // -------------------------------------------------------------
  // 🔒 ENDPOINTS PROTEGIDOS (Apenas funcionam com licença ativa)
  // -------------------------------------------------------------

  // AI Forecast & Analysis Endpoint
  app.post('/api/ai/forecast', async (req, res) => {
    try {
      const ai = getGeminiClient();
      if (!ai) {
        return res.status(503).json({
          error: 'Chave de API Gemini não configurada.',
          fallbackNotice: 'Defina a variável GEMINI_API_KEY no painel Secrets.'
        });
      }

      const { wasteLogs, stockItems, expectedDiners = 250, upcomingEmenta = 'Bacalhau com Natas e Sopa de Legumes' } = req.body;

      const prompt = `
És o especialista sénior em Prevenção de Desperdício Alimentar e Segurança Alimentar (HACCP) do sistema SustentaFood.
Analisa os dados de resíduos e stocks fornecidos:

- N.º de refeições previstas para amanhã: ${expectedDiners}
- Ementa planeada: "${upcomingEmenta}"
- Registos de resíduos recentes: ${JSON.stringify((wasteLogs || []).slice(0, 8))}
- Items de stock críticos (FEFO): ${JSON.stringify((stockItems || []).slice(0, 6))}

Gera um relatório de inteligência preditiva em Português com:
1. Alertas de Risco Preditivo (ex: excedente de sopa, pescado próximo de vencer)
2. Recomendações de Compra Inteligente
3. Dicas de Otimização de Confeção e Redução de Perdas
4. Uma frase destacada de previsão exata para o dashboard (Exemplo: "Para amanhã prevê-se um excedente de 25 kg de sopa devido à baixa procura das últimas 4 semanas.")
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          systemInstruction: 'Responde exclusivamente em JSON estruturado com o esquema solicitado.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              highlightPrediction: {
                type: Type.STRING,
                description: 'Previsão curta e direta para o banner do dashboard'
              },
              wasteRiskScore: {
                type: Type.NUMBER,
                description: 'Nível de risco de desperdício em % (0 a 100)'
              },
              forecastInsights: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    category: { type: Type.STRING },
                    riskLevel: { type: Type.STRING, description: 'Elevado | Médio | Baixo' },
                    predictedExcessKg: { type: Type.NUMBER },
                    recommendation: { type: Type.STRING }
                  },
                  required: ['title', 'category', 'riskLevel', 'predictedExcessKg', 'recommendation']
                }
              },
              procurementAdvice: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    item: { type: Type.STRING },
                    action: { type: Type.STRING, description: 'Reduzir Encomenda | Aumentar | Manter | Doar Excedente' },
                    suggestedQtyKg: { type: Type.NUMBER },
                    reasoning: { type: Type.STRING }
                  },
                  required: ['item', 'action', 'suggestedQtyKg', 'reasoning']
                }
              },
              haccpTip: {
                type: Type.STRING,
                description: 'Dica crítica de segurança alimentar e conservação para a ementa do dia'
              }
            },
            required: ['highlightPrediction', 'wasteRiskScore', 'forecastInsights', 'procurementAdvice', 'haccpTip']
          }
        }
      });

      const parsedText = response.text || '{}';
      const resultData = JSON.parse(parsedText);
      res.json(resultData);
    } catch (err: any) {
      console.error('Erro na API AI Forecast:', err);
      res.status(500).json({ error: 'Erro ao gerar análise preditiva com Gemini IA.', details: err.message });
    }
  });

  // AI Chat & Assistant Endpoint
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const ai = getGeminiClient();
      if (!ai) {
        return res.status(503).json({
          error: 'Chave de API Gemini não disponível.'
        });
      }

      const { message, history = [] } = req.body;

      const chat = ai.chats.create({
        model: 'gemini-3.6-flash',
        config: {
          systemInstruction: `
És o Consultor Virtual SustentaFood, perito em Gestão de Desperdício Alimentar, Nutrição Sustentável, Legislação HACCP e Economia Circular em Restauração e Supermercados.
Responde sempre em Português de Portugal com tom profissional, prático e motivador.
Dá conselhos concretos para:
- Reaproveitamento seguro de excedentes alimentares (conforme normas de higiene);
- Rotação FEFO e gestão de validades;
- Redução de custos e emissões de CO2;
- Sugestões de ementas de desperdício zero.
`
        }
      });

      // Send prompt
      const response = await chat.sendMessage({ message });
      res.json({ reply: response.text });
    } catch (err: any) {
      console.error('Erro na API AI Chat:', err);
      res.status(500).json({ error: 'Erro ao processar mensagem do assistente.', details: err.message });
    }
  });

  // Vite integration in development, static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
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
    console.log(`Servidor SustentaFood a rodar em http://localhost:${PORT}`);
  });
}

startServer();