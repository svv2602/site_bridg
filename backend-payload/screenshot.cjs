const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1200 }
  });
  const page = await context.newPage();
  
  console.log('Navigating to admin login...');
  await page.goto('http://localhost:3001/admin/login');
  await page.waitForLoadState('networkidle');
  
  console.log('Logging in...');
  await page.fill('input[name="email"]', 'admin@bridgestone.ua');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  
  await page.waitForURL('**/admin', { timeout: 10000 });
  await page.waitForLoadState('networkidle');
  
  console.log('Navigating to tyre 83...');
  await page.goto('http://localhost:3001/admin/collections/tyres/83');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Scroll to the Lexical editor label
  const lexicalLabel = await page.locator('label:has-text("візуальний редактор")').first();
  await lexicalLabel.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  
  // Scroll up to see if there's a toolbar at the top of the editor
  await page.evaluate(() => window.scrollBy(0, -200));
  await page.waitForTimeout(300);
  
  // Find and click on the contenteditable area to focus
  const editor = await page.locator('[contenteditable="true"]').first();
  if (await editor.isVisible()) {
    console.log('Clicking inside the Lexical editor...');
    await editor.click();
    await page.waitForTimeout(500);
  }
  
  // Take screenshot
  const screenshotPath = '/tmp/payload-lexical-focused.png';
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log('Screenshot saved to:', screenshotPath);
  
  // Check for toolbar elements
  const toolbarInfo = await page.evaluate(() => {
    const toolbars = document.querySelectorAll('[class*="toolbar"], [class*="Toolbar"]');
    return Array.from(toolbars).map(t => ({
      className: t.className,
      visible: t.offsetParent !== null,
      innerHTML: t.innerHTML.substring(0, 200)
    }));
  });
  console.log('Toolbar elements found:', JSON.stringify(toolbarInfo, null, 2));
  
  await browser.close();
})();
