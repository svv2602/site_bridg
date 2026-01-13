const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  console.log('Navigating to admin login...');
  
  // Navigate to admin login
  await page.goto('http://localhost:3001/admin/login');
  await page.waitForLoadState('networkidle');
  
  console.log('Logging in...');
  
  // Login
  await page.fill('input[name="email"]', 'admin@bridgestone.ua');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  
  // Wait for dashboard to load
  await page.waitForURL('**/admin', { timeout: 10000 });
  await page.waitForLoadState('networkidle');
  
  console.log('Navigating to tyre 83...');
  
  // Navigate to specific tyre
  await page.goto('http://localhost:3001/admin/collections/tyres/83');
  await page.waitForLoadState('networkidle');
  
  // Wait for page content
  await page.waitForTimeout(2000);
  
  console.log('Looking for fullDescription field...');
  
  // Scroll down to find the fullDescription field
  const fullDescLabel = await page.locator('label:has-text("Full Description")').first();
  if (await fullDescLabel.isVisible()) {
    await fullDescLabel.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
  }
  
  // Take screenshot
  const screenshotPath = '/tmp/payload-tyre-edit.png';
  await page.screenshot({ path: screenshotPath, fullPage: false });
  
  console.log('Screenshot saved to:', screenshotPath);
  
  await browser.close();
})();
