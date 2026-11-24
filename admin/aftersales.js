(function () {
  "use strict";
  var service = window.SowindService;
  var $ = function (id) { return document.getElementById(id); };
  if (!service) {
    $("serviceActionDescription").textContent = "售后数据加载失败，请刷新页面重试。";
    return;
  }
  var statuses = service.statusCatalog;
  var flow = ["submitted", "assigned", "kit_sent", "customer_sent", "received", "payment", "return_sent", "completed"];
  var role = "ADMIN", selectedId = null, editingVersion = null, editingId = null, renderedVersion = null;
  var imageCache = [], pendingEditReceivedImages = null, pendingEditServiceImages = null, pendingReceivedImages = null, pendingRepairImages = null, imageReadVersion = 0, editImageReadVersion = 0, editImageReadPending = 0;
  var stores = ["上海南京西路形象店", "上海恒隆广场精品店", "北京国贸商城精品店", "深圳万象城精品店"];
  function esc(value) { return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function brandLabel(brand) { return brand === "GP" ? "GP 芝柏表" : "UN 雅典表"; }
  function customer(item) { return item.customer || [item.lastName, item.firstName].join("") + " " + (item.salutation || ""); }
  function statusOf(item) { return statuses[item.status] || { label: item.status, tone: "pending" }; }
  function badge(item) { var status = statusOf(item); return '<span class="service-status ' + esc(status.tone || "active") + ' status-' + esc(item.status) + '">' + esc(status.label) + '</span>'; }
  function errorAt(id, error) { $(id).textContent = error.message || String(error); $(id).hidden = false; }
  function clearError(id) { $(id).hidden = true; $(id).textContent = ""; }
  function toast(message) { if (window.SowindCRM && window.SowindCRM.showToast) window.SowindCRM.showToast(message); }
  function selected() { return selectedId ? service.getTicket(selectedId) : null; }
  function inScope(item) { return role === "ADMIN" || item.store === $("serviceWorkingStore").value; }
  function requireScope(item) { if (!item || !inScope(item)) throw new Error("该工单不属于当前工作视图，请返回列表查看。"); }
  function all() { return service.getTickets(); }
  function options(values, selectedValue) { return values.map(function (value) { return '<option' + (value === selectedValue ? ' selected' : '') + '>' + esc(value) + '</option>'; }).join(""); }
  function updateStores() {
    var working = $("serviceWorkingStore").value;
    stores = Array.from(new Set(stores.concat(all().map(function (item) { return item.store; }).filter(function (value) { return value && value !== "未分配"; }))));
    $("serviceWorkingStore").innerHTML = options(stores, working || stores[0]);
  }
  function activate(viewId) {
    document.querySelectorAll(".view").forEach(function (view) { view.classList.toggle("is-active", view.id === viewId); });
    document.querySelectorAll(".nav-item").forEach(function (item) { item.classList.toggle("is-active", item.dataset.navKey === "services"); });
    window.scrollTo(0, 0);
  }
  function showList() { activate("serviceView"); $("breadcrumbText").textContent = "售后服务"; updateStores(); renderList(); }
  function showDetail(id) {
    selectedId = id;
    var item = selected();
    if (!item || !inScope(item)) { showList(); return; }
    renderedVersion = item.revision || item.updated;
    activate("serviceDetailView"); $("breadcrumbText").textContent = "售后服务 / 工单详情"; renderDetail();
  }
  function filtered() {
    var keyword = $("serviceKeyword").value.trim().toLowerCase(), queryField = $("serviceQueryField").value;
    return all().filter(function (item) {
      var fields = {
        ALL: [item.id, customer(item), item.phone, item.reference, item.serial, item.store],
        TICKET: [item.id], CUSTOMER: [customer(item)], PHONE: [item.phone],
        PRODUCT: [item.reference, item.serial], STORE: [item.store]
      };
      return inScope(item) && ($("serviceBrand").value === "ALL" || item.brand === $("serviceBrand").value)
        && ($("serviceStatus").value === "ALL" || item.status === $("serviceStatus").value)
        && (!keyword || (fields[queryField] || fields.ALL).join(" ").toLowerCase().includes(keyword));
    });
  }
  function renderMetrics() {
    var items = all().filter(inScope);
    $("serviceMetricTotal").textContent = items.length;
    $("serviceMetricPending").textContent = items.filter(function (item) { return ["submitted", "payment"].includes(item.status); }).length;
    $("serviceMetricActive").textContent = items.filter(function (item) { return ["assigned", "kit_sent", "customer_sent", "received", "return_sent"].includes(item.status); }).length;
    $("serviceMetricComplete").textContent = items.filter(function (item) { return item.status === "completed"; }).length;
    $("serviceNavCount").textContent = all().length;
  }
  function renderList() {
    var items = filtered();
    $("serviceRows").innerHTML = items.map(function (item) {
      return '<tr data-service-id="' + esc(item.id) + '"><td><div class="service-ticket"><strong>' + esc(item.id) + '</strong><span>' + esc(item.created) + '</span></div></td>'
        + '<td><span class="badge brand ' + item.brand.toLowerCase() + '">' + esc(item.brand) + '</span></td>'
        + '<td><div class="service-customer"><strong>' + esc(customer(item)) + '</strong><span>' + esc(item.phone) + '</span></div></td>'
        + '<td><div class="service-ticket"><strong>' + esc(item.reference) + '</strong><span>' + esc(item.serial) + '</span></div></td><td>' + esc(item.reason) + '</td>'
        + '<td>' + badge(item) + '</td><td>' + esc(item.store || "未分配") + '</td><td>' + esc(item.updated) + '</td>'
        + '<td><div class="service-row-actions"><button class="service-row-action" data-service-open><span>查看详情</span><svg><use href="#i-chevron"></use></svg></button></div></td></tr>';
    }).join("");
    $("serviceResultCount").textContent = items.length + " 条结果";
    $("serviceTableSummary").textContent = items.length ? "显示 1–" + items.length + "，共 " + items.length + " 条工单" : "无匹配结果";
    $("serviceTableWrap").hidden = !items.length; $("serviceEmpty").hidden = !!items.length;
    $("serviceRoleHint").textContent = role === "ADMIN" ? "显示全部品牌工单" : "当前门店：" + $("serviceWorkingStore").value;
    renderMetrics();
  }
  function field(label, value, wide) { return '<div class="service-field' + (wide ? ' wide' : '') + '"><label>' + esc(label) + '</label><strong>' + esc(value || "—") + '</strong></div>'; }
  function input(id, label, value, extra) { return '<label><span class="field-label">' + esc(label) + '</span><input class="control" id="' + id + '" value="' + esc(value == null ? "" : value) + '" ' + (extra || '') + '></label>'; }
  function actionButton(action, text) { return '<button type="button" class="btn btn-primary" data-service-action="' + action + '">' + text + '</button>'; }
  function imageGrid(images) {
    return '<div class="service-image-grid">' + (images || []).map(function (image) {
      if (!image || !/^data:image\/(png|jpeg|webp);base64,/.test(image.dataUrl || "")) return '';
      var index = imageCache.push(image) - 1;
      return '<button type="button" data-service-image="' + index + '" aria-label="查看图片 ' + esc(image.name) + '"><img src="' + esc(image.dataUrl) + '" alt="' + esc(image.name) + '"><small>' + esc(image.name) + '</small></button>';
    }).join("") + '</div>';
  }
  function actions(item) {
    if (item.status === "submitted") {
      if (role !== "ADMIN") return { description: "该申请待管理员审核并分配门店。", html: "" };
      return { description: "审核通过后，门店名称、联系电话和专属顾问将显示在客户的工单记录中。", html:
        '<label><span class="field-label">审核结果</span><select class="control" id="serviceDecision"><option value="approve">通过申请</option><option value="reject">拒绝申请</option></select></label>'
        + '<div id="serviceApprovalFields"><label><span class="field-label">负责门店</span><select class="control" id="serviceAssignStore">' + options(stores, "上海南京西路形象店") + '</select></label>'
        + input("serviceStorePhone", "门店联系电话", "021-62155167", 'type="tel"') + input("serviceAssignAdvisor", "专属顾问", "Anne Yang") + '</div>'
        + '<label id="serviceRejectionField" hidden><span class="field-label">拒绝原因（客户可见）</span><textarea class="control" id="serviceRejectionReason" rows="3" placeholder="请说明申请被拒绝的原因"></textarea></label>'
        + actionButton("review", "确认审核结果") };
    }
    if (item.status === "assigned") return { description: "专属服务套件寄出后录入物流单号，客户可在工单记录中查看。", html: input("serviceKitTracking", "专属套件物流单号", "", 'placeholder="请输入快递单号"') + actionButton("send-kit", "确认寄出套件") };
    if (item.status === "kit_sent") return { description: "客户可在预约信息页填写寄出作品的快递单号；收到客户通知后，也可在此代录。", html: input("serviceInboundTracking", "客户寄出作品物流单号", "", 'placeholder="请输入客户提供的快递单号"') + actionButton("send-watch", "记录作品已发回") };
    if (item.status === "customer_sent") return { description: "核对客户寄出的作品和物流信息，上传收件凭证后确认收件。该图片会显示在“作品已收到，待售后”节点。", html:
      '<label><span class="field-label">作品收件图片</span><input class="control" id="serviceReceivedImages" type="file" accept="image/jpeg,image/png,image/webp" multiple><small class="scope-note">必传，最多4张，每张不超过600KB，合计不超过1.5MB。</small></label><div id="serviceReceivedPreview">' + imageGrid(item.receivedImages) + '</div>'
      + actionButton("receive", "上传图片并确认收件") };
    if (item.status === "received") return { description: "录入服务报价、客户可见的服务说明和售后完成图片，完成后将更新客户工单记录。", html:
      input("serviceQuote", "服务报价（元）", item.quoteAmount == null ? "" : item.quoteAmount, 'inputmode="decimal" placeholder="请输入报价金额"')
      + '<label><span class="field-label">服务说明（客户可见）</span><textarea class="control" id="serviceNote" rows="4" placeholder="填写已完成的服务内容">' + esc(item.serviceNote === "—" ? "" : item.serviceNote) + '</textarea></label>'
      + '<label><span class="field-label">售后完成图片</span><input class="control" id="serviceRepairImages" type="file" accept="image/jpeg,image/png,image/webp" multiple><small class="scope-note">必传，最多4张，每张不超过600KB，合计不超过1.5MB。该图片与收件图片分开保存。</small></label><div id="serviceRepairPreview">' + imageGrid(item.serviceImages) + '</div>'
      + actionButton("finish-service", "提交报价与服务结果") };
    if (item.status === "payment") return { description: "确认收到线下转账后，录入寄回作品的快递单号。客户随后可确认签收。", html:
      '<label class="service-confirm-row"><input type="checkbox" id="servicePaymentConfirmed"><span>已核实收到客户线下付款</span></label>'
      + input("serviceOutboundTracking", "作品寄回物流单号", "", 'placeholder="请输入快递单号"') + actionButton("return-watch", "确认收款并寄回") };
    if (item.status === "return_sent") return { description: "客户可在预约详情确认收到作品；收到客户确认后，也可在此代为登记。", html: '<label class="service-confirm-row"><input type="checkbox" id="serviceReceiptConfirmed"><span>已与客户核实作品签收</span></label>' + actionButton("complete", "确认客户已签收") };
    return { description: item.status === "rejected" ? "申请已拒绝，原因已同步给客户。" : item.status === "cancelled" ? "客户已取消预约，工单记录已保留。" : "客户已签收作品，售后服务已完成。", html: '<button class="btn" disabled>' + (item.status === "completed" ? '服务已完成' : '工单已结束') + '</button>' };
  }
  function renderDetail() {
    var item = selected();
    if (!item || !inScope(item)) { showList(); return; }
    renderedVersion = item.revision || item.updated;
    imageCache = []; pendingReceivedImages = null; pendingRepairImages = null; imageReadVersion += 1;
    clearError("serviceActionError");
    $("serviceDetailNo").textContent = item.id;
    $("serviceDetailSubtitle").textContent = brandLabel(item.brand) + " · 创建于 " + item.created;
    $("serviceDetailHeadActions").innerHTML = '<button class="btn" data-service-edit><svg><use href="#i-edit"></use></svg>编辑工单</button>' + badge(item);
    var current = flow.indexOf(item.status);
    $("serviceWorkflow").innerHTML = flow.map(function (status, index) { return '<div class="service-step' + (index < current ? ' is-done' : index === current ? ' is-current' : '') + '"><span>' + (index + 1) + '</span><small>' + esc(statuses[status].label) + '</small></div>'; }).join("");
    $("serviceCustomerFields").innerHTML = field("客户", customer(item)) + field("手机号", item.phone) + field("作品型号", item.reference) + field("作品编号", item.serial) + field("专属套件寄送地址", item.kitAddress, true) + field("作品寄回地址", item.returnAddress, true);
    $("serviceInfoFields").innerHTML = field("品牌", brandLabel(item.brand)) + field("售后原因", item.reason) + field("负责门店", item.store) + field("门店联系电话", item.storePhone) + field("专属顾问", item.advisor) + field("客户说明", item.description, true) + field("门店服务说明（客户可见）", item.serviceNote, true)
      + (item.rejectionReason ? field("拒绝原因", item.rejectionReason, true) : "") + (item.cancelReason ? field("取消原因", item.cancelReason, true) : "");
    $("serviceLogistics").innerHTML = '<article><strong>专属服务套件</strong><span>' + esc(item.kitTracking || "尚未寄出") + '</span></article><article><strong>客户寄出作品</strong><span>' + esc(item.inboundTracking || "尚未录入") + '</span></article><article><strong>作品收件图片</strong>' + (item.receivedImages && item.receivedImages.length ? imageGrid(item.receivedImages) : '<span>尚未上传</span>') + '</article><article><strong>服务报价</strong><span>' + esc(item.quoteAmount == null ? "待门店检测后更新" : "¥" + Number(item.quoteAmount).toLocaleString("zh-CN")) + '</span></article><article><strong>售后完成图片</strong>' + (item.serviceImages && item.serviceImages.length ? imageGrid(item.serviceImages) : '<span>尚未上传</span>') + '</article><article><strong>作品寄回</strong><span>' + esc(item.outboundTracking || "尚未寄出") + '</span></article>';
    var action = actions(item); $("serviceActionDescription").textContent = action.description; $("serviceActionControls").innerHTML = action.html;
    $("serviceHistory").innerHTML = (item.history || []).slice().reverse().map(function (log) { return '<li><strong>' + esc(log.title) + '</strong><span>' + esc(log.time) + ' · ' + esc(log.actor === "customer" ? "客户" : "管理员") + '</span><p>' + esc(log.note) + '</p></li>'; }).join("");
  }
  function parseQuote(value, required) {
    var raw = String(value).trim();
    if (!raw && !required) return null;
    if (!/^\d+(\.\d{1,2})?$/.test(raw) || !Number.isFinite(Number(raw)) || Number(raw) > 10000000) throw new Error("请输入0至10000000之间的有效报价金额，最多保留两位小数。");
    return Number(raw);
  }
  async function readImages(fileList) {
    var files = Array.from(fileList || []);
    if (files.length > 4) throw new Error("一次最多选择4张图片。");
    files.forEach(function (file) { if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("仅支持JPG、PNG和WebP图片。"); if (file.size > 600 * 1024) throw new Error("每张图片不能超过600KB，请压缩后重试。"); });
    if (files.reduce(function (total, file) { return total + file.size; }, 0) > 1499800) throw new Error("图片合计不能超过1.5MB，请压缩后重试。");
    return Promise.all(files.map(function (file) { return new Promise(function (resolve, reject) { var reader = new FileReader(); reader.onerror = function () { reject(new Error("图片读取失败，请重新选择。")); }; reader.onload = function () { resolve({ id: crypto.randomUUID(), name: file.name, dataUrl: reader.result }); }; reader.readAsDataURL(file); }); }));
  }
  function advance(action) {
    clearError("serviceActionError");
    try {
      var item = selected(); requireScope(item);
      var data = {}, apiAction = action;
      if (action === "review") {
        if (role !== "ADMIN") throw new Error("审核分派需由管理员完成。");
        apiAction = $("serviceDecision").value;
        data = apiAction === "reject" ? { rejectionReason: $("serviceRejectionReason").value.trim() } : { store: $("serviceAssignStore").value, storePhone: $("serviceStorePhone").value.trim(), advisor: $("serviceAssignAdvisor").value.trim() };
        if (apiAction === "approve" && (!data.storePhone || !data.advisor)) throw new Error("请填写门店联系电话和专属顾问。");
      } else if (action === "send-kit") data.kitTracking = $("serviceKitTracking").value.trim();
      else if (action === "send-watch") data.inboundTracking = $("serviceInboundTracking").value.trim();
      else if (action === "receive") {
        data.receivedImages = pendingReceivedImages === null ? item.receivedImages : pendingReceivedImages;
        if (!data.receivedImages || !data.receivedImages.length) throw new Error("请上传至少一张作品收件图片。");
      }
      else if (action === "finish-service") {
        data.quoteAmount = parseQuote($("serviceQuote").value, true);
        data.serviceNote = $("serviceNote").value.trim();
        data.serviceImages = pendingRepairImages === null ? item.serviceImages : pendingRepairImages;
        if (!data.serviceNote) throw new Error("请填写服务说明。");
        if (!data.serviceImages || !data.serviceImages.length) throw new Error("请上传至少一张售后完成图片。");
      } else if (action === "return-watch") {
        if (!$("servicePaymentConfirmed").checked) throw new Error("请先核实收到客户线下付款。");
        data.outboundTracking = $("serviceOutboundTracking").value.trim();
      } else if (action === "complete" && !$("serviceReceiptConfirmed").checked) throw new Error("请先与客户核实作品签收。");
      service.transition(item.id, apiAction, data, "admin");
      renderDetail(); renderMetrics(); toast("工单状态已更新");
    } catch (error) { errorAt("serviceActionError", error); }
  }
  var editFields = { salutation: "Salutation", lastName: "LastName", firstName: "FirstName", phone: "Phone", reference: "Reference", serial: "Serial", reason: "Reason", store: "Store", storePhone: "StorePhone", advisor: "Advisor", kitAddress: "KitAddress", returnAddress: "ReturnAddress", description: "Description", serviceNote: "Note", kitTracking: "KitTracking", inboundTracking: "InboundTracking", outboundTracking: "OutboundTracking" };
  function openEdit() {
    var item = selected();
    try { requireScope(item); } catch (error) { errorAt("serviceActionError", error); return; }
    editingId = item.id; editingVersion = item.revision || item.updated; pendingEditReceivedImages = null; pendingEditServiceImages = null; editImageReadVersion += 1; editImageReadPending = 0;
    Object.keys(editFields).forEach(function (key) { $("editService" + editFields[key]).value = item[key] === "—" ? "" : item[key] || ""; });
    if (!item.lastName && !item.firstName) $("editServiceLastName").value = String(item.customer || "").replace(/\s*(先生|女士)$/, "");
    $("editServiceQuote").value = item.quoteAmount == null ? "" : item.quoteAmount;
    $("editServiceReceivedImages").value = ""; $("editServiceImages").value = "";
    $("editServiceReceivedImagePreview").innerHTML = imageGrid(item.receivedImages);
    $("editServiceImagePreview").innerHTML = imageGrid(item.serviceImages);
    $("editServiceStore").disabled = role !== "ADMIN";
    $("serviceEditForm").querySelector('[type="submit"]').disabled = false;
    clearError("serviceEditError"); $("serviceEditDialog").showModal();
  }
  function saveEdit(event) {
    event.preventDefault(); clearError("serviceEditError");
    try {
      var item = service.getTicket(editingId); requireScope(item);
      if ((item.revision || item.updated) !== editingVersion) throw new Error("工单已在其他页面更新。请关闭并重新打开编辑窗口，避免覆盖最新信息。");
      var patch = {};
      Object.keys(editFields).forEach(function (key) { patch[key] = $("editService" + editFields[key]).value.trim(); });
      patch.customer = (patch.lastName + patch.firstName).trim() + " " + patch.salutation;
      ["lastName", "customer", "phone", "reference", "serial", "kitAddress", "returnAddress"].forEach(function (key) { if (!patch[key]) throw new Error("客户姓氏、联系电话、作品信息及两个地址均不能为空。"); });
      if (role !== "ADMIN") patch.store = item.store;
      patch.quoteAmount = parseQuote($("editServiceQuote").value, false);
      if (["payment", "return_sent", "completed"].includes(item.status) && patch.quoteAmount == null) throw new Error("已完成售后的工单需要保留服务报价。");
      if (pendingEditReceivedImages !== null) patch.receivedImages = pendingEditReceivedImages;
      if (pendingEditServiceImages !== null) patch.serviceImages = pendingEditServiceImages;
      service.updateTicket(item.id, patch, "admin");
      $("serviceEditDialog").close(); renderDetail(); updateStores(); toast("工单资料已保存");
    } catch (error) { errorAt("serviceEditError", error); }
  }
  function resetFilters() { $("serviceKeyword").value = ""; ["serviceQueryField", "serviceBrand", "serviceStatus"].forEach(function (id) { $(id).value = "ALL"; }); renderList(); }
  function exportRows() {
    var rows = [["工单号", "品牌", "客户", "手机号", "作品型号", "作品编号", "售后原因", "状态", "负责门店", "门店电话", "专属顾问", "套件物流", "寄出物流", "寄回物流", "报价", "更新时间"]];
    filtered().forEach(function (item) { rows.push([item.id, brandLabel(item.brand), customer(item), item.phone, item.reference, item.serial, item.reason, statusOf(item).label, item.store, item.storePhone, item.advisor, item.kitTracking, item.inboundTracking, item.outboundTracking, item.quoteAmount == null ? "" : item.quoteAmount, item.updated]); });
    var csv = "\ufeff" + rows.map(function (row) { return row.map(function (value) { var text = String(value == null ? "" : value); if (/^[=+@\-]/.test(text)) text = "'" + text; return '"' + text.replace(/"/g, '""') + '"'; }).join(","); }).join("\r\n");
    var url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })); var link = document.createElement("a"); link.href = url; link.download = "sowind-aftersales-" + new Date().toISOString().slice(0, 10) + ".csv"; link.click(); setTimeout(function () { URL.revokeObjectURL(url); }, 0);
  }
  Object.keys(statuses).forEach(function (key) { var option = document.createElement("option"); option.value = key; option.textContent = statuses[key].label; $("serviceStatus").appendChild(option); });
  service.reasons.forEach(function (reason) { var option = document.createElement("option"); option.value = reason; option.textContent = reason; $("editServiceReason").appendChild(option); });
  document.addEventListener("crm:navigate", function (event) { if (event.detail && event.detail.key === "services") showList(); });
  $("primaryNavigation").addEventListener("click", function (event) { var item = event.target.closest("[data-nav-key]"); if (item && item.dataset.navKey !== "services") { $("serviceView").classList.remove("is-active"); $("serviceDetailView").classList.remove("is-active"); } });
  $("serviceRows").addEventListener("click", function (event) { var row = event.target.closest("[data-service-id]"); if (row) showDetail(row.dataset.serviceId); });
  $("backToServices").addEventListener("click", showList);
  $("searchServices").addEventListener("click", renderList); $("resetServiceFilters").addEventListener("click", resetFilters);
  $("serviceKeyword").addEventListener("keydown", function (event) { if (event.key === "Enter") renderList(); });
  $("serviceRoleSwitch").addEventListener("click", function (event) { var button = event.target.closest("[data-service-role]"); if (!button) return; role = button.dataset.serviceRole; document.querySelectorAll("[data-service-role]").forEach(function (item) { item.classList.toggle("is-active", item === button); }); $("serviceWorkingStore").hidden = role === "ADMIN"; resetFilters(); });
  $("serviceWorkingStore").addEventListener("change", resetFilters);
  $("serviceActionControls").addEventListener("click", function (event) { var button = event.target.closest("[data-service-action]"); if (button) advance(button.dataset.serviceAction); });
  $("serviceActionControls").addEventListener("change", async function (event) {
    if (event.target.id === "serviceDecision") { $("serviceApprovalFields").hidden = event.target.value === "reject"; $("serviceRejectionField").hidden = event.target.value !== "reject"; }
    if (event.target.id === "serviceAssignStore") $("serviceStorePhone").value = event.target.value === "上海南京西路形象店" ? "021-62155167" : "";
    if (event.target.id === "serviceReceivedImages" || event.target.id === "serviceRepairImages") {
      var isReceived = event.target.id === "serviceReceivedImages";
      var version = ++imageReadVersion, button = $("serviceActionControls").querySelector("[data-service-action]"); button.disabled = true; clearError("serviceActionError");
      try {
        var images = await readImages(event.target.files); if (version !== imageReadVersion) return;
        if (isReceived) { pendingReceivedImages = images.length ? images : null; $("serviceReceivedPreview").innerHTML = imageGrid(pendingReceivedImages || selected().receivedImages); }
        else { pendingRepairImages = images.length ? images : null; $("serviceRepairPreview").innerHTML = imageGrid(pendingRepairImages || selected().serviceImages); }
      }
      catch (error) { if (version === imageReadVersion) { if (isReceived) pendingReceivedImages = null; else pendingRepairImages = null; event.target.value = ""; errorAt("serviceActionError", error); } }
      finally { if (version === imageReadVersion) button.disabled = false; }
    }
  });
  $("serviceDetailHeadActions").addEventListener("click", function (event) { if (event.target.closest("[data-service-edit]")) openEdit(); });
  $("serviceEditForm").addEventListener("submit", saveEdit);
  function closeEdit() { $("serviceEditDialog").close(); }
  $("closeServiceEdit").addEventListener("click", closeEdit);
  $("cancelServiceEdit").addEventListener("click", closeEdit);
  $("serviceEditDialog").addEventListener("close", function () { editImageReadVersion += 1; editImageReadPending = 0; });
  async function updateEditImages(event, type) {
    var button = $("serviceEditForm").querySelector('[type="submit"]'), version = editImageReadVersion, targetId = editingId;
    editImageReadPending += 1; button.disabled = true; clearError("serviceEditError");
    try {
      var images = await readImages(event.target.files), item = service.getTicket(editingId);
      if (version !== editImageReadVersion || targetId !== editingId || !item) return;
      if (type === "received") { pendingEditReceivedImages = images.length ? images : null; $("editServiceReceivedImagePreview").innerHTML = imageGrid(pendingEditReceivedImages || item.receivedImages); }
      else { pendingEditServiceImages = images.length ? images : null; $("editServiceImagePreview").innerHTML = imageGrid(pendingEditServiceImages || item.serviceImages); }
    }
    catch (error) { if (version === editImageReadVersion && targetId === editingId) { if (type === "received") pendingEditReceivedImages = null; else pendingEditServiceImages = null; event.target.value = ""; errorAt("serviceEditError", error); } }
    finally { if (version === editImageReadVersion && targetId === editingId) { editImageReadPending = Math.max(0, editImageReadPending - 1); button.disabled = editImageReadPending > 0; } }
  }
  $("editServiceReceivedImages").addEventListener("change", function (event) { updateEditImages(event, "received"); });
  $("editServiceImages").addEventListener("change", function (event) { updateEditImages(event, "service"); });
  $("serviceExportBtn").addEventListener("click", exportRows);
  document.addEventListener("click", function (event) { var target = event.target.closest("[data-service-image]"); if (!target) return; var image = imageCache[Number(target.dataset.serviceImage)]; if (!image) return; $("serviceImageTitle").textContent = image.name; $("serviceImageFull").src = image.dataUrl; $("serviceImageFull").alt = image.name; $("serviceImageDialog").showModal(); });
  $("closeServiceImage").addEventListener("click", function () { $("serviceImageDialog").close(); });
  service.subscribe(function () {
    renderMetrics();
    if ($("serviceView").classList.contains("is-active")) { updateStores(); renderList(); }
    if ($("serviceDetailView").classList.contains("is-active") && !$("serviceEditDialog").open) {
      var item = selected();
      if (!item || (item.revision || item.updated) !== renderedVersion) {
        if ($("serviceActionControls").contains(document.activeElement) && /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) {
          errorAt("serviceActionError", new Error("工单已在其他页面更新，请返回列表并重新打开详情后继续处理。当前输入已保留。"));
        } else renderDetail();
      }
    }
  });
  updateStores(); renderMetrics();
  window.SowindCRMAfterSales = Object.freeze({ showList: showList, showDetail: showDetail, getTickets: all, statusCatalog: statuses, serviceReasons: service.reasons });
}());
