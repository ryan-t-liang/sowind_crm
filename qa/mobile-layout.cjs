const { chromium } = require('../frontend/node_modules/playwright');
const assert = require('node:assert/strict');

const base = (process.env.PROTOTYPE_BASE_URL || 'http://127.0.0.1:4181').replace(/\/$/, '');
const epsilon = 1.5;

// 430x559 approximates the visible page area in the reported 430x637 browser
// capture after subtracting browser chrome. 431px guards the adjacent CSS
// breakpoint, where the fixed 375px mockup shell becomes active again.
const viewports = [
  { name: 'compact-320', width: 320, height: 568 },
  { name: 'android-360', width: 360, height: 640 },
  { name: 'iphone-375', width: 375, height: 667 },
  { name: 'modern-390', width: 390, height: 844 },
  { name: 'reported-430', width: 430, height: 559 },
  { name: 'breakpoint-431', width: 431, height: 559 },
];

const brands = [
  { brand: 'GP', route: 'girard-perregaux' },
  { brand: 'UN', route: 'ulysse-nardin' },
];

const seedId = brand => `${brand}AS1234567890`;
const pixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
const repairPixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8zwAAAgEBALNn8ZsAAAAASUVORK5CYII=';
const productSources = new Map();

function serialized(value) {
  return JSON.stringify(value, null, 2);
}

async function settle(locator) {
  await locator.waitFor({ state: 'visible' });
  await locator.evaluate(async element => {
    const animations = element.getAnimations({ subtree: true });
    if (!animations.length) return;
    await Promise.race([
      Promise.all(animations.map(animation => animation.finished.catch(() => undefined))),
      new Promise(resolve => setTimeout(resolve, 450)),
    ]);
  });
}

async function readGeometry(locator) {
  return locator.evaluate(element => {
    const rect = element.getBoundingClientRect();
    const viewport = window.visualViewport;
    const frame = {
      left: viewport?.offsetLeft || 0,
      top: viewport?.offsetTop || 0,
      width: viewport?.width || window.innerWidth,
      height: viewport?.height || window.innerHeight,
    };
    frame.right = frame.left + frame.width;
    frame.bottom = frame.top + frame.height;

    const footerButtons = Array.from(element.querySelectorAll('[data-slot="dialog-footer"] button'))
      .filter(button => {
        const style = getComputedStyle(button);
        const box = button.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 0 && box.height > 0;
      })
      .map(button => {
        const box = button.getBoundingClientRect();
        const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
        return {
          text: button.textContent.trim(),
          disabled: button.disabled,
          left: box.left,
          top: box.top,
          right: box.right,
          bottom: box.bottom,
          width: box.width,
          height: box.height,
          hit: Boolean(hit && button.contains(hit)),
        };
      });

    const regions = Array.from(element.querySelectorAll(
      '[data-slot="dialog-header"], [data-slot="dialog-footer"], .entry-panel, .product-confirm, .terms, .preview-image',
    ))
      .filter(region => {
        if (region.classList.contains('sr-only')) return false;
        const style = getComputedStyle(region);
        const box = region.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 0 && box.height > 0;
      })
      .map(region => {
        const box = region.getBoundingClientRect();
        return {
          selector: region.className || region.getAttribute('data-slot'),
          left: box.left,
          top: box.top,
          right: box.right,
          bottom: box.bottom,
        };
      });

    return {
      frame,
      rect: {
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
      },
      position: getComputedStyle(element).position,
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
      scrollHeight: element.scrollHeight,
      clientHeight: element.clientHeight,
      footerButtons,
      regions,
    };
  });
}

function assertInside(rect, frame, label, details) {
  assert(
    rect.left >= frame.left - epsilon &&
      rect.right <= frame.right + epsilon &&
      rect.top >= frame.top - epsilon &&
      rect.bottom <= frame.bottom + epsilon,
    `${label} is clipped by the visual viewport\n${serialized(details)}`,
  );
}

