(function (root) {
  'use strict';
  const KEY = 'sowind.aftersales.v5';
  const PREVIOUS = 'sowind.aftersales.v4';
  const OLDER = 'sowind.aftersales.v3';
  const LEGACY = 'sowind.crm.v1.13.3.aftersales';
  const EVENT = 'sowind:services-changed';
  const statusCatalog = {
    submitted: {label:'申请已提交，待专属顾问联系',labelEn:'Application submitted — awaiting advisor contact',tone:'pending',order:0},
    rejected: {label:'申请未通过',labelEn:'Application not approved',tone:'rejected',order:1},
    assigned: {label:'已分配门店，跟进中',labelEn:'Store assigned — follow-up in progress',tone:'active',order:2},
    kit_sent: {label:'专属服务套件已寄出',labelEn:'Service kit shipped',tone:'active',order:3},
    customer_sent: {label:'作品已寄出，待门店签收',labelEn:'Timepiece shipped — awaiting store receipt',tone:'active',order:4},
    received: {label:'门店已收件，检测及报价中',labelEn:'Store received timepiece — inspection and quotation in progress',tone:'quote',order:5},
    parts_ordering: {label:'维修配件订购中',labelEn:'Repair parts on order',tone:'parts',order:6},
    repairing: {label:'维修中',labelEn:'Repair in progress',tone:'repairing',order:7},
    repair_completed: {label:'维修完成，待寄回',labelEn:'Repair complete — awaiting return shipment',tone:'ready',order:8},
    return_sent: {label:'作品已寄回，待您签收',labelEn:'Timepiece returned — awaiting your receipt',tone:'active',order:9},
    completed: {label:'您已确认收货，服务完成',labelEn:'Receipt confirmed — service complete',tone:'complete',order:10},
    cancelled: {label:'售后服务已取消',labelEn:'After-sales service cancelled',tone:'cancelled',order:11}
  };
  const reasons = ['更换电池','全面保养服务','部件遗失/损坏','功能失效','腕表抛光/翻新','走时快','走时慢','走停','腕表防水','万年历调整','摔落/震撞','消磁','其他问题'];
  const clone = value => JSON.parse(JSON.stringify(value));
  const now = () => new Date().toLocaleString('sv-SE',{timeZone:'Asia/Shanghai'}).slice(0,19);
  const uid = () => root.crypto?.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2);
  const clean = value => String(value ?? '').trim();
  const randomDigits = () => {
    if (root.crypto && typeof root.crypto.getRandomValues === 'function') {
      const values = new Uint32Array(10);
      root.crypto.getRandomValues(values);
      return Array.from(values, value => value % 10).join('');
    }
    return Array.from({length:10}, () => Math.floor(Math.random() * 10)).join('');
  };
  function nextTicketId(brand, existing=[]) {
    const used = existing instanceof Set ? existing : new Set(existing.map(item => item.id));
    for (let attempt=0; attempt<100; attempt+=1) {
      const id = brand+'AS'+randomDigits();
      if (!used.has(id)) return id;
    }
    fail('无法生成唯一工单号，请重试');
  }
  const canEdit = ticket => ['submitted','assigned','kit_sent'].includes(ticket.status);
  const canCancel = canEdit;
  function fail(message) { throw new Error(message); }
  function amount(value) {
    if (value === '' || value == null) return null;
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0 || n > 10000000 || Math.abs(n * 100 - Math.round(n * 100)) > 0.00001) fail('请输入有效报价金额（0–10000000，最多两位小数）');
    return n;
  }
  function pictures(value) {
    if (!Array.isArray(value) || value.length > 6) fail('每个节点最多选择6张图片');
    let size = 0;
    return value.map(item => {
      if (!item || !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/.test(item.dataUrl || '')) fail('请选择有效的 PNG、JPEG 或 WebP 图片');
      size += item.dataUrl.length;
      if (size > 2000000) fail('图片总大小过大，请压缩后重试（合计最多1.5MB）');
      return {id:clean(item.id)||uid(),name:clean(item.name)||'服务图片',dataUrl:item.dataUrl};
    });
  }
  function validate(item) {
    if (!['GP','UN'].includes(item.brand)) fail('请选择有效品牌');
    for (const [key,label] of [['customer','客户姓名'],['phone','联系电话'],['reference','作品型号'],['serial','作品编号'],['kitAddress','套件寄送地址'],['returnAddress','作品寄回地址']]) {
      if (!clean(item[key])) fail('请填写'+label);
      if (clean(item[key]).length > 600) fail(label+'内容过长');
    }
    if (!/^[+\d][\d ()-]{5,24}$/.test(item.phone)) fail('请填写有效联系电话');
    if (!reasons.includes(item.reason)) fail('请选择售后原因');
    item.quoteAmount = amount(item.quoteAmount);
    item.quote = item.quoteAmount == null ? '—' : '¥'+item.quoteAmount.toLocaleString('zh-CN');
    item.receivedImages = pictures(item.receivedImages || []);
    item.serviceImages = pictures(item.serviceImages || []);
  }
  function statusLabel(status, locale='zh-CN') {
    const entry=statusCatalog[status];
    if(!entry)return status;
    return String(locale).toLowerCase().startsWith('en')?entry.labelEn:entry.label;
  }
  function message(item, status, locale='zh-CN') {
    const store = item.store + (item.storePhone ? '（'+item.storePhone+'）' : '');
    if(String(locale).toLowerCase().startsWith('en')){
      const englishStore=item.store+(item.storePhone?' ('+item.storePhone+')':'');
      const english={
        submitted:'Your after-sales request has been submitted. Please wait for your dedicated advisor to contact you.',
        assigned:'Your request has been assigned to '+englishStore+'. A boutique advisor will contact you.',
        kit_sent:'Your service kit has been shipped. Tracking number: '+item.kitTracking+'. Please contact '+englishStore+' if you have any questions.',
        customer_sent:'Your timepiece has been shipped to the boutique. Tracking number: '+item.inboundTracking+'. We will update the order after receipt.',
        received:'The boutique has received your timepiece and is inspecting it. Please wait for '+englishStore+' to confirm the quotation and payment.',
        parts_ordering:'Your quotation and payment are confirmed. Required repair parts are being ordered. Service quotation: '+item.quote+'.',
        repairing:'Your quotation and payment are confirmed, and your timepiece is being repaired. Please contact '+englishStore+' if you have any questions. Service quotation: '+item.quote+'.',
        repair_completed:'The repair is complete and the boutique will arrange return shipment.'+(item.serviceNote?'\nService notes: '+item.serviceNote:'')+(item.quoteAmount!=null?'\nService quotation: '+item.quote:''),
        return_sent:'Your timepiece has been returned to your appointment address. Tracking number: '+item.outboundTracking+'.',
        completed:'You have confirmed receipt of your timepiece. The after-sales service is complete.',
        rejected:'Your request was not approved: '+item.rejectionReason,
        cancelled:'Your after-sales service has been cancelled. '+(item.cancelReason||'')
      };
      return english[status];
    }
    const messages = {
      submitted:'尊敬客户，您已提交售后服务申请，请耐心等待专属顾问与您联系',
      assigned:'尊敬客户，您的售后服务将由 '+store+' 继续跟进，请等待门店顾问联系您',
      kit_sent:'尊敬客户，您的专属配件已从门店寄送，快递单号：'+item.kitTracking+'。如有疑问请联系 '+store+'。',
      customer_sent:'尊敬客户，您的作品已发回，快递单号'+item.inboundTracking+'。待我们收到您的作品后，将竭诚为您服务。',
      received:'尊敬客户，门店已收到您的作品，正在检查并准备报价。请等待 '+store+' 与您确认报价及付款。如您有疑问，可联系负责门店。',
      parts_ordering:'尊敬客户，您的服务报价及付款已确认。由于维修需要相关零件，门店正在为您订购，零件到货后将安排维修。服务报价：'+item.quote+'。',
      repairing:'尊敬客户，您的服务报价及付款已确认，作品正在维修中。维修过程预计需要一定时间，如有疑问可联系 '+store+'。服务报价：'+item.quote+'。',
      repair_completed:'尊敬客户，您的作品已完成维修，门店将按照预约信息中的地址安排寄回。'+(item.serviceNote?'\n服务说明：'+item.serviceNote:'')+(item.quoteAmount!=null?'\n服务报价：'+item.quote:''),
      return_sent:'尊敬客户，您的作品已按照预约信息的地址寄回，快递单号：'+item.outboundTracking+'。感谢您的信赖。',
      completed:'您已确认收到作品，售后服务已完成。感谢您的信赖。',
      rejected:'您的申请未通过审核：'+item.rejectionReason,
      cancelled:'您的售后预约已取消。'+(item.cancelReason || '')
    };
    return messages[status];
  }
  function log(item, actor, title, note) {
    item.updated = now();
    item.revision = uid();
    item.history.push({id:uid(),status:item.status,title:title||statusCatalog[item.status].label,time:item.updated,note:note||message(item,item.status),actor});
  }
  function newTicket(input) {
    const time = now(), brand = input.brand;
    return {id:brand+'AS'+randomDigits(),brand,customerId:input.customerId||'demo-'+brand,customer:'',salutation:'先生',lastName:'',firstName:'',phone:'',reference:'',serial:'',reason:'',description:'',kitAddress:'',returnAddress:'',store:'未分配',storePhone:'',advisor:'未分配',kitTracking:'',inboundTracking:'',outboundTracking:'',quoteAmount:null,quote:'—',paymentConfirmed:false,serviceNote:'',receivedImages:[],serviceImages:[],rejectionReason:'',cancelReason:'',...input,status:'submitted',created:time,updated:time,history:[]};
  }
  function seed() {
    return ['GP','UN'].map(brand=>{
      const item = newTicket({brand,customer:'梁桐 先生',lastName:'梁',firstName:'桐',phone:'18717822727',reference:brand==='GP'?'81006-11-2010-1cm':'2405-500-2A/3A',serial:brand+'17910001',reason:'腕表抛光/翻新',description:'腕表买回来几年了，链条有划痕需要抛光下',kitAddress:'上海市长宁区愚园路1108号创邑园区2号2楼',returnAddress:'上海市长宁区愚园路1108号创邑园区2号2楼'});
      item.id=brand+'AS1234567890'; item.created='2026-09-01 09:01:00'; item.updated=item.created;
      item.history=[{id:uid(),status:'submitted',title:statusCatalog.submitted.label,time:item.created,note:message(item,'submitted'),actor:'customer'}];
      return item;
    });
  }
  const migratedStatus = status => status === 'payment' ? 'repair_completed' : status;
  const oldStatusLabels = {received:'作品已收到，待售后',payment:'作品已完成售后，待付款'};
  function migrate(items) {
    const used = new Set();
    return items.filter(item=>item && statusCatalog[migratedStatus(item.status)] && ['GP','UN'].includes(item.brand)).map(old=>{
      const status=migratedStatus(old.status);
      const item={...newTicket(old),status,created:old.created,updated:old.updated,history:old.history||[],customerId:old.customerId||(old.customer==='梁桐 先生'?'demo-'+old.brand:'legacy-'+old.id),paymentConfirmed:old.paymentConfirmed===true};
      const oldId=clean(old.id), pattern=new RegExp('^'+item.brand+'AS\\d{10}$');
      item.id=pattern.test(oldId)&&!used.has(oldId)?oldId:nextTicketId(item.brand,used);used.add(item.id);
      const numeric=Number(String(old.quote||'').replace(/[^0-9.]/g,''));
      item.quoteAmount=old.quoteAmount ?? (old.quote && old.quote!=='—' && Number.isFinite(numeric)?numeric:null);
      item.receivedImages=(old.receivedImages||[]).filter(v=>v && typeof v==='object' && v.dataUrl);
      item.serviceImages=(old.serviceImages||[]).filter(v=>v && typeof v==='object' && v.dataUrl);
      item.history=item.history.map(h=>{
        const oldStatus=h.status||old.status,mapped=migratedStatus(oldStatus);
        const replaceTitle=!h.title||h.title===oldStatusLabels[oldStatus];
        return {...h,id:h.id||uid(),actor:h.actor||'admin',status:mapped,title:replaceTitle?statusCatalog[mapped].label:h.title};
      });
      return item;
    });
  }
  function write(items) {
    try { root.localStorage.setItem(KEY,JSON.stringify({version:5,tickets:items})); }
    catch (_) { fail('无法保存工单：浏览器存储不可用或空间不足，请减少图片后重试'); }
    root.dispatchEvent(new Event(EVENT));
  }
  function read() {
    let saved;
    try {saved=root.localStorage.getItem(KEY);} catch (_) {fail('无法读取浏览器中的工单数据');}
    if(saved!=null){
      let parsed; try {parsed=JSON.parse(saved);} catch (_) {fail('工单数据损坏，请先备份浏览器数据后联系管理员');}
      if(parsed.version!==5 || !Array.isArray(parsed.tickets)) fail('工单数据版本不兼容');
      return parsed.tickets;
    }
    let previous=[];
    try {const old=JSON.parse(root.localStorage.getItem(PREVIOUS));if(old&&old.version===4&&Array.isArray(old.tickets))previous=migrate(old.tickets);} catch (_) { /* Keep previous data untouched; initialize this version separately. */ }
    let older=[];
    try {const old=JSON.parse(root.localStorage.getItem(OLDER));if(old&&old.version===3&&Array.isArray(old.tickets))older=migrate(old.tickets);} catch (_) { /* Keep previous data untouched; initialize this version separately. */ }
    let legacy=[];
    try {const old=JSON.parse(root.localStorage.getItem(LEGACY));if(Array.isArray(old))legacy=migrate(old);} catch (_) { /* Keep old data untouched; initialize this version separately. */ }
    const items=previous.length?previous:older.length?older:legacy.length?legacy:seed();
    for(const sample of seed())if(!items.some(t=>t.customerId===sample.customerId))items.push(sample);
    write(items);return items;
  }
  function getTicket(id) {return clone(read().find(item=>item.id===id)||null);}
  function getTickets(filter={}) {return clone(read().filter(item=>(!filter.brand||item.brand===filter.brand)&&(!filter.customerId||item.customerId===filter.customerId)).sort((a,b)=>b.created.localeCompare(a.created)));}
  function createTicket(input) {
    const items=read(),item=newTicket(input);item.id=nextTicketId(item.brand,items);validateIdentity(item);validate(item);log(item,'customer');items.unshift(item);write(items);return clone(item);
  }
  function validateIdentity(item) {
    if(!['先生','女士'].includes(item.salutation))fail('请选择称谓');
    if(!clean(item.lastName)||!clean(item.firstName))fail('请填写姓氏和名字');
    item.customer=clean(item.lastName)+clean(item.firstName)+' '+item.salutation;
  }
  const customerFields=['customer','salutation','lastName','firstName','phone','reference','serial','reason','description','kitAddress','returnAddress'];
  const adminFields=[...customerFields,'store','storePhone','advisor','kitTracking','inboundTracking','outboundTracking','quoteAmount','serviceNote','receivedImages','serviceImages'];
  function updateTicket(id,patch,actor='admin') {
    const items=read(),item=items.find(t=>t.id===id);if(!item)fail('工单不存在');
    const before=clone(item);
    if(actor==='customer'&&!canEdit(item))fail('当前阶段已无法修改预约，请联系负责门店');
    const fields=actor==='customer'?customerFields:adminFields;
    for(const key of Object.keys(patch)){if(!fields.includes(key))fail('不允许修改字段：'+key);item[key]=key==='quoteAmount'||key==='receivedImages'||key==='serviceImages'?patch[key]:clean(patch[key]);}
    if(actor==='customer')validateIdentity(item);
    validate(item);
    const labels={kitTracking:'专属套件快递单号',inboundTracking:'客户寄出作品快递单号',outboundTracking:'作品寄回快递单号',serviceNote:'服务说明',quoteAmount:'服务报价',store:'负责门店',storePhone:'门店电话',advisor:'专属顾问'};
    const changes=Object.keys(labels).filter(key=>before[key]!==item[key]).map(key=>labels[key]+'：'+(key==='quoteAmount'?item.quote:item[key]||'未填写'));
    log(item,actor,actor==='customer'?'客户修改预约':'管理员编辑工单',changes.length?changes.join('\n'):'预约及服务资料已更新');write(items);return clone(item);
  }
  function transition(id,action,data={},actor='admin') {
    const items=read(),item=items.find(t=>t.id===id);if(!item)fail('工单不存在');
    const transitions={approve:['submitted','assigned'],reject:['submitted','rejected'],'send-kit':['assigned','kit_sent'],'send-watch':['kit_sent','customer_sent'],receive:['customer_sent','received'],'start-parts':['received','parts_ordering'],'start-repair':['received','repairing'],'parts-arrived':['parts_ordering','repairing'],'finish-repair':['repairing','repair_completed'],'return-watch':['repair_completed','return_sent'],complete:['return_sent','completed']};
    if(actor==='customer'&&!['send-watch','complete','cancel'].includes(action))fail('当前操作仅供管理员处理');
    if(action==='cancel'){if(!canCancel(item))fail('当前阶段无法取消预约，请联系负责门店');item.cancelReason=clean(data.cancelReason);item.status='cancelled';}
    else {
      const next=transitions[action];if(!next||item.status!==next[0])fail('工单状态已变化，请刷新后重试');
      if(action==='approve'){
        for(const key of ['store','storePhone','advisor']){if(!clean(data[key])||clean(data[key])==='未分配')fail('请填写门店、门店电话和负责顾问');item[key]=clean(data[key]);}
      }
      if(action==='reject'){if(!clean(data.rejectionReason))fail('请填写拒绝原因');item.rejectionReason=clean(data.rejectionReason);}
      const logistics={'send-kit':'kitTracking','send-watch':'inboundTracking','return-watch':'outboundTracking'};
      if(logistics[action]){const field=logistics[action],tracking=clean(data[field]);if(!/^[A-Za-z0-9-]{6,40}$/.test(tracking))fail('请输入6–40位有效快递单号（字母、数字或横线）');item[field]=tracking;}
      if(action==='receive'){
        item.receivedImages=pictures(data.receivedImages||[]);if(!item.receivedImages.length)fail('请上传至少一张作品收件图片');
      }
      if(action==='start-parts'||action==='start-repair'){
        item.quoteAmount=amount(data.quoteAmount);if(item.quoteAmount==null)fail('请填写服务报价');
        if(data.paymentConfirmed!==true)fail('请确认客户已完成报价及付款');
        item.paymentConfirmed=true;
      }
      if(action==='finish-repair'){
        item.serviceNote=clean(data.serviceNote);if(!item.serviceNote)fail('请填写服务说明');
        item.serviceImages=pictures(data.serviceImages||[]);if(!item.serviceImages.length)fail('请上传至少一张维修完成图片');
      }
      if(action==='return-watch'&&item.paymentConfirmed!==true){
        if(data.paymentConfirmed!==true)fail('请确认客户已完成报价及付款');
        item.paymentConfirmed=true;
      }
      item.status=next[1];
    }
    validate(item);log(item,actor);write(items);return clone(item);
  }
  function subscribe(fn) {
    const storage=e=>{if(e.key===KEY||e.key===null)fn();};
    root.addEventListener('storage',storage);root.addEventListener(EVENT,fn);
    return ()=>{root.removeEventListener('storage',storage);root.removeEventListener(EVENT,fn);};
  }
  root.SowindService=Object.freeze({getTickets,getTicket,createTicket,updateTicket,transition,subscribe,statusCatalog:clone(statusCatalog),statusLabel,message,reasons:[...reasons],canEdit,canCancel});
})(window);
