import { chromium } from 'playwright';
import type { Browser, Page } from 'playwright';

export interface SectorData {
  name: string;
  code: string;
  peRatio: number;
  prevPeRatio: number | null;
  pbvRatio: number;
  prevPbvRatio: number | null;
  lastUpdated: string;
}

export class ScraperService {
  private static instance: ScraperService;
  private currentData: Map<string, SectorData> = new Map();

  private constructor() {}

  public static getInstance(): ScraperService {
    if (!ScraperService.instance) {
      ScraperService.instance = new ScraperService();
    }
    return ScraperService.instance;
  }

  public async scrapeAll(): Promise<SectorData[]> {
    console.log('[SCRAPER] Starting new scrape session...');
    const browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    try {
      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });
      const page = await context.newPage();
      
      console.log('[SCRAPER] Navigating to CSE Summary page...');
      const response = await page.goto('https://www.cse.lk/equity/gics-industry-group-summary', { 
        waitUntil: 'networkidle',
        timeout: 60000 
      });
      
      if (!response || response.status() !== 200) {
        console.error(`[SCRAPER] Failed to load page. Status: ${response?.status()}`);
      }

      await page.waitForSelector('table', { timeout: 15000 });
      console.log('[SCRAPER] Page loaded, tables detected.');

      // 1. Scrape data from the summary page
      const result = await page.evaluate(() => {
        const tables = Array.from(document.querySelectorAll('table'));
        const nameMap: Record<string, string> = {};
        const peMap: Record<string, number> = {};
        const pbvMap: Record<string, number> = {};

        tables.forEach((table) => {
          const text = table.innerText;
          
          // Capture P/E and P/BV Ratios from the summary table
          // Headers: GIG, Index, TURNOVER VALUE, TURNOVER VOLUME, TRADE VOLUME, PER, PBV, ...
          if (text.includes('GIG') && text.includes('PER') && text.includes('PBV')) {
            const rows = Array.from(table.querySelectorAll('tr'));
            rows.forEach(row => {
              const cols = Array.from(row.querySelectorAll('td')).map(td => td.innerText.trim());
              if (cols.length >= 7 && cols[0]) {
                const code = cols[0];
                
                // P/E Ratio (Index 5)
                const peStr = cols[5].replace(/,/g, '');
                const peRatio = parseFloat(peStr);
                if (!isNaN(peRatio)) {
                  peMap[code] = peRatio;
                }

                // P/BV Ratio (Index 6)
                const pbvStr = cols[6].replace(/,/g, '');
                const pbvRatio = parseFloat(pbvStr);
                if (!isNaN(pbvRatio)) {
                  pbvMap[code] = pbvRatio;
                }
              }
            });
          }

          // Capture Names from mapping table
          if (text.includes('Industry Group Code') && text.includes('Industry Group Name')) {
            const rows = Array.from(table.querySelectorAll('tr'));
            rows.forEach(row => {
              const cols = Array.from(row.querySelectorAll('td')).map(td => td.innerText.trim());
              if (cols.length >= 4 && cols[0]) {
                const code = cols[0];
                const name = cols[3];
                nameMap[code] = name;
              }
            });
          }
        });

        return { peMap, pbvMap, nameMap };
      });

      // 2. Cross-reference to ensure we have all 20 sectors
      const finalSectors: SectorData[] = Object.keys(result.nameMap).map(code => {
        const existing = this.currentData.get(code);
        
        const currentPe = result.peMap[code] !== undefined ? result.peMap[code] : 0;
        const currentPbv = result.pbvMap[code] !== undefined ? result.pbvMap[code] : 0;
        
        let prevPe = existing ? existing.peRatio : null;
        let prevPbv = existing ? existing.pbvRatio : null;

        // Track P/E Changes
        if (existing && existing.peRatio !== currentPe) {
          prevPe = existing.peRatio;
        } else if (existing) {
          prevPe = existing.prevPeRatio;
        }

        // Track P/BV Changes
        if (existing && existing.pbvRatio !== currentPbv) {
          prevPbv = existing.pbvRatio;
        } else if (existing) {
          prevPbv = existing.prevPbvRatio;
        }

        return {
          code,
          name: result.nameMap[code],
          peRatio: currentPe,
          prevPeRatio: prevPe,
          pbvRatio: currentPbv,
          prevPbvRatio: prevPbv,
          lastUpdated: new Date().toISOString()
        };
      });

      // Update local storage
      finalSectors.forEach(data => {
        this.currentData.set(data.code, data);
      });

      console.log(`[SCRAPER] Scrape completed. ${finalSectors.length} sectors processed.`);
      return finalSectors;
    } catch (error) {
      console.error('[SCRAPER] Error during scraping:', error);
      throw error;
    } finally {
      await browser.close();
    }
  }

  public getData(): SectorData[] {
    return Array.from(this.currentData.values());
  }
}