async function assertDocumentFits(page, label) {
  const metrics = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
  }));
  assert(
    metrics.scrollWidth <= metrics.clientWidth + 1 && metrics.bodyScrollWidth <= metrics.clientWidth + 1,
    `${label} creates horizontal document overflow\n${serialized(metrics)}`,
  );
}

async function assertMultilineHeading(locator, label) {
  await settle(locator);
  const metrics = await locator.evaluate(element => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    const lineHeight = Number.parseFloat(style.lineHeight);
    const device = element.closest('.device').getBoundingClientRect();
    return {
      text: element.textContent.trim(),
      height: rect.height,
      lineHeight,
      whiteSpace: style.whiteSpace,
      rect: { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom },
      device: { left: device.left, right: device.right },
    };
  });
  assert.equal(metrics.whiteSpace, 'normal', `${label} should permit wrapping\n${serialized(metrics)}`);
  assert(metrics.height >= metrics.lineHeight * 1.75, `${label} should render on multiple lines\n${serialized(metrics)}`);
  assert(
    metrics.rect.left >= metrics.device.left - epsilon && metrics.rect.right <= metrics.device.right + epsilon,
    `${label} should stay inside the H5 shell\n${serialized(metrics)}`,
  );
}

async function assertFloatingBox(page, locator, label) {
  await settle(locator);
  const metrics = await readGeometry(locator);
  assertInside(metrics.rect, metrics.frame, label, metrics);
  assert(
    metrics.scrollWidth <= metrics.clientWidth + 1,
    `${label} has internal horizontal overflow\n${serialized(metrics)}`,
  );
  await assertDocumentFits(page, label);
  return metrics;
}

async function assertDialog(page, label, { bottomSheet = false } = {}) {
  // A just-closed Radix dialog remains painted during its exit animation, so
  // geometry must target the active layer rather than every :visible node.
  const dialogs = page.locator('[data-slot="dialog-content"][data-state="open"]:visible');
  assert.equal(await dialogs.count(), 1, `${label} should expose exactly one visible dialog`);
  const dialog = dialogs.first();
  const metrics = await assertFloatingBox(page, dialog, label);
  assert.equal(metrics.position, 'fixed', `${label} should remain fixed to the viewport`);

  const center = (metrics.rect.left + metrics.rect.right) / 2;
  const viewportCenter = (metrics.frame.left + metrics.frame.right) / 2;
  assert(
    Math.abs(center - viewportCenter) <= epsilon,
    `${label} is not horizontally centered\n${serialized(metrics)}`,
  );

  if (bottomSheet) {
    assert(
      Math.abs(metrics.rect.bottom - metrics.frame.bottom) <= epsilon,
      `${label} is not attached to the bottom edge\n${serialized(metrics)}`,
    );
  }

  for (const region of metrics.regions) {
    assertInside(region, metrics.frame, `${label} region ${region.selector}`, metrics);
    assert(
      region.left >= metrics.rect.left - epsilon && region.right <= metrics.rect.right + epsilon,
      `${label} region escapes the dialog horizontally\n${serialized(metrics)}`,
    );
  }

  for (const button of metrics.footerButtons) {
    assertInside(button, metrics.frame, `${label} footer button ${button.text}`, metrics);
    assert(
      button.left >= metrics.rect.left - epsilon && button.right <= metrics.rect.right + epsilon,
      `${label} footer button escapes the dialog\n${serialized(metrics)}`,
    );
    if (!button.disabled) assert(button.hit, `${label} footer button ${button.text} is occluded at its center point`);
    assert(button.width >= 44 && button.height >= 40, `${label} footer button ${button.text} has an unstable touch target`);
  }

  for (let first = 0; first < metrics.footerButtons.length; first += 1) {
    for (let second = first + 1; second < metrics.footerButtons.length; second += 1) {
      const a = metrics.footerButtons[first];
      const b = metrics.footerButtons[second];
      const overlaps = a.left < b.right - epsilon && a.right > b.left + epsilon &&
        a.top < b.bottom - epsilon && a.bottom > b.top + epsilon;
      assert(!overlaps, `${label} footer buttons overlap\n${serialized(metrics)}`);
    }
  }

  const backdrops = page.locator('[data-slot="dialog-overlay"][data-state="open"]:visible');
  assert.equal(await backdrops.count(), 1, `${label} should expose exactly one visible backdrop`);
  const backdrop = await readGeometry(backdrops.first());
  assert(
    backdrop.rect.left <= backdrop.frame.left + epsilon &&
      backdrop.rect.right >= backdrop.frame.right - epsilon &&
      backdrop.rect.top <= backdrop.frame.top + epsilon &&
      backdrop.rect.bottom >= backdrop.frame.bottom - epsilon,
    `${label} backdrop does not cover the visual viewport\n${serialized(backdrop)}`,
  );
}

