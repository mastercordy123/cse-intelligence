import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ScraperService } from './scraper.service.js';
import { getMarketStatus } from './market-status.utils.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const scraper = ScraperService.getInstance();

app.use(cors());
app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'CSE Scraper Backend is running' });
});

app.get('/api/market-status', (req: Request, res: Response) => {
  res.json(getMarketStatus());
});

app.get('/api/sectors', (req: Request, res: Response) => {
  res.json({
    sectors: scraper.getData(),
    marketStatus: getMarketStatus()
  });
});

app.post('/api/scrape', async (req: Request, res: Response) => {
  try {
    const data = await scraper.scrapeAll();
    res.json({
      sectors: data,
      marketStatus: getMarketStatus()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to scrape data' });
  }
});

// Polling mechanism: Scrape every 5 minutes (300000 ms)
const POLLING_INTERVAL = 300000;
setInterval(async () => {
  console.log(`[${new Date().toISOString()}] Starting scheduled scrape...`);
  try {
    await scraper.scrapeAll();
  } catch (error) {
    console.error('Scheduled scrape failed:', error);
  }
}, POLLING_INTERVAL);

// Initial scrape
scraper.scrapeAll().then(() => {
  console.log('Initial scrape completed');
}).catch(err => {
  console.error('Initial scrape failed:', err);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

