(function (root) {
  "use strict";

  var STORAGE_KEY = "sowind.ui.locale.v1";
  var exact = Object.freeze({
    "申请已提交，待专属顾问联系": "Application submitted — awaiting advisor contact",
    "申请未通过": "Application not approved",
    "已分配门店，跟进中": "Store assigned — follow-up in progress",
    "专属服务套件已寄出": "Service kit shipped",
    "作品已寄出，待门店签收": "Timepiece shipped — awaiting store receipt",
    "门店已收件，检测及报价中": "Store received timepiece — inspection and quotation in progress",
    "维修配件订购中": "Repair parts on order",
    "维修中": "Repair in progress",
    "维修完成，待寄回": "Repair complete — awaiting return shipment",
    "作品已寄回，待您签收": "Timepiece returned — awaiting your receipt",
    "您已确认收货，服务完成": "Receipt confirmed — service complete",
    "售后服务已取消": "After-sales service cancelled",

    "会员": "Members", "线索": "Leads", "售后服务": "After-sales Service",
    "首页": "Home", "系列": "Collections", "门店": "Boutiques", "服务": "Service", "我的": "My Account",
    "主导航": "Main navigation", "返回": "Back", "搜索": "Search", "更多": "More", "返回首页": "Back to home",
    "我的作品": "My Timepieces", "返回会员列表": "Back to member list", "返回售后服务列表": "Back to after-sales list",
    "收起侧边栏": "Collapse sidebar", "展开侧边栏": "Expand sidebar",
    "中文": "Chinese", "英文": "English", "切换为英文": "Switch to English", "切换为中文": "Switch to Chinese",

    "售后预约记录": "Service Records", "查看全部": "View all", "查看详情": "View details",
    "进行中": "In progress", "已完成": "Completed", "已取消": "Cancelled", "已拒绝": "Not approved",
    "暂无预约": "No appointments", "去预约": "Book now", "暂无售后预约": "No after-sales appointments",
    "暂无进行中预约": "No appointments in progress", "暂无已完成预约": "No completed appointments", "暂无已取消预约": "No cancelled appointments",
    "你好，梁 先生": "Hello, Mr. Liang", "编辑资料": "Edit profile",
    "探索更多非凡时刻": "Discover more extraordinary moments", "立即关注": "Follow now",
    "客服咨询": "Customer Service", "随时欢迎您的垂询": "We are always here to help", "立即咨询": "Contact us",

    "售后服务": "After-sales Service", "常见问题": "Frequently Asked Questions", "了解售后服务": "Learn about after-sales service",
    "即刻探索": "Explore now", "探索系列": "Explore collections", "了解腕表养护": "Learn about watch care",
    "腕表保养": "Watch Servicing", "腕表养护": "Watch Care", "预约腕表养护": "Book a Watch Service",
    "建议每3至5年为腕表进行\n专业检修与养护": "We recommend professional inspection and servicing every 3 to 5 years",
    "建议每3到5年对腕表进行一次检修和保养\n即刻预约腕表顾问进行养护": "We recommend servicing your watch every 3 to 5 years. Book with a watch advisor now.",
    "匠艺无界 纵横时光": "Boundless Craftsmanship Across Time", "时空无间 纵贯海天": "Mastering Time Across Every Horizon",
    "历久弥新的设计传奇": "An Enduring Design Legend", "时序之力 蕴于腕间": "The Power of Time on Your Wrist",
    "均享有5年保修": "includes a 5-year warranty", "直播表 均享有5年保修": "Girard-Perregaux watches include a 5-year warranty",
    "雅典表 均享有5年保修": "Ulysse Nardin watches include a 5-year warranty",

    "预约售后服务": "Service Booking", "预约详情": "Appointment Details", "您已预约售后服务": "Your after-sales service is booked",
    "预约信息": "Appointment Information", "预约记录": "Appointment", "工单记录": "Service History",
    "填写快递单号": "Enter tracking number", "我已收到作品": "I have received my timepiece",
    "取消预约": "Cancel appointment", "修改预约": "Edit appointment", "返回服务记录": "Back to service records",
    "未找到该售后预约": "This after-sales appointment was not found", "暂无留言": "No message",
    "*专属服务套件的寄送地址": "* Service kit delivery address", "*作品的寄回地址": "* Timepiece return address",
    "填写您的快递单号": "Enter your tracking number", "快递单号": "Tracking number", "请输入快递单号": "Enter tracking number",
    "粘贴": "Paste", "提交": "Submit", "确认快递单号": "Confirm tracking number", "签收确认": "Confirm receipt",
    "确定": "Confirm", "服务图片": "Service Images", "快递单号已提交": "Tracking number submitted",
    "已确认签收，服务完成": "Receipt confirmed — service complete", "预约已取消": "Appointment cancelled",
    "取消后记录将保留在“已取消”中。如需售后服务，可重新提交申请。": "The record will remain under Cancelled. You can submit a new request if service is still required.",

    "认证我的作品": "Verify My Timepiece", "作品信息": "Timepiece Information", "作品编号": "Timepiece number",
    "请手动或扫码输入作品编号": "Enter or scan the timepiece number", "模拟扫码": "Simulate scan",
    "如何找到我的作品编号？": "Where can I find my timepiece number?", "作品编号位于腕表底盖或保修凭证上，请核对后输入。": "The timepiece number appears on the case back or warranty certificate. Please verify it before entering.",
    "上一步": "Previous", "下一步": "Next", "添加作品": "Add timepiece", "移除产品": "Remove timepiece",
    "已模拟识别作品编号": "Timepiece number detected (demo)", "暂无已认证作品": "No verified timepieces",

    "称谓*": "Title*", "姓氏*": "Last name*", "名字*": "First name*", "电话": "Phone", "手机号*": "Mobile number*",
    "先生": "Mr.", "女士": "Ms.", "授权手机号": "Use authorised mobile number", "已填入演示手机号": "Demo mobile number added",
    "产品*": "Product*", "添加产品": "Add timepiece", "作品型号*": "Model reference*", "作品编号*": "Timepiece number*",
    "作品照片*": "Timepiece photo*", "上传作品照片": "Upload timepiece photo", "保修卡号*": "Warranty card number*", "保修卡照片*": "Warranty card photos*",
    "上传保修卡正面照片": "Upload warranty card front", "上传保修卡反面照片": "Upload warranty card back", "正面": "Front", "反面": "Back", "到期日期*": "Expiry date*",
    "选择售后原因*": "Select service reason*",
    "留言和说明": "Message and details", "专属服务套件寄送地址*": "Service kit delivery address*",
    "作品寄回地址*": "Timepiece return address*", "与寄送地址相同": "Same as delivery address",
    "保存修改": "Save changes", "隐私政策与服务条款": "Privacy Policy and Service Terms",
    "售后服务预约信息说明": "After-sales appointment information", "同意并返回": "Agree and return",
    "您提供的作品信息、联系方式及收件地址用于售后申请、服务联系和作品寄送。": "Your timepiece details, contact information and addresses are used to process the service request, contact you and arrange delivery.",
    "服务项目、报价及预计周期以品牌服务中心检测后与您确认的结果为准。寄送作品前请按顾问指引使用妥善包装，并保留物流凭证。": "Service items, quotation and estimated timing are subject to inspection and confirmation by the brand service centre. Follow your advisor's packing instructions and retain the shipping receipt.",
    "本演示中的资料仅保存在您的浏览器中；正式服务条款以品牌公布的有效文本为准。": "Data in this prototype is stored only in your browser. The brand's published terms govern the official service.",
    "预约修改成功": "Appointment updated", "售后申请提交成功": "After-sales request submitted",
    "申请已提交，待专属顾问联系。您可在售后预约记录中查看进度。": "Your request has been submitted. You can follow its progress in your after-sales appointment records.",
    "返回我的": "Back to My Account", "查看详情": "View details",
    "我已阅读并同意": "I have read and agree to", "，并授权其按照相关政策处理我的个人信息。*": ", and authorise the processing of my personal information under the relevant policies.*",
    "售后单号：": "Service order no.: ",
    "更换电池": "Battery replacement", "全面保养服务": "Complete service", "部件遗失/损坏": "Missing or damaged parts",
    "功能失效": "Function not working", "腕表抛光/翻新": "Polishing / refinishing", "走时快": "Running fast",
    "走时慢": "Running slow", "走停": "Stops running", "腕表防水": "Water resistance",
    "万年历调整": "Perpetual calendar adjustment", "摔落/震撞": "Drop / impact", "消磁": "Demagnetisation", "其他问题": "Other issue",
    "服务报价：": "Service quotation: ", "查看图片": "View image", "作品收件图片": "Timepiece receipt images",
    "维修完成图片": "Repair completion images",

    "管理员视图": "Administrator view", "门店视图": "Boutique view", "工作视图": "Work view", "当前门店": "Current boutique",
    "导出当前结果": "Export current results", "工单总数": "Total service orders", "待管理员处理": "Awaiting administrator",
    "服务进行中": "Service in progress", "服务完成": "Service complete", "售后服务指标": "After-sales metrics",
    "查询字段": "Search field", "查询内容": "Search value", "全部字段": "All fields", "全部品牌": "All brands",
    "工单号": "Service order no.", "客户": "Customer", "手机号": "Mobile", "作品型号 / 编号": "Model / timepiece no.",
    "负责门店": "Boutique", "品牌": "Brand", "工单状态": "Service order status", "全部状态": "All statuses",
    "重置": "Reset", "查询": "Search", "售后工单": "After-sales Orders", "显示全部品牌工单": "Showing all brands",
    "工单": "Order", "作品": "Timepiece", "售后原因": "Reason", "状态": "Status", "更新时间": "Updated",
    "操作": "Actions", "暂无匹配的售后工单": "No matching after-sales orders", "无匹配结果": "No matching results",
    "工单详情": "Service Order Details", "售后流程": "After-sales workflow", "客户与作品": "Customer & Timepiece",
    "服务信息": "Service Information", "物流与报价": "Shipping & Quotation", "当前处理": "Current Action",
    "编辑工单": "Edit service order", "作品型号": "Model reference", "保修卡号": "Warranty card number", "到期日期": "Expiry date",
    "作品照片": "Timepiece photo", "保修卡正面照片": "Warranty card front", "保修卡反面照片": "Warranty card back", "专属套件寄送地址": "Service kit delivery address",
    "作品寄回地址": "Timepiece return address", "门店联系电话": "Boutique telephone", "专属顾问": "Dedicated advisor",
    "客户说明": "Customer notes", "门店服务说明（客户可见）": "Boutique service notes (customer visible)",
    "拒绝原因": "Rejection reason", "取消原因": "Cancellation reason", "专属服务套件": "Service kit",
    "客户寄出作品": "Customer shipment", "服务报价 / 付款": "Quotation / Payment", "作品寄回": "Return shipment",
    "尚未寄出": "Not shipped", "尚未录入": "Not entered", "尚未上传": "Not uploaded", "待门店检测后更新": "Pending inspection",
    "已确认付款": "Payment confirmed", "待确认付款": "Payment pending", "管理员": "Administrator",
    "审核结果": "Review result", "通过申请": "Approve request", "拒绝申请": "Reject request",
    "拒绝原因（客户可见）": "Rejection reason (customer visible)", "请说明申请被拒绝的原因": "Explain why the request was not approved",
    "确认审核结果": "Confirm review", "专属套件物流单号": "Service kit tracking number", "确认寄出套件": "Confirm kit shipment",
    "客户寄出作品物流单号": "Customer shipment tracking number", "请输入客户提供的快递单号": "Enter the customer's tracking number",
    "记录作品已发回": "Record customer shipment", "上传图片并确认收件": "Upload images and confirm receipt",
    "服务报价（元）": "Service quotation (CNY)", "请输入报价金额": "Enter quotation amount",
    "已与客户确认报价并核实收到付款": "Quotation agreed and payment received",
    "确认付款并订零件": "Confirm payment and order parts", "确认付款并开始维修": "Confirm payment and start repair",
    "零件已到货，开始维修": "Parts received — start repair", "服务说明（客户可见）": "Service notes (customer visible)",
    "填写已完成的服务内容": "Describe the completed service", "提交维修结果": "Submit repair result",
    "作品寄回物流单号": "Return shipment tracking number", "录入物流并确认寄回": "Enter tracking and confirm return",
    "已与客户核实作品签收": "Customer receipt confirmed", "确认客户已签收": "Confirm customer receipt",
    "服务已完成": "Service completed", "工单已结束": "Service order closed", "编辑售后工单": "Edit after-sales order",
    "保存更改": "Save changes", "关闭": "Close", "关闭图片": "Close image", "更改已保存": "Changes saved",

    "会员总数": "Total members", "双品牌会员": "Dual-brand members", "新增会员": "New member", "会员目录": "Member Directory",
    "营销选择覆盖": "Marketing opt-in coverage", "是": "Yes", "否": "No", "购表意向": "Purchase intent",
    "联系方式": "Contact", "品牌关系": "Brand relationship", "偏好系列": "Preferred collection", "腕表持有": "Watch ownership",
    "注册时间": "Registered", "没有找到匹配的会员": "No matching members found",
    "线索总数": "Total leads", "新增线索": "New lead", "线索目录": "Lead Directory", "线索编号": "Lead no.",
    "线索类型": "Lead type", "客户 / 联系人": "Customer / Contact", "产品 / 主题": "Product / Topic", "创建时间": "Created",
    "跟进人": "Owner", "HQ 同步": "HQ sync", "刷新状态": "Refresh status", "正在加载线索": "Loading leads",
    "线索加载失败": "Failed to load leads", "重试加载": "Retry", "暂无匹配的线索": "No matching leads",
    "清除查询": "Clear search", "全部注册字段": "All registration fields", "全部品牌": "All brands",
    "请输入查询内容": "Enter search value", "请输入所选字段的查询内容": "Enter search value",
    "导出": "Export", "批量导入": "Bulk import", "待同步": "Pending sync", "HQ 同步成功": "HQ sync successful",
    "同步异常": "Sync errors", "新建": "New", "未分配": "Unassigned", "同步成功": "Synced",
    "同步失败": "Sync failed", "未同步": "Not synced", "详情": "Details", "重试同步": "Retry sync",
    "手动同步": "Manual sync", "购买意向": "Purchase intent", "中国区 CRM 管理员": "China CRM Administrator",
    "GP 芝柏表": "GP Girard-Perregaux", "UN 雅典表": "UN Ulysse Nardin",
    "芝柏表": "Girard-Perregaux", "雅典表": "Ulysse Nardin",
    "上海南京西路形象店": "Shanghai West Nanjing Road Boutique",
    "北京王府中环精品店": "Beijing WF Central Boutique",
    "成都国际金融中心精品店": "Chengdu IFS Boutique",
    "深圳湾万象城精品店": "Shenzhen Bay MixC Boutique",
    "上海恒隆广场精品店": "Shanghai Plaza 66 Boutique", "北京国贸商城精品店": "Beijing China World Mall Boutique",
    "深圳万象城精品店": "Shenzhen MixC Boutique", "退出": "Sign out",
    "会员 / 会员详情": "Members / Member Details", "售后服务 / 工单详情": "After-sales Service / Order Details",
    "客户身份": "Customer Profile", "关联品牌": "Associated brands", "客户 创建时间": "Customer created",
    "品牌资料": "Brand Profile", "会员状态": "Membership status", "已注册": "Registered",
    "Customer 创建时间": "Customer created", "偏爱的系列": "Preferred collection", "线索状态": "Lead status",
    "国家 / 城市": "Country / City", "中国大陆 · 上海": "Mainland China · Shanghai", "中国大陆 · 北京": "Mainland China · Beijing",
    "是否拥有品牌腕表": "Owns a brand timepiece", "营销选择": "Marketing opt-in", "查看完整资料": "View full profile",
    "旅程": "Journey", "操作记录": "Activity log", "线索信息": "Lead Information", "来源渠道": "Source channel",
    "微信小程序": "WeChat Mini Program", "关联会员 ID": "Linked member ID", "客户信息": "Customer Information",
    "称谓": "Title", "姓": "Last name", "名": "First name", "电话号码": "Phone number", "国家 / 地区": "Country / Region",
    "中国大陆": "Mainland China", "中国香港": "Hong Kong, China", "上海": "Shanghai", "城市": "City",
    "通信语言": "Communication language", "简体中文": "Simplified Chinese", "繁体中文": "Traditional Chinese",
    "首选联系方式": "Preferred contact method", "微信": "WeChat", "购表意向信息": "Purchase Intent Information",
    "您是否拥有 GP 腕表": "Do you own a GP timepiece?", "您是否拥有 UN 腕表": "Do you own a UN timepiece?",
    "授权信息": "Consent Information", "已选择": "Opted in", "个人数据处理同意": "Personal data processing consent",
    "已同意": "Consented", "最近同步时间": "Last sync time", "系统": "System",
    "服务报价": "Service quotation", "门店服务说明": "Boutique service notes",
    "重新选择会替换收件节点图片；未选择则保留。": "Selecting new files replaces the receipt-stage images; leave empty to keep them.",
    "重新选择会替换维修完成节点图片；未选择则保留。": "Selecting new files replaces the repair-completion images; leave empty to keep them.",
    "重新选择会替换原照片；未选择则保留。": "Selecting a new file replaces the original photo; leave empty to keep it.",
    "该申请待管理员审核并分配门店。": "This request is awaiting administrator review and boutique assignment.",
    "审核通过后，门店名称、联系电话和专属顾问将显示在客户的工单记录中。": "After approval, the boutique, contact number and dedicated advisor will appear in the customer's service record.",
    "专属服务套件寄出后录入物流单号，客户可在工单记录中查看。": "Enter the tracking number after shipping the service kit; the customer can view it in the service record.",
    "客户可在预约信息页填写寄出作品的快递单号；收到客户通知后，也可在此代录。": "The customer can enter the shipment tracking number, or staff can record it here after receiving notice.",
    "核对客户寄出的作品和物流信息，上传收件凭证后确认收件。该图片会显示在“门店已收件，检测及报价中”节点。": "Verify the timepiece and shipment, then upload receipt evidence. These images appear at the inspection and quotation stage.",
    "先录入报价并确认客户已付款，再根据检测结果选择订购零件或直接开始维修。": "Enter the quotation and confirm payment, then either order parts or start the repair based on inspection.",
    "已确认报价与付款，正在等待订购零件。零件到货并核验无误后再开始维修。": "Quotation and payment are confirmed. Repair will start after the ordered parts arrive and are verified.",
    "维修完成后填写客户可见的服务说明，并上传维修完成图片。该图片与收件图片独立保存。": "After repair, add customer-visible service notes and upload completion images. These are stored separately from receipt images.",
    "作品维修已完成，录入寄回作品的快递单号。客户随后可在预约详情中确认签收。": "The repair is complete. Enter the return tracking number so the customer can confirm receipt.",
    "客户可在预约详情确认收到作品；收到客户确认后，也可在此代为登记。": "The customer can confirm receipt in the appointment details, or staff can record the confirmation here.",
    "申请已拒绝，原因已同步给客户。": "The request was not approved and the reason is visible to the customer.",
    "客户已取消预约，工单记录已保留。": "The customer cancelled the appointment; the service record is retained.",
    "客户已签收作品，售后服务已完成。": "The customer has received the timepiece and the service is complete.",
    "必传，最多4张，每张不超过600KB，合计不超过1.5MB。": "Required. Up to 4 images, 600 KB each and 1.5 MB total.",
    "必传，最多4张，每张不超过600KB，合计不超过1.5MB。该图片与收件图片分开保存。": "Required. Up to 4 images, 600 KB each and 1.5 MB total. Stored separately from receipt images.",
    "已核实历史工单的报价与付款": "Historical quotation and payment verified",
    "选择当前会员": "Select current members", "选择当前线索": "Select current leads",

    "我的腕表建议多久保养一次？": "How often should my watch be serviced?",
    "谁有资格为我的腕表提供保养服务？": "Who is authorised to service my watch?",
    "完整保养服务包含哪些项目 ？": "What does a complete service include?",
    "什么是防水性能？": "What does water resistance mean?",
    "我经常佩戴腕表游泳或潜水，多久应检测一次防水？": "How often should water resistance be tested if I swim or dive with my watch?",
    "官方维修是否提供保修？": "Is official servicing covered by a warranty?",
    "寄送腕表进行保养时，有哪些注意事项？": "What should I know before sending my watch for service?",
    "对于腕表的保养频率有什么建议？": "How often should a watch be serviced?",
    "腕表售后保养服务的指定机构是什么？": "Who is authorised to provide after-sales service?",
    "全面保养包含哪些内容？": "What is included in a complete service?",
    "维修保修服务是什么？": "What is the service warranty?",
    "关于腕表送修有哪些注意事项？": "What should I know before sending a watch for service?",
    "我有一块老款的雅典表时计，我很有兴趣了解它的相关情况。查询档案需要哪些信息呢？": "I own a vintage Ulysse Nardin timepiece. What information is needed for an archive search?",
    "我有一枚较老款的雅典表时计，我想把它送去保养，我该怎么做？": "How do I arrange service for a vintage Ulysse Nardin timepiece?",
    "如果我的时计失窃，如何进行声明？": "How do I report a stolen timepiece?",
    "雅典表时计": "Ulysse Nardin Timepieces",
    "您是否正在考虑购买或保养一枚芝柏表时计？": "Are you considering purchasing or servicing a Girard-Perregaux timepiece?",
    "您是否正在考虑购买或保养一枚雅典表时计？": "Are you considering purchasing or servicing a Ulysse Nardin timepiece?",
    "这里有一些常见问题的答案。": "Here are answers to some frequently asked questions.",
    "拆卸表链": "Removing the bracelet", "拆卸表壳": "Opening the case", "完全解拆表壳": "Complete case disassembly",
    "解拆机芯": "Movement disassembly", "在不同清洁池中清洗各种备件和零部件": "Cleaning components in dedicated baths",
    "零备件管控": "Component inspection", "更换零件": "Replacing components", "润滑": "Lubrication",
    "抛光零件": "Polishing", "重新组装机芯": "Movement reassembly", "重新组装表壳": "Case reassembly",
    "防水性能测试": "Water-resistance testing", "最终调节": "Final adjustment", "最终外观检查": "Final appearance inspection",
    "时计的日常保养": "Daily care of your timepiece"
  });

  var textSources = new WeakMap();
  var attributeSources = new WeakMap();
  var listeners = [];
  var applying = false;
  var scheduled = false;
  var locale = readLocale();
  var documentTitleSource = root.document ? root.document.title : "";

  function normalize(value) { return String(value || "").toLowerCase().indexOf("en") === 0 ? "en" : "zh-CN"; }
  function readLocale() {
    try { return normalize(root.localStorage.getItem(STORAGE_KEY)); }
    catch (_) { return "zh-CN"; }
  }
  function hasChinese(value) { return /[\u3400-\u9fff]/.test(value || ""); }
  function translateCore(value) {
    if (exact[value]) return exact[value];
    var match;
    if ((match = value.match(/^(\d+) 条结果$/))) return match[1] + " results";
    if ((match = value.match(/^显示 1–(\d+)，共 (\d+) 条工单$/))) return "Showing 1–" + match[1] + " of " + match[2] + " orders";
    if ((match = value.match(/^显示 1–(\d+)，共 (\d+) 位会员$/))) return "Showing 1–" + match[1] + " of " + match[2] + " members";
    if ((match = value.match(/^显示 1–(\d+)，共 (\d+) 条线索$/))) return "Showing 1–" + match[1] + " of " + match[2] + " leads";
    if ((match = value.match(/^当前门店：(.+)$/))) return "Current boutique: " + match[1];
    if ((match = value.match(/^作品编号 (.+)$/))) return "Timepiece no. " + match[1];
    if ((match = value.match(/^服务报价：(.+)$/))) return "Service quotation: " + match[1];
    if ((match = value.match(/^(芝柏表|雅典表)售后单号：\s*(.+)$/))) return (match[1] === "芝柏表" ? "Girard-Perregaux" : "Ulysse Nardin") + " service order no.: " + match[2];
    if ((match = value.match(/^(.+) · 创建于 (.+)$/))) return (exact[match[1]] || match[1]) + " · Created " + match[2];
    if ((match = value.match(/^购表意向 · (.+)$/))) return "Purchase intent · " + match[1];
    if ((match = value.match(/^(.+) · 客户$/))) return match[1] + " · Customer";
    if ((match = value.match(/^(.+) · 管理员$/))) return match[1] + " · Administrator";
    if ((match = value.match(/^(?:系统|System) · (.+)$/))) return "System · " + match[1];
    if ((match = value.match(/^查看图片 (.+)$/))) return "View image " + match[1];
    if ((match = value.match(/^请确认您作品寄回的快递单号为\s*(.+)$/))) return "Please confirm the tracking number for your timepiece shipment: " + match[1];
    if ((match = value.match(/^请确认您已收到作品。如果疑问可随时联系(.+)（(.+)）。$/))) return "Please confirm that you have received your timepiece. Contact " + match[1] + " (" + match[2] + ") if you have any questions.";
    if (value.indexOf("GP 芝柏表") >= 0 || value.indexOf("UN 雅典表") >= 0) {
      return value.replace(/GP 芝柏表/g, "GP Girard-Perregaux").replace(/UN 雅典表/g, "UN Ulysse Nardin");
    }
    return value;
  }
  function translate(value) {
    var raw = String(value == null ? "" : value);
    if (locale !== "en") return raw;
    var leading = (raw.match(/^\s*/) || [""])[0];
    var trailing = (raw.match(/\s*$/) || [""])[0];
    var core = raw.slice(leading.length, raw.length - trailing.length || raw.length);
    return leading + translateCore(core) + trailing;
  }
  function sourceForText(node) {
    var source = textSources.get(node);
    var current = node.nodeValue || "";
    if (source == null || (hasChinese(current) && current !== source)) { source = current; textSources.set(node, source); }
    return source;
  }
  function sourceForAttribute(element, name) {
    var sources = attributeSources.get(element);
    if (!sources) { sources = {}; attributeSources.set(element, sources); }
    var current = element.getAttribute(name) || "";
    if (sources[name] == null || (hasChinese(current) && current !== sources[name])) sources[name] = current;
    return sources[name];
  }
  function ignored(node) {
    var element = node.nodeType === 1 ? node : node.parentElement;
    return !element || element.closest("script,style,noscript,[data-i18n-ignore]");
  }
  function applyNode(node) {
    if (node.nodeType === 3) {
      if (ignored(node)) return;
      var source = sourceForText(node), next = locale === "en" ? translate(source) : source;
      if (node.nodeValue !== next) node.nodeValue = next;
      return;
    }
    if (node.nodeType !== 1 || ignored(node)) return;
    ["placeholder", "aria-label", "title"].forEach(function (name) {
      if (!node.hasAttribute(name)) return;
      var source = sourceForAttribute(node, name), next = locale === "en" ? translate(source) : source;
      if (node.getAttribute(name) !== next) node.setAttribute(name, next);
    });
  }
  function apply(rootNode) {
    if (!root.document || applying) return;
    applying = true;
    try {
      applyNode(rootNode || root.document.documentElement);
      var walker = root.document.createTreeWalker(rootNode || root.document.documentElement, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) applyNode(walker.currentNode);
      root.document.documentElement.lang = locale === "en" ? "en" : "zh-CN";
      root.document.querySelectorAll("[data-sowind-language-toggle]").forEach(function (button) {
        button.textContent = locale === "en" ? "中" : "EN";
        button.setAttribute("aria-label", locale === "en" ? "Switch to Chinese" : "切换为英文");
        button.setAttribute("title", locale === "en" ? "Switch to Chinese" : "切换为英文");
      });
      root.document.title = locale === "en"
        ? documentTitleSource.replace("芝柏表", "Girard-Perregaux").replace("雅典表", "Ulysse Nardin").replace("售后服务", "After-sales Service")
        : documentTitleSource;
    } finally { applying = false; }
  }
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    root.requestAnimationFrame(function () { scheduled = false; apply(root.document.documentElement); });
  }
  function setLocale(next) {
    next = normalize(next);
    if (next === locale) { apply(root.document && root.document.documentElement); return; }
    locale = next;
    try { root.localStorage.setItem(STORAGE_KEY, locale); } catch (_) { /* The UI can still switch for this session. */ }
    apply(root.document && root.document.documentElement);
    listeners.slice().forEach(function (listener) { listener(locale); });
    root.dispatchEvent(new CustomEvent("sowind:locale-changed", { detail: { locale: locale } }));
  }
  function subscribe(listener) { listeners.push(listener); return function () { listeners = listeners.filter(function (item) { return item !== listener; }); }; }

  if (root.document) {
    if (root.document.readyState === "loading") root.document.addEventListener("DOMContentLoaded", function () { apply(root.document.documentElement); });
    else apply(root.document.documentElement);
    new MutationObserver(function (mutations) {
      if (applying) return;
      if (mutations.some(function (mutation) { return mutation.type === "childList" || mutation.type === "characterData" || mutation.type === "attributes"; })) schedule();
    }).observe(root.document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["placeholder", "aria-label", "title"] });
    root.document.addEventListener("click", function (event) {
      if (event.target.closest("[data-sowind-language-toggle]")) setLocale(locale === "en" ? "zh-CN" : "en");
    });
  }
  root.addEventListener("storage", function (event) { if (event.key === STORAGE_KEY) { locale = readLocale(); apply(root.document && root.document.documentElement); listeners.slice().forEach(function (listener) { listener(locale); }); } });

  root.SowindI18n = Object.freeze({
    getLocale: function () { return locale; },
    setLocale: setLocale,
    toggle: function () { setLocale(locale === "en" ? "zh-CN" : "en"); },
    translate: function (value, requestedLocale) { var previous = locale; if (requestedLocale) locale = normalize(requestedLocale); var result = translate(value); locale = previous; return result; },
    apply: apply,
    subscribe: subscribe,
    storageKey: STORAGE_KEY
  });
})(window);