async function selectAndAssert(page, label, option, prefix) {
  await page.getByRole('combobox', { name: label, exact: true }).click();
  await assertFloatingBox(page, page.locator('.select-menu[data-state="open"]'), `${prefix}: select ${label}`);
  await page.getByRole('option', { name: option, exact: true }).click();
}

async function assertToast(page, label) {
  const toast = page.locator('[data-sonner-toast]:visible').first();
  await assertFloatingBox(page, toast, label);
}

async function assertHeaderFits(page, label) {
  const layout = await page.evaluate(() => {
    const selectors = ['.left-pill', '.mini-header > .brand-mark', '.header-title', '.right-pill'];
    const boxes = selectors.map(selector => {
      const element = document.querySelector(selector);
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return { selector, left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
    }).filter(Boolean);
    const overlaps = [];
    for (let first = 0; first < boxes.length; first += 1) {
      for (let second = first + 1; second < boxes.length; second += 1) {
        const a = boxes[first];
        const b = boxes[second];
        if (a.left < b.right - 0.5 && a.right > b.left + 0.5 && a.top < b.bottom - 0.5 && a.bottom > b.top + 0.5) {
          overlaps.push([a.selector, b.selector]);
        }
      }
    }
    return { boxes, overlaps };
  });
  assert.deepEqual(layout.overlaps, [], `${label} header controls overlap\n${serialized(layout)}`);
  await assertDocumentFits(page, label);
}

async function assertProductImage(page, brand, label) {
  const images = page.locator('.product-confirm img');
  assert.equal(await images.count(), 1, `${label} should render exactly one product image`);
  const image = images.first();
  await image.waitFor({ state: 'visible' });
  await image.evaluate(async element => {
    if (!element.complete || element.naturalWidth === 0) await element.decode();
  });
  const metrics = await image.evaluate(element => {
    const rect = element.getBoundingClientRect();
    const card = element.closest('.product-confirm').getBoundingClientRect();
    return {
      complete: element.complete,
      naturalWidth: element.naturalWidth,
      naturalHeight: element.naturalHeight,
      alt: element.getAttribute('alt') || '',
      src: element.currentSrc || element.src,
      rect: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height },
      card: { left: card.left, top: card.top, right: card.right, bottom: card.bottom },
    };
  });
  assert(metrics.complete && metrics.naturalWidth > 0 && metrics.naturalHeight > 0, `${label} product image should load\n${serialized(metrics)}`);
  assert(metrics.alt.trim(), `${label} product image should expose a meaningful alt`);
  assert(metrics.rect.width > 0 && metrics.rect.height > 0, `${label} product image should occupy visible space`);
  assert(
    metrics.rect.left >= metrics.card.left - epsilon && metrics.rect.right <= metrics.card.right + epsilon &&
      metrics.rect.top >= metrics.card.top - epsilon && metrics.rect.bottom <= metrics.card.bottom + epsilon,
    `${label} product image should remain inside its confirmation card\n${serialized(metrics)}`,
  );
  if (productSources.has(brand)) assert.equal(productSources.get(brand), metrics.src, `${brand} product image source should stay stable across viewports`);
  else productSources.set(brand, metrics.src);
}

