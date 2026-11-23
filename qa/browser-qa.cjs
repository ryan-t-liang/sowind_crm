const { chromium } = require('../frontend/node_modules/playwright');
const fs = require('fs');
const path = require('path');

const base = process.env.PROTOTYPE_BASE_URL || 'http://127.0.0.1:4181';
const out = path.resolve(__dirname, '../qa-artifacts');
fs.mkdirSync(out, { recursive: true });

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });
  const failures = [];
  const results = [];
  async function pageFor(url, viewport) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    page.on('console', message => {
      if (message.type() === 'error') failures.push(`console ${url}: ${message.text()}`);
    });
    page.on('pageerror', error => failures.push(`pageerror ${url}: ${error.message}`));
    const response = await page.goto(url, { waitUntil: 'networkidle' });
    if (!response || !response.ok()) failures.push(`HTTP ${url}: ${response && response.status()}`);
    return { context, page };
  }
  for (const [brand, route] of [['gp', 'girard-perregaux'], ['un', 'ulysse-nardin']]) {
    const url = `${base}/mockup/${route}/index.html#/service`;
    const { context, page } = await pageFor(url, { width: 390, height: 844 });
    await page.getByRole('button', { name: '售后服务' }).click();
    await page.getByText('提交申请').waitFor();
    await page.screenshot({ path: path.join(out, `${brand}-aftersales.png`), fullPage: true });
    await page.getByRole('button', { name: '预约腕表养护' }).click();
    await page.getByText('预约售后服务').waitFor();
    await page.screenshot({ path: path.join(out, `${brand}-apply.png`), fullPage: true });
    await page.getByRole('button', { name: '添加产品' }).click();
    if (brand === 'gp') await page.getByPlaceholder('请手动或扫码输入作品编号').fill('GP17910001');
    else await page.getByRole('button', { name: '模拟扫码' }).click();
    await page.getByRole('button', { name: '下一步' }).click();
    const reasonOptions = await page.locator('select').nth(1).locator('option').count();
    if (reasonOptions !== 14) failures.push(`${brand} service reason options expected 14 including placeholder, got ${reasonOptions}`);
    await page.locator('select').nth(1).selectOption({ label: '腕表抛光/翻新' });
    await page.getByRole('button', { name: '隐私政策与服务条款' }).click();
    await page.getByRole('button', { name: '同意并返回' }).click();
    await page.getByRole('button', { name: '提交' }).click();
    await page.getByRole('heading', { name: '售后申请提交成功' }).waitFor();
    await page.getByRole('button', { name: '返回我的' }).click();
    await page.getByText('售后预约记录').waitFor();
    await page.screenshot({ path: path.join(out, `${brand}-account.png`), fullPage: true });
    await page.getByRole('button', { name: '查看全部' }).click();
    await page.getByRole('button', { name: '已完成' }).click();
    await page.getByText('暂无已完成服务').waitFor();
    await page.getByRole('button', { name: '进行中' }).click();
    await page.getByText('申请成功，待专属顾问与您联系').waitFor();
    const min = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth }));
    if (min.scrollWidth > min.innerWidth) failures.push(`${brand} horizontal overflow ${min.scrollWidth}/${min.innerWidth}`);
    results.push(`${brand}: service -> aftersales -> apply -> account PASS`);
    await context.close();
  }
  {
    const url = `${base}/mockup/sowind_crm/index.html`;
    const { context, page } = await pageFor(url, { width: 1440, height: 1000 });
    await page.getByRole('button', { name: '售后服务' }).click();
    await page.getByRole('heading', { name: '售后服务' }).waitFor();
    if (await page.locator('#serviceRows tr').count() !== 9) failures.push('admin ticket seed count is not 9');
    await page.locator('#serviceDateFrom').fill('2026-11-20');
    await page.locator('#serviceDateTo').fill('2026-11-20');
    await page.getByRole('button', { name: '查询' }).click();
    if (await page.locator('#serviceRows tr').count() !== 1) failures.push('admin date filtering did not return one ticket');
    await page.getByRole('button', { name: '重置' }).click();
    await page.locator('#serviceRows tr').first().getByRole('button', { name: '详情' }).click();
    await page.getByText('当前处理').waitFor();
    await page.getByRole('button', { name: '编辑工单' }).click();
    await page.locator('#editServiceNote').fill('QA 编辑：待完成检测与报价。');
    await page.getByRole('button', { name: '保存更改' }).click();
    await page.getByText('QA 编辑：待完成检测与报价。').waitFor();
    await page.screenshot({ path: path.join(out, 'admin-detail-before.png'), fullPage: true });
    await page.getByRole('button', { name: '确认审核结果' }).click();
    await page.locator('#serviceDetailHeadActions').getByText('门店跟进中').waitFor();
    await page.screenshot({ path: path.join(out, 'admin-detail-after.png'), fullPage: true });
    await page.locator('#serviceKitTracking').fill('SF-KIT-QA-001');
    await page.getByRole('button', { name: '确认寄出套件' }).click();
    await page.locator('#serviceDetailHeadActions').getByText('专属配件已寄送').waitFor();
    await page.locator('#serviceInboundTracking').fill('SF-IN-QA-001');
    await page.getByRole('button', { name: '记录作品已发回' }).click();
    await page.locator('#serviceDetailHeadActions').getByText('作品已发回').waitFor();
    await page.getByRole('button', { name: '确认门店已收件' }).click();
    await page.locator('#serviceDetailHeadActions').getByText('作品已收到，待售后').waitFor();
    await page.getByRole('button', { name: '提交报价与服务结果' }).click();
    await page.locator('#serviceDetailHeadActions').getByText('作品已完成售后，待付款').waitFor();
    await page.locator('#serviceOutboundTracking').fill('SF-OUT-QA-001');
    await page.getByRole('button', { name: '确认收款并寄回' }).click();
    await page.locator('#serviceDetailHeadActions').getByText('作品已寄回，待签收').waitFor();
    await page.getByRole('button', { name: '确认客户已签收' }).click();
    await page.locator('#serviceDetailHeadActions').getByText('服务完成').waitFor();
    await page.screenshot({ path: path.join(out, 'admin-detail-complete.png'), fullPage: true });
    await page.getByRole('button', { name: '返回售后服务列表' }).click();
    await page.getByText('售后工单', { exact: true }).waitFor();
    results.push('admin: list -> detail -> all 8 workflow stages -> list PASS');
    await context.close();
  }
  {
    const url = `${base}/mockup/sowind_crm/index.html`;
    const { context, page } = await pageFor(url, { width: 1440, height: 1000 });
    await page.getByRole('button', { name: '售后服务' }).click();
    await page.locator('#serviceRows tr').first().getByRole('button', { name: '详情' }).click();
    await page.locator('#serviceDecision').selectOption('reject');
    await page.getByRole('button', { name: '确认审核结果' }).click();
    await page.locator('#serviceDetailHeadActions').getByText('已拒绝', { exact: true }).waitFor();
    await page.getByRole('button', { name: '工单已结束' }).waitFor();
    await page.screenshot({ path: path.join(out, 'admin-detail-rejected.png'), fullPage: true });
    results.push('admin: submitted -> rejected terminal branch PASS');
    await context.close();
  }
  await browser.close();
  console.log(JSON.stringify({ results, failures }, null, 2));
  if (failures.length) process.exitCode = 1;
})().catch(error => {
  console.error(error);
  process.exit(1);
});
