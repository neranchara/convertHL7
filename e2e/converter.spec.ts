import { test, expect } from '@playwright/test';

test('should convert HL7 input to JSON', async ({ page }) => {
  await page.goto('/');
  
  const sampleHL7 = 'MSH|^~\\&|SENDING_APP|SENDING_FAC|||202305141821||ADT^A01|123|P|2.3\nPID|||PATID123||DOE^JOHN||19800101|M|||123 MAIN ST^^CITY^ST^12345';
  
  await page.fill('textarea', sampleHL7);
  
  // Default format is JSON
  const output = await page.textContent('.output-pre');
  expect(output).toContain('"name": "MSH"');
  expect(output).toContain('"name": "PID"');
  expect(output).toContain('null'); // Check for handled empty fields
});

test('should switch formats and update output', async ({ page }) => {
  await page.goto('/');
  const sampleHL7 = 'MSH|^~\\&|SENDING_APP|...';
  await page.fill('textarea', sampleHL7);
  
  // Switch to XML
  await page.click('button:text("XML")');
  await expect(page.locator('.output-pre')).toContainText('<HL7Message>');
  
  // Switch to CSV
  await page.click('button:text("CSV")');
  await expect(page.locator('.output-pre')).toContainText('Segment,Field_Index,Value');
});