async function advanceSeed(page, brand, actions) {
  await page.evaluate(({ id, actions, image, completedImage }) => {
    const service = window.SowindService;
    for (const action of actions) {
      if (action === 'approve') {
        service.transition(id, action, {
          store: '上海南京西路形象店',
          storePhone: '021-62155167',
          advisor: '移动端几何回归',
        }, 'admin');
      } else if (action === 'send-kit') {
        service.transition(id, action, { kitTracking: 'SF-KIT-MOBILE-01' }, 'admin');
      } else if (action === 'send-watch') {
        service.transition(id, action, { inboundTracking: 'SF-IN-MOBILE-01' }, 'customer');
      } else if (action === 'receive') {
        service.transition(id, action, {
          receivedImages: [{ id: 'received-mobile', name: '收件图片.png', dataUrl: image }],
        }, 'admin');
      } else if (action === 'start-parts' || action === 'start-repair') {
        service.transition(id, action, {
          quoteAmount: 1234,
          paymentConfirmed: true,
        }, 'admin');
      } else if (action === 'parts-arrived') {
        service.transition(id, action, {}, 'admin');
      } else if (action === 'finish-repair') {
        service.transition(id, action, {
          serviceNote: '移动端弹层几何回归',
          serviceImages: [{ id: 'service-mobile', name: '售后完成图片.png', dataUrl: completedImage }],
        }, 'admin');
      } else if (action === 'return-watch') {
        service.transition(id, action, { outboundTracking: 'SF-OUT-MOBILE-01' }, 'admin');
      }
    }
  }, { id: seedId(brand), actions, image: pixel, completedImage: repairPixel });
}

