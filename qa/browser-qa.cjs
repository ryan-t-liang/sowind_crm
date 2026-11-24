const { chromium } = require('../frontend/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const base = (process.env.PROTOTYPE_BASE_URL || 'http://127.0.0.1:4181').replace(/\/$/, '');
const output = path.resolve(__dirname, '../qa-artifacts/current');
fs.mkdirSync(output, { recursive: true });

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });
  const results = [];
  const failures = [];
  const screenshot = async (page, name) => {
    await page.screenshot({ path: path.join(output, name + '.png'), fullPage: true });
  };
  async function selectMobile(page, label, option) {
    await page.getByRole('combobox', { name: label, exact: true }).click();
    await page.getByRole('option', { name: option, exact: true }).click();
  }
  async function expectText(locator, expected) {
    await locator.filter({ hasText: expected }).first().waitFor({ state: 'visible' });
  }
  async function expectAdminStatus(admin, status) {
    await expectText(admin.locator('#serviceDetailHeadActions'), status);
  }
  async function expectProductImage(page, brand) {
    const images = page.locator('.product-confirm img');
    assert.equal(await images.count(), 1, brand + ' confirmation should contain exactly one product image');
    const image = images.first();
    await image.waitFor({ state: 'visible' });
    await image.evaluate(async element => {
      if (!element.complete || element.naturalWidth === 0) await element.decode();
    });
    const state = await image.evaluate(element => {
      const rect = element.getBoundingClientRect();
      const card = element.closest('.product-confirm').getBoundingClientRect();
      return {
        complete: element.complete,
        naturalWidth: element.naturalWidth,
        naturalHeight: element.naturalHeight,
        alt: element.getAttribute('alt') || '',
        src: element.currentSrc || element.src,
        inside: rect.left >= card.left && rect.right <= card.right && rect.top >= card.top && rect.bottom <= card.bottom,
      };
    });
    assert(state.complete && state.naturalWidth > 0 && state.naturalHeight > 0, brand + ' product image should load');
    assert(state.alt.trim(), brand + ' product image should have meaningful alt text');
    assert(state.inside, brand + ' product image should stay inside its confirmation card');
    return state.src;
  }

  const productSources = new Map();

  for (const [brand, route] of [['GP', 'girard-perregaux'], ['UN', 'ulysse-nardin']]) {
    const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const mobile = await context.newPage();
    const admin = await context.newPage();
    await admin.setViewportSize({ width: 1440, height: 1000 });
    const checks = [];
    const runtimeErrors = [];
    for (const page of [mobile, admin]) {
      page.on('pageerror', error => runtimeErrors.push(error.message));
      page.on('console', message => {
        if (message.type() === 'error') runtimeErrors.push(message.text() + ' [' + (message.location().url || page.url()) + ']');
      });
      page.on('requestfailed', request => {
        const errorText = (request.failure() || {}).errorText || '';
        // Fast hash-route changes legitimately cancel header/icon requests from
        // the page being left; keep real network failures as regressions.
        if (errorText !== 'net::ERR_ABORTED') runtimeErrors.push(request.method() + ' ' + request.url() + ' ' + errorText);
      });
    }
    const check = name => checks.push(name);
    const mobileUrl = base + '/mockup/' + route + '/index.html';
    let ticketId = '';
    try {
      const response = await mobile.goto(mobileUrl + '#/service', { waitUntil: 'networkidle' });
      assert(response && response.ok(), brand + ' entry should return HTTP 200');
      await screenshot(mobile, brand.toLowerCase() + '-01-service');
      await mobile.getByRole('button', { name: '售后服务', exact: true }).click();
      await mobile.getByRole('button', { name: '预约腕表养护', exact: true }).waitFor();
      await screenshot(mobile, brand.toLowerCase() + '-02-aftersales');
      await mobile.getByRole('button', { name: '预约腕表养护', exact: true }).click();
      await screenshot(mobile, brand.toLowerCase() + '-03-empty-form');
      await selectMobile(mobile, '称谓*', '女士');
      await mobile.getByRole('textbox', { name: '姓氏*', exact: true }).fill('周');
      await mobile.getByRole('textbox', { name: '名字*', exact: true }).fill(brand + '测试');
      await mobile.getByRole('textbox', { name: '电话', exact: true }).fill('13800138001');
      await mobile.getByRole('button', { name: '添加产品', exact: true }).click();
      await mobile.getByRole('textbox', { name: '作品编号', exact: true }).fill(brand + 'QA20261124');
      await mobile.getByRole('button', { name: '下一步', exact: true }).click();
      productSources.set(brand, await expectProductImage(mobile, brand));
      await screenshot(mobile, brand.toLowerCase() + '-04-product-confirmation');
      await mobile.getByRole('button', { name: '确定', exact: true }).click();
      await selectMobile(mobile, '选择售后原因*', '全面保养服务');
      await mobile.getByRole('textbox', { name: '留言和说明', exact: true }).fill('请检测走时并安排全面保养');
      await mobile.getByRole('textbox', { name: '专属服务套件寄送地址*', exact: true }).fill('上海市静安区南京西路100号101室');
      await mobile.getByRole('textbox', { name: '作品寄回地址*', exact: true }).fill('上海市长宁区愚园路200号202室');
      await mobile.getByRole('button', { name: '隐私政策与服务条款', exact: true }).click();
      await mobile.getByRole('button', { name: '同意并返回', exact: true }).click();
      await screenshot(mobile, brand.toLowerCase() + '-04-filled-form');
      await mobile.getByRole('button', { name: '提交', exact: true }).click();
      await mobile.getByRole('heading', { name: '售后申请提交成功', exact: true }).waitFor();
      await mobile.getByRole('button', { name: '查看详情', exact: true }).click();
      ticketId = decodeURIComponent(new URL(mobile.url()).hash.split('/')[2]);
      assert.match(ticketId, new RegExp('^' + brand + 'AS\\d{10}$'), 'New ticket uses the brand prefix plus 10 random digits');
      await mobile.reload({ waitUntil: 'networkidle' });
      await expectText(mobile.locator('.appointment-info'), '周' + brand + '测试 女士');
      await expectText(mobile.locator('.appointment-info'), '13800138001');
      await expectText(mobile.locator('.appointment-info'), '南京西路100号101室');
      await expectText(mobile.locator('.appointment-info'), '愚园路200号202室');
      check('UI submission preserves custom name, phone and both addresses after reload');
      await screenshot(mobile, brand.toLowerCase() + '-05-new-detail');

      await mobile.getByRole('button', { name: '修改预约', exact: true }).click();
      assert.equal(await mobile.getByRole('textbox', { name: '名字*', exact: true }).inputValue(), brand + '测试');
      assert.equal(await mobile.getByRole('textbox', { name: '作品寄回地址*', exact: true }).inputValue(), '上海市长宁区愚园路200号202室');
      await mobile.getByRole('textbox', { name: '留言和说明', exact: true }).fill('更新：请先检测走时，再联系我确认服务');
      await mobile.getByRole('button', { name: '保存修改', exact: true }).click();
      await mobile.getByRole('heading', { name: '预约修改成功', exact: true }).waitFor();
      await mobile.getByRole('button', { name: '查看详情', exact: true }).click();
      assert.equal(decodeURIComponent(new URL(mobile.url()).hash.split('/')[2]), ticketId, 'Editing keeps the original ID');
      await expectText(mobile.locator('.appointment-info'), '更新：请先检测走时');
      check('UI editing prefills and updates the original ticket');

      await admin.goto(base + '/mockup/sowind_crm/index.html', { waitUntil: 'networkidle' });
      await admin.getByRole('button', { name: '售后服务', exact: true }).click();
      const newStatusLabels = [
        '作品已收到，待报价/付款',
        '作品报价/付款已确认，订零件中',
        '作品报价/付款已确认，正在维修中',
        '作品维修完成，待寄回',
      ];
      const statusOptions = await admin.locator('#serviceStatus option').allTextContents();
      for (const label of newStatusLabels) assert(statusOptions.includes(label), 'Admin status filter should include ' + label);
      assert(!statusOptions.includes('作品已收到，待售后'), 'Admin filter should remove the old received status');
      assert(!statusOptions.includes('作品已完成售后，待付款'), 'Admin filter should remove the old post-repair payment status');
      const newStatusColors = await admin.evaluate(statuses => statuses.map(status => {
        const element = document.createElement('span');
        element.className = 'service-status status-' + status;
        document.body.appendChild(element);
        const style = getComputedStyle(element);
        const signature = [style.color, style.backgroundColor, style.borderColor].join('|');
        element.remove();
        return signature;
      }), ['received', 'parts_ordering', 'repairing', 'repair_completed']);
      assert.equal(new Set(newStatusColors).size, 4, 'The four quote/payment/repair statuses should use distinct visual treatments');
      const filterLayout = await admin.locator('.service-filter-grid').evaluate(element => {
        const rects = Array.from(element.children).filter(child => !child.hidden).map(child => { const box = child.getBoundingClientRect(); return { left: box.left, right: box.right, top: box.top, bottom: box.bottom }; });
        const overlaps = rects.some((box, index) => rects.slice(index + 1).some(other => box.left < other.right && box.right > other.left && box.top < other.bottom && box.bottom > other.top));
        return { overflow: element.scrollWidth > element.clientWidth, overlaps };
      });
      assert.deepEqual(filterLayout, { overflow: false, overlaps: false }, 'Admin filters fit without overlap');
      const searchBox = await admin.locator('.service-filter-grid .search-field').boundingBox();
      assert(searchBox && searchBox.width >= 240, 'Admin search field remains usable');
      await admin.locator('#serviceKeyword').fill(ticketId);
      await admin.getByRole('button', { name: '查询', exact: true }).click();
      assert.equal(await admin.locator('#serviceRows tr').count(), 1);
      const listActionBox = await admin.getByRole('button', { name: '查看详情', exact: true }).boundingBox();
      assert(listActionBox && listActionBox.width >= 80 && listActionBox.height >= 32, 'List action has a stable click target');
      await expectText(admin.locator('#serviceRows'), brand + 'QA20261124');
      await expectText(admin.locator('#serviceRows'), '周' + brand + '测试 女士');
      await admin.locator('#serviceRows').getByRole('button', { name: '查看详情', exact: true }).click();
      await expectText(admin.locator('#serviceInfoFields'), '更新：请先检测走时');
      await admin.getByRole('button', { name: '确认审核结果', exact: true }).click();
      await expectAdminStatus(admin, '门店跟进中');
      await admin.locator('#serviceKitTracking').fill('SF-KIT-' + brand + '-20261124');
      await admin.getByRole('button', { name: '确认寄出套件', exact: true }).click();
      await expectAdminStatus(admin, '专属配件已寄送');
      await mobile.getByRole('button', { name: '填写快递单号', exact: true }).waitFor();
      check('CRM finds exact submitted ticket and updates customer page across tabs');
      await screenshot(admin, brand.toLowerCase() + '-06-admin-kit');

      await mobile.getByRole('button', { name: '工单记录', exact: true }).click();
      await expectText(mobile.locator('.ticket-timeline'), 'SF-KIT-' + brand + '-20261124');
      await expectText(mobile.locator('.ticket-timeline'), '上海南京西路形象店');
      await screenshot(mobile, brand.toLowerCase() + '-07-kit-timeline');
      await mobile.getByRole('button', { name: brand === 'UN' ? '预约记录' : '预约信息', exact: true }).click();
      await mobile.getByRole('button', { name: '填写快递单号', exact: true }).click();
      await mobile.getByRole('textbox', { name: '快递单号', exact: true }).fill('SF-IN-' + brand + '-20261124');
      await screenshot(mobile, brand.toLowerCase() + '-08-tracking-sheet');
      await mobile.getByRole('button', { name: '提交', exact: true }).click();
      await mobile.getByRole('heading', { name: '确认快递单号', exact: true }).waitFor();
      await mobile.getByRole('button', { name: '确定', exact: true }).click();
      await expectAdminStatus(admin, '作品已发回');
      await expectText(admin.locator('#serviceLogistics'), 'SF-IN-' + brand + '-20261124');
      assert(await mobile.getByRole('button', { name: '修改预约', exact: true }).isDisabled(), 'Editing disabled after watch is shipped');
      check('Customer tracking confirmation updates the same CRM ticket');

      await admin.getByRole('button', { name: '上传图片并确认收件', exact: true }).click();
      await expectText(admin.locator('#serviceActionError'), '收件图片');
      await expectAdminStatus(admin, '作品已发回');
      await admin.locator('#serviceReceivedImages').setInputFiles(path.resolve(__dirname, '../frontend/public/figma/current/6e200.png'));
      await admin.getByRole('button', { name: '上传图片并确认收件', exact: true }).click();
      await expectAdminStatus(admin, '作品已收到，待报价/付款');
      await expectText(mobile.locator('.appointment-info'), '作品已收到，待报价/付款');
      await admin.locator('#serviceQuote').fill('abc');
      await admin.getByRole('button', { name: '确认付款并开始维修', exact: true }).click();
      await expectText(admin.locator('#serviceActionError'), '有效报价');
      await expectAdminStatus(admin, '作品已收到，待报价/付款');
      await admin.locator('#serviceQuote').fill('-10');
      await admin.getByRole('button', { name: '确认付款并开始维修', exact: true }).click();
      await expectText(admin.locator('#serviceActionError'), '有效报价');
      await admin.locator('#serviceQuote').fill('3200.50');
      await admin.getByRole('button', { name: '确认付款并开始维修', exact: true }).click();
      await expectText(admin.locator('#serviceActionError'), '核实收到付款');
      await admin.locator('#servicePaymentConfirmed').check();
      if (brand === 'UN') {
        await admin.getByRole('button', { name: '确认付款并订零件', exact: true }).click();
        await expectAdminStatus(admin, '作品报价/付款已确认，订零件中');
        await expectText(mobile.locator('.appointment-info'), '作品报价/付款已确认，订零件中');
        await admin.getByRole('button', { name: '零件已到货，开始维修', exact: true }).click();
      } else {
        await admin.getByRole('button', { name: '确认付款并开始维修', exact: true }).click();
      }
      await expectAdminStatus(admin, '作品报价/付款已确认，正在维修中');
      await expectText(mobile.locator('.appointment-info'), '作品报价/付款已确认，正在维修中');
      await admin.getByRole('button', { name: '提交维修结果', exact: true }).click();
      await expectText(admin.locator('#serviceActionError'), '服务说明');
      await admin.locator('#serviceNote').fill('已完成机芯清洁、润滑与走时检测');
      await admin.getByRole('button', { name: '提交维修结果', exact: true }).click();
      await expectText(admin.locator('#serviceActionError'), '图片');
      await admin.locator('#serviceRepairImages').setInputFiles(path.resolve(__dirname, '../admin/sowind-sidebar-logo.png'));
      await admin.getByRole('button', { name: '提交维修结果', exact: true }).click();
      await expectAdminStatus(admin, '作品维修完成，待寄回');
      await expectText(mobile.locator('.appointment-info'), '作品维修完成，待寄回');
      await mobile.getByRole('button', { name: '工单记录', exact: true }).click();
      await expectText(mobile.locator('.timeline-quote'), '3,200.5');
      for (const status of ['作品已收到，待报价/付款', '作品报价/付款已确认，正在维修中', '作品维修完成，待寄回']) {
        assert.equal(await mobile.locator('.ticket-timeline li').filter({ hasText: status }).count(), 1, status + ' should appear exactly once in the customer timeline');
      }
      assert.equal(
        await mobile.locator('.ticket-timeline li').filter({ hasText: '作品报价/付款已确认，订零件中' }).count(),
        brand === 'UN' ? 1 : 0,
        'Only the parts-ordering branch should show the optional parts status',
      );
      const receivedEvent = mobile.locator('.ticket-timeline li').filter({ hasText: '作品已收到，待报价/付款' }).first();
      const repairCompletedEvent = mobile.locator('.ticket-timeline li').filter({ hasText: '作品维修完成，待寄回' }).first();
      const receivedImage = receivedEvent.locator('.timeline-images img').first();
      const repairImage = repairCompletedEvent.locator('.timeline-images img').first();
      await receivedImage.waitFor();
      await repairImage.waitFor();
      assert.notEqual(await receivedImage.getAttribute('src'), await repairImage.getAttribute('src'), 'Received and completed stages show different uploaded images');
      assert(await receivedImage.evaluate(img => img.complete && img.naturalWidth > 0), 'A real received image is rendered');
      assert(await repairImage.evaluate(img => img.complete && img.naturalWidth > 0), 'A real repair image is rendered');
      await repairCompletedEvent.locator('.timeline-images button').first().click();
      const imageDialogTitle = mobile.getByRole('heading', { name: '服务图片', exact: true });
      await imageDialogTitle.waitFor();
      assert(await mobile.locator('.preview-image').evaluate(img => img.complete && img.naturalWidth > 0));
      await mobile.getByRole('button', { name: '返回', exact: true }).click();
      await imageDialogTitle.waitFor({ state: 'hidden' });
      check('Prepayment gates repair; received and repair-completed stages display independent images; optional parts branch is represented');
      await screenshot(mobile, brand.toLowerCase() + '-09-repair-timeline');
      await screenshot(admin, brand.toLowerCase() + '-10-admin-repair-completed');

      await admin.locator('#serviceOutboundTracking').fill('SF-OUT-' + brand + '-20261124');
      await admin.getByRole('button', { name: '录入物流并确认寄回', exact: true }).click();
      await expectAdminStatus(admin, '作品已寄回，待签收');
      await mobile.getByRole('button', { name: '我已收到作品', exact: true }).waitFor();
      await expectText(mobile.locator('.ticket-timeline'), 'SF-OUT-' + brand + '-20261124');
      await mobile.getByRole('button', { name: '我已收到作品', exact: true }).click();
      await mobile.getByRole('heading', { name: '签收确认', exact: true }).waitFor();
      await mobile.getByRole('button', { name: '确定', exact: true }).click();
      await expectAdminStatus(admin, '服务完成');
      await mobile.reload({ waitUntil: 'networkidle' });
      await expectText(mobile.locator('.appointment-info'), '服务完成');
      assert.equal(await mobile.getByRole('button', { name: '修改预约', exact: true }).count(), 0);
      check('Offline payment confirmation, return shipping and customer receipt complete the shared ticket and persist');
      await screenshot(mobile, brand.toLowerCase() + '-11-completed-detail');

      await mobile.getByRole('button', { name: '更多', exact: true }).click();
      await mobile.getByRole('button', { name: '查看全部', exact: true }).click();
      await mobile.getByRole('button', { name: '已完成', exact: true }).click();
      assert.equal(await mobile.locator('.status-card').count(), 1);
      await expectText(mobile.locator('.status-card'), '周' + brand + '测试 女士');
      await mobile.getByRole('button', { name: '进行中', exact: true }).click();
      assert.equal(await mobile.locator('.status-card').count(), 1, 'Only the original seed remains active');
      await mobile.getByRole('button', { name: '查看详情', exact: true }).click();
      await mobile.getByRole('button', { name: '取消预约', exact: true }).click();
      await mobile.getByRole('button', { name: '确定', exact: true }).click();
      await expectText(mobile.locator('.appointment-info'), '已取消');
      await mobile.reload({ waitUntil: 'networkidle' });
      await expectText(mobile.locator('.appointment-info'), '已取消');
      await mobile.getByRole('button', { name: '更多', exact: true }).click();
      await mobile.getByRole('button', { name: '查看全部', exact: true }).click();
      await mobile.getByRole('button', { name: '已取消', exact: true }).click();
      assert.equal(await mobile.locator('.status-card').count(), 1);
      await expectText(mobile.locator('.status-card'), '已取消');
      await screenshot(mobile, brand.toLowerCase() + '-12-cancelled-list');
      await admin.getByRole('button', { name: '返回售后服务列表', exact: true }).click();
      await admin.locator('#serviceKeyword').fill(brand + 'AS1234567890');
      await admin.getByRole('button', { name: '查询', exact: true }).click();
      await expectText(admin.locator('#serviceRows'), '已取消');
      await admin.getByRole('button', { name: '重置', exact: true }).click();
      const statusColors = await admin.locator('#serviceRows').evaluate(rows => ['submitted', 'completed', 'cancelled'].map(status => { const element = rows.querySelector('.status-' + status); return element ? getComputedStyle(element).backgroundColor : ''; }));
      assert(statusColors.every(Boolean) && new Set(statusColors).size === statusColors.length, 'Submitted, completed and cancelled statuses use distinct colors');
      check('Cancellation is retained after reload and visible in both cancelled list and CRM');
      await admin.getByRole('button', { name: '会员', exact: true }).click();
      assert(!(await admin.locator('#serviceView').evaluate(el => el.classList.contains('is-active'))));
      await admin.getByRole('button', { name: '线索', exact: true }).click();
      check('Original member and lead navigation remains available');

      const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      assert.equal(overflow, false, brand + ' responsive viewport has no horizontal overflow');
      assert.deepEqual(runtimeErrors, [], 'No browser console or runtime errors');
      results.push({ brand, status: 'PASS', ticketId, checks });
    } catch (error) {
      const detail = { brand, status: 'FAIL', ticketId, checks, error: error.stack || String(error), runtimeErrors };
      failures.push(detail);
      await screenshot(mobile, brand.toLowerCase() + '-failure-mobile').catch(() => {});
      await screenshot(admin, brand.toLowerCase() + '-failure-admin').catch(() => {});
    } finally {
      await context.close();
    }
  }
  assert(productSources.has('GP') && productSources.has('UN'), 'Both brand confirmation cards should render product imagery');
  assert.notEqual(productSources.get('GP'), productSources.get('UN'), 'GP and UN should use different product-image assets');
  await browser.close();
  const report = { base, environment: 'Chrome headless, responsive 375x812 customer and 1440x1000 admin viewports; not physical-device testing', results, failures };
  fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  if (failures.length) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