async function exerciseOverlays(page, brand, route, viewportName) {
  const prefix = `${brand} ${viewportName}`;
  const mobileUrl = `${base}/mockup/${route}/index.html`;
  let response = await page.goto(`${mobileUrl}#/home`, { waitUntil: 'networkidle' });
  assert(response && response.ok(), `${prefix}: H5 entry should return HTTP 200`);
  await assertHeaderFits(page, `${prefix}: home header`);
  assert.equal(await page.getByRole('button', { name: '我的作品', exact: true }).count(), 0, `${prefix}: retired works shortcut should not exist`);
  await page.goto(`${mobileUrl}#/works`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: '售后服务', exact: true }).waitFor();
  assert.equal(await page.getByText('我的作品', { exact: true }).count(), 0, `${prefix}: legacy works URL should not expose a works page`);

  await page.goto(`${mobileUrl}#/service`, { waitUntil: 'networkidle' });
  await page.locator('[data-sowind-language-toggle]').click();
  const serviceHeading = page.getByRole('heading', {
    name: brand === 'GP' ? 'Boundless Craftsmanship Across Time' : 'Mastering Time Across Every Horizon',
    exact: true,
  });
  await serviceHeading.waitFor();
  await assertMultilineHeading(serviceHeading, `${prefix}: English service heading`);
  await assertDocumentFits(page, `${prefix}: English service page`);
  await page.locator('[data-sowind-language-toggle]').click();

  await page.goto(`${mobileUrl}#/aftersales`, { waitUntil: 'networkidle' });
  await assertFloatingBox(page, page.locator('.watchmaker-carousel'), `${prefix}: aftersales carousel`);

  await page.goto(`${mobileUrl}#/faq`, { waitUntil: 'networkidle' });
  await assertFloatingBox(page, page.locator('.fa-faq .fa-intro'), `${prefix}: FAQ introduction`);

  await page.goto(`${mobileUrl}#/apply`, { waitUntil: 'networkidle' });
  await assertHeaderFits(page, `${prefix}: apply header`);
  await assertDocumentFits(page, `${prefix}: apply page`);

  await selectAndAssert(page, '称谓*', '女士', prefix);
  await page.getByRole('textbox', { name: '姓氏*', exact: true }).fill('周');
  await page.getByRole('textbox', { name: '名字*', exact: true }).fill('移动回归');
  await page.getByRole('textbox', { name: '电话', exact: true }).fill('13800138001');

  await page.getByRole('button', { name: '添加产品', exact: true }).click();
  await assertDialog(page, `${prefix}: product entry sheet`, { bottomSheet: true });
  await page.getByRole('button', { name: '如何找到我的作品编号？', exact: true }).click();
  await assertDialog(page, `${prefix}: expanded product help sheet`, { bottomSheet: true });
  await page.getByRole('textbox', { name: '作品编号', exact: true }).fill(`${brand}MOBILE20261124`);
  await page.getByRole('button', { name: '下一步', exact: true }).click();
  await assertDialog(page, `${prefix}: product confirmation sheet`, { bottomSheet: true });
  await assertProductImage(page, brand, `${prefix}: product confirmation sheet`);
  await page.getByRole('button', { name: '确定', exact: true }).click();

  await selectAndAssert(page, '选择售后原因*', '全面保养服务', prefix);
  await page.getByRole('textbox', { name: '留言和说明', exact: true }).fill('移动端显示回归');
  await page.getByRole('textbox', { name: '专属服务套件寄送地址*', exact: true }).fill('上海市静安区南京西路100号');
  await page.getByRole('textbox', { name: '作品寄回地址*', exact: true }).fill('上海市长宁区愚园路200号');

  await page.getByRole('button', { name: '隐私政策与服务条款', exact: true }).click();
  await assertDialog(page, `${prefix}: terms dialog`);
  await page.getByRole('button', { name: '同意并返回', exact: true }).click();
  await page.getByRole('button', { name: '提交', exact: true }).click();
  await page.getByRole('heading', { name: '售后申请提交成功', exact: true }).waitFor();
  await assertDialog(page, `${prefix}: submission success dialog`);
  await page.getByRole('button', { name: '返回我的', exact: true }).click();

  await page.goto(`${mobileUrl}#/record/${seedId(brand)}`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: '取消预约', exact: true }).click();
  await assertDialog(page, `${prefix}: cancellation dialog`);
  await page.getByRole('button', { name: '返回', exact: true }).click();

  await advanceSeed(page, brand, ['approve', 'send-kit']);
  await page.goto(`${mobileUrl}#/record/${seedId(brand)}`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: '填写快递单号', exact: true }).click();
  await assertDialog(page, `${prefix}: tracking entry sheet`, { bottomSheet: true });
  await page.getByRole('button', { name: '提交', exact: true }).click();
  await assertToast(page, `${prefix}: invalid tracking toast`);
  await page.getByRole('textbox', { name: '快递单号', exact: true }).fill(`SF-IN-${brand}-MOBILE`);
  await page.getByRole('button', { name: '提交', exact: true }).click();
  await page.getByRole('heading', { name: '确认快递单号', exact: true }).waitFor();
  await assertDialog(page, `${prefix}: tracking confirmation dialog`);
  await page.getByRole('button', { name: '返回', exact: true }).click();
  await assertDialog(page, `${prefix}: returned tracking entry sheet`, { bottomSheet: true });
  await page.keyboard.press('Escape');

  const repairPath = brand === 'UN'
    ? ['send-watch', 'receive', 'start-parts', 'parts-arrived', 'finish-repair']
    : ['send-watch', 'receive', 'start-repair', 'finish-repair'];
  await advanceSeed(page, brand, repairPath);
  await page.goto(`${mobileUrl}#/record/${seedId(brand)}`, { waitUntil: 'networkidle' });
  await page.locator('.appointment-info').getByText('维修完成，待寄回', { exact: true }).waitFor();
  await page.getByRole('button', { name: '工单记录', exact: true }).click();
  for (const status of ['门店已收件，检测及报价中', '维修中', '维修完成，待寄回']) {
    assert.equal(await page.locator('.ticket-timeline li').filter({ hasText: status }).count(), 1, `${prefix}: timeline should contain ${status} exactly once`);
  }
  if (brand === 'UN') assert.equal(await page.locator('.ticket-timeline li').filter({ hasText: '维修配件订购中' }).count(), 1, `${prefix}: parts branch should be visible exactly once`);
  const receivedImage = page.locator('.ticket-timeline li').filter({ hasText: '门店已收件，检测及报价中' }).locator('.timeline-images img').first();
  const repairImage = page.locator('.ticket-timeline li').filter({ hasText: '维修完成，待寄回' }).locator('.timeline-images img').first();
  await receivedImage.waitFor();
  await repairImage.waitFor();
  assert.notEqual(await receivedImage.getAttribute('src'), await repairImage.getAttribute('src'), `${prefix}: received and repair-completion images should be independent`);
  await page.locator('.timeline-images button').first().click();
  await page.getByRole('heading', { name: '服务图片', exact: true }).waitFor();
  await assertDialog(page, `${prefix}: service image preview dialog`);
  assert(await page.locator('.preview-image').evaluate(image => image.complete && image.naturalWidth > 0), `${prefix}: preview image should render`);
  await page.getByRole('button', { name: '返回', exact: true }).click();

  await page.locator('[data-sowind-language-toggle]').click();
  await page.getByText('Repair complete — awaiting return shipment', { exact: true }).first().waitFor();
  assert.equal(await page.locator('html').getAttribute('lang'), 'en', `${prefix}: document language should switch to English`);
  await assertMultilineHeading(
    page.getByRole('heading', { name: 'Your after-sales service is booked', exact: true }),
    `${prefix}: English detail heading`,
  );
  const englishTicketNumber = await page.locator('.ticket-number').textContent();
  assert.match(englishTicketNumber || '', new RegExp(`^${brand === 'GP' ? 'Girard-Perregaux' : 'Ulysse Nardin'} service order no\\.: ${brand}AS\\d{10}$`), `${prefix}: English ticket heading should be complete and brand-correct`);
  await assertDocumentFits(page, `${prefix}: English detail page`);
  await page.locator('[data-sowind-language-toggle]').click();
  await page.getByText('维修完成，待寄回', { exact: true }).first().waitFor();

  await advanceSeed(page, brand, ['return-watch']);
  await page.goto(`${mobileUrl}#/record/${seedId(brand)}`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: '我已收到作品', exact: true }).click();
  await page.getByRole('heading', { name: '签收确认', exact: true }).waitFor();
  await assertDialog(page, `${prefix}: receipt confirmation dialog`);
  await page.getByRole('button', { name: '返回', exact: true }).click();

  await assertDocumentFits(page, `${prefix}: final detail page`);
}

(async () => {
  const executablePath = process.env.CHROME_PATH ||
    (process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : undefined);
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  const results = [];
  const failures = [];

  for (const viewport of viewports) {
    for (const { brand, route } of brands) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        screen: { width: viewport.width, height: viewport.height },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 2,
      });
      const page = await context.newPage();
      const runtimeErrors = [];
      page.on('pageerror', error => runtimeErrors.push(error.message));
      page.on('console', message => {
        if (message.type() === 'error') runtimeErrors.push(message.text());
      });
      page.on('requestfailed', request => {
        runtimeErrors.push(`${request.method()} ${request.url()} ${(request.failure() || {}).errorText || ''}`);
      });

      try {
        await exerciseOverlays(page, brand, route, viewport.name);
        assert.deepEqual(runtimeErrors, [], `${brand} ${viewport.name}: browser runtime should stay clean`);
        results.push({ brand, viewport, status: 'PASS' });
      } catch (error) {
        failures.push({
          brand,
          viewport,
          status: 'FAIL',
          url: page.url(),
          error: error.stack || String(error),
          runtimeErrors,
        });
      } finally {
        await context.close();
      }
    }
  }

  assert(productSources.has('GP') && productSources.has('UN'), 'Both brands should expose product imagery');
  assert.notEqual(productSources.get('GP'), productSources.get('UN'), 'GP and UN confirmation cards should use different product images');

  await browser.close();
  const report = {
    base,
    environment: 'Chrome mobile emulation with touch; geometry measured against visualViewport; not physical-device testing',
    results,
    failures,
  };
  console.log(JSON.stringify(report, null, 2));
  if (failures.length) process.exitCode = 1;
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
