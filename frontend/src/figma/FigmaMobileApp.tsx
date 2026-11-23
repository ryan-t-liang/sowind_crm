import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  CircleUserRound,
  Headphones,
  Home,
  ImagePlus,
  MapPin,
  Menu,
  PackageCheck,
  Search,
  ScanLine,
  ShieldCheck,
  Store,
  Watch,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import "./figma-mobile.css";
import "./figma-mobile-additions.css";

export type FigmaBrand = "GP" | "UN";
type Page =
  | "home"
  | "service"
  | "aftersales"
  | "apply"
  | "account"
  | "records"
  | "record"
  | "works"
  | "faq"
  | "care";

const stageLabels = [
  "申请成功，待专属顾问与您联系",
  "已拒绝",
  "门店跟进中",
  "专属配件已寄送",
  "作品已发回",
  "作品已收到，待售后",
  "作品已完成售后，待付款",
  "作品已寄回，待签收",
  "服务完成",
];

const serviceReasons = [
  "更换电池", "全面保养服务", "部件遗失/损坏", "功能失效", "腕表抛光/翻新",
  "走时快", "走时慢", "走停", "腕表防水", "万年历调整", "摔落/震撞", "消磁", "其他问题",
];

const brandConfig = {
  GP: {
    chinese: "芝柏表",
    english: "GIRARD-PERREGAUX",
    accent: "#a58a6c",
    reference: "81006-11-2010-1cm",
    home: "./figma/gp-home.png",
    service: "./figma/gp-service-hero.png",
    watchmaker: "./figma/gp-watchmaker.png",
    account: "./figma/gp-account-hero.png",
    detail: "./figma/gp-detail-hero.png",
    logo: "./figma/gp-logo-white.png",
    product: "Laureato 桂冠系列",
    serviceLine: "直播表 均享有5年保修",
    serviceTitle: "匠艺无界 纵横时光",
  },
  UN: {
    chinese: "雅典表",
    english: "ULYSSE NARDIN",
    accent: "#000000",
    reference: "2405-500-2a-3a",
    home: "./figma/un-home.png",
    service: "./figma/un-service-hero.png",
    watchmaker: "./figma/un-watchmaker.jpg",
    account: "./figma/un-account-hero.jpg",
    detail: "./figma/un-detail-hero.png",
    logo: "./figma/un-logo.png",
    product: "Freak 奇想系列",
    serviceLine: "雅典表 均享有5年保修",
    serviceTitle: "时空无间 纵贯海天",
  },
} as const;

function usePage() {
  const read = (): Page => {
    const value = window.location.hash.replace(/^#\/?/, "") as Page;
    return value || "service";
  };
  const [page, setPage] = useState<Page>(read);
  useEffect(() => {
    const onHash = () => setPage(read());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const go = (next: Page) => {
    window.location.hash = `/${next}`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return { page, go };
}

function BrandMark({ brand, dark = false }: { brand: FigmaBrand; dark?: boolean }) {
  const cfg = brandConfig[brand];
  if (brand === "GP")
    return (
      <img
        className={`fm-brand-image ${dark ? "is-dark" : ""}`}
        src={cfg.logo}
        alt="GIRARD-PERREGAUX"
      />
    );
  return (
    <img
      className={`fm-brand-image fm-un-logo ${dark ? "is-dark" : ""}`}
      src={cfg.logo}
      alt="ULYSSE NARDIN"
    />
  );
}

function StatusBar({ light = false }: { light?: boolean }) {
  return (
    <div className={`fm-statusbar ${light ? "is-light" : ""}`}>
      <strong>9:41</strong>
      <span>▮▮▮ ⌁ ▰</span>
    </div>
  );
}

function MiniHeader({
  brand,
  back,
  title,
  light = false,
}: {
  brand: FigmaBrand;
  back?: () => void;
  title?: string;
  light?: boolean;
}) {
  return (
    <header className={`fm-mini-header ${light ? "is-light" : ""}`}>
      <div className="fm-mini-pill">
        {back ? (
          <button aria-label="返回" onClick={back}>
            <ArrowLeft />
          </button>
        ) : (
          <button aria-label="搜索">
            <Search />
          </button>
        )}
        <i />
        <button aria-label="作品">
          <Watch />
        </button>
        <i />
        <button aria-label="门店">
          <MapPin />
        </button>
      </div>
      {title ? <span className="fm-header-title">{title}</span> : back ? <span /> : <BrandMark brand={brand} />}
      <div className="fm-mini-pill fm-mini-right">
        <button aria-label="更多">
          <Menu />
        </button>
        <i />
        <button aria-label="关闭">
          <CircleUserRound />
        </button>
      </div>
    </header>
  );
}

function BottomNav({ brand, page, go }: { brand: FigmaBrand; page: Page; go: (p: Page) => void }) {
  const items: Array<[Page, string, typeof Home]> = [
    ["home", "首页", Home],
    ["home", "系列", Search],
    ["home", "门店", Store],
    ["service", "服务", PackageCheck],
    ["account", "我的", CircleUserRound],
  ];
  return (
    <nav className="fm-bottom-nav" aria-label="主导航">
      {items.map(([target, label, Icon], index) => {
        const active = label === "服务" ? ["service", "aftersales", "faq", "care"].includes(page) : label === "我的" ? ["account", "records", "record", "works"].includes(page) : page === target && index === 0;
        return (
          <button key={`${label}-${index}`} className={active ? "is-active" : ""} onClick={() => go(target)}>
            {index === 0 ? <span className="fm-nav-monogram">{brand}</span> : <Icon />}
            <span>{label}</span>
          </button>
        );
      })}
      <div className="fm-home-indicator" />
    </nav>
  );
}

function ServiceLanding({ brand, go }: { brand: FigmaBrand; go: (p: Page) => void }) {
  const cfg = brandConfig[brand];
  return (
    <section className="fm-service-landing" style={{ backgroundImage: `url(${cfg.service})` }}>
      <StatusBar light />
      <MiniHeader brand={brand} light />
      <div className="fm-service-shade" />
      <div className="fm-service-copy">
        <p>{cfg.serviceLine}</p>
        <h1>{cfg.serviceTitle}</h1>
        <Button variant="outline" onClick={() => go("aftersales")}>售后服务</Button>
        <button className="fm-link-light" onClick={() => go("faq")}>常见问题</button>
      </div>
      <BottomNav brand={brand} page="service" go={go} />
    </section>
  );
}

function FlowStrip() {
  return (
    <div className="fm-flow" aria-label="售后服务流程">
      {["提交申请", "顾问联系", "专业养护", "安心送回"].map((label, i) => (
        <div key={label}>
          <span>{String(i + 1).padStart(2, "0")}</span>
          <p>{label}</p>
        </div>
      ))}
    </div>
  );
}

function Aftersales({ brand, go }: { brand: FigmaBrand; go: (p: Page) => void }) {
  const cfg = brandConfig[brand];
  const prototypeEmail = brand === "GP" ? "clientservice.cn@girard-perregaux.com" : "clientservice.cn@ulysse-nardin.com";
  return (
    <section className={`fm-paper fm-aftersales fm-${brand.toLowerCase()}`}>
      <StatusBar />
      <MiniHeader brand={brand} back={() => go("service")} />
      <div className="fm-aftersales-inner">
        <BrandMark brand={brand} dark />
        {brand === "UN" && <p className="fm-brand-claim">雅 典 表 · 生 为 不 同</p>}
        <div className="fm-watchmaker-wrap">
          <button aria-label="上一张">‹</button>
          <img src={cfg.watchmaker} alt={`${cfg.chinese}制表师保养腕表`} />
          <button aria-label="下一张">›</button>
        </div>
        <h1>腕表养护</h1>
        <p className="fm-aftersales-copy">建议每3到5年为腕表进行一次检修和保养<br />即刻预约腕表顾问进行养护</p>
        <FlowStrip />
        <Button className="fm-primary-pill" onClick={() => go("apply")}>预约腕表养护</Button>
        <button className="fm-text-link" onClick={() => go("care")}>了解腕表养护</button>
        <aside className="fm-web-contact"><strong>网页端售后联系</strong><a href={`mailto:${prototypeEmail}`}>{prototypeEmail}</a><small>原型联系邮箱，上线前请由品牌方确认。</small></aside>
      </div>
    </section>
  );
}

function UnderlineField({ label, value, onChange, half = false }: { label: string; value: string; onChange: (v: string) => void; half?: boolean }) {
  return (
    <label className={`fm-field ${half ? "is-half" : ""}`}>
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function ApplyPage({ brand, go, onSubmit }: { brand: FigmaBrand; go: (p: Page) => void; onSubmit: () => void }) {
  const cfg = brandConfig[brand];
  const [productOpen, setProductOpen] = useState(false);
  const [serial, setSerial] = useState("");
  const [product, setProduct] = useState("");
  const [consent, setConsent] = useState(false);
  const [reason, setReason] = useState("");
  const [termsOpen, setTermsOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [form, setForm] = useState({ salutation: "先生", last: "梁", first: "桐", phone: "18717822727", note: "腕表买回来几年了，链条有划痕需要抛光下", kit: "上海市长宁区愚园路1108号创邑园区2号2楼", back: "上海市长宁区愚园路1108号创邑园区2号2楼" });
  const set = (key: keyof typeof form) => (value: string) => setForm((old) => ({ ...old, [key]: value }));
  const submit = () => {
    if (!product || !reason || !consent) {
      toast.error("请完成产品、售后原因和隐私授权信息");
      return;
    }
    onSubmit();
    setSuccessOpen(true);
  };
  return (
    <section className="fm-page fm-apply-page">
      <StatusBar />
      <MiniHeader brand={brand} back={() => go("aftersales")} title="预约售后服务" />
      <div className="fm-form">
        <label className="fm-select-line"><span>称谓*</span><select value={form.salutation} onChange={(e) => set("salutation")(e.target.value)}><option>先生</option><option>女士</option></select><ChevronDown /></label>
        <div className="fm-two"><UnderlineField label="姓氏*" value={form.last} onChange={set("last")} half /><UnderlineField label="名字*" value={form.first} onChange={set("first")} half /></div>
        <UnderlineField label="电话" value={form.phone} onChange={set("phone")} />
        <div className="fm-product-field"><span>产品*</span><button onClick={() => setProductOpen(true)}><Watch />{product || "添加产品"}</button></div>
        <label className="fm-select-line"><span>选择售后原因*</span><select value={reason} onChange={(e) => setReason(e.target.value)}><option value="">请选择</option>{serviceReasons.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown /></label>
        <UnderlineField label="留言和说明" value={form.note} onChange={set("note")} />
        <UnderlineField label="专属服务套件寄送地址*" value={form.kit} onChange={set("kit")} />
        <div className="fm-return-address"><UnderlineField label="作品寄回地址*" value={form.back} onChange={set("back")} /><label className="fm-same-address"><Checkbox checked={form.back === form.kit} onCheckedChange={(v) => v && setForm((old) => ({ ...old, back: old.kit }))} />与寄送地址相同</label></div>
        <label className="fm-consent"><Checkbox checked={consent} onCheckedChange={(value) => setConsent(Boolean(value))} /><span>我已阅读并同意 {cfg.english.replace(" ", "-")} <button type="button" onClick={() => setTermsOpen(true)}>隐私政策与服务条款</button>，并授权其按照相关政策处理我的个人信息。*</span></label>
        <Button className="fm-submit" onClick={submit}>提交</Button>
      </div>
      <Dialog open={productOpen} onOpenChange={setProductOpen}>
        <DialogContent className="fm-product-dialog">
          <DialogHeader><DialogTitle>认证我的作品</DialogTitle><DialogDescription>扫描或手动输入作品编号，以关联您的腕表。</DialogDescription></DialogHeader>
          <div className="fm-product-panel">
            <h3>作品编号</h3>
            <div><input placeholder="请手动或扫码输入作品编号" value={serial} onChange={(e) => setSerial(e.target.value)} /><button type="button" aria-label="模拟扫码" onClick={() => { setSerial(`${brand}17910001`); toast.success("已模拟识别作品编号"); }}><ScanLine /></button></div>
            <button onClick={() => toast.info("作品编号通常位于腕表底盖或保修凭证上")}>如何找到我的作品编号？</button>
          </div>
          <DialogFooter><Button disabled={!serial.trim()} onClick={() => { setProduct(`${cfg.reference} · ${cfg.product}`); setProductOpen(false); }}>下一步</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
        <DialogContent className="fm-terms-dialog">
          <DialogHeader><DialogTitle>售后服务条款</DialogTitle><DialogDescription>本内容用于可交互原型展示，正式上线前应替换为品牌法务确认的完整版本。</DialogDescription></DialogHeader>
          <div className="fm-terms-copy"><p>您提交的作品信息、联系方式和地址仅用于本次售后预约、物流联系与服务进度通知。</p><p>实际检测结果、服务范围、报价和预计周期，以专属顾问及服务中心后续确认为准。</p><p>贵重作品寄送前请妥善包装并保留物流凭证；如需变更预约，请在门店开始处理前联系顾问。</p></div>
          <DialogFooter><Button onClick={() => { setConsent(true); setTermsOpen(false); }}>同意并返回</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="fm-success-dialog">
          <div className="fm-success-icon"><ShieldCheck /></div>
          <DialogHeader><DialogTitle>售后申请提交成功</DialogTitle><DialogDescription>申请成功，待专属顾问与您联系。您可在“我的服务记录”中查看进度。</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => { setSuccessOpen(false); go("record"); }}>查看详情</Button><Button onClick={() => { setSuccessOpen(false); go("account"); toast.success("申请已保存"); }}>返回我的</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function StatusCard({ brand, onDetail }: { brand: FigmaBrand; onDetail: () => void }) {
  const cfg = brandConfig[brand];
  return (
    <article className="fm-status-card">
      <div className="fm-status-top"><strong>{stageLabels[0]}</strong><button onClick={onDetail}>查看详情 <ChevronRight /></button></div>
      <span className="fm-status-chip">进行中</span>
      <hr />
      <p>梁桐 先生&nbsp; 18717822727</p>
      <p><Watch /> {cfg.reference}</p>
      <p><Wrench /> 腕表抛光/翻新</p>
    </article>
  );
}

function AccountPage({ brand, go, hasRecord }: { brand: FigmaBrand; go: (p: Page) => void; hasRecord: boolean }) {
  const cfg = brandConfig[brand];
  return (
    <section className="fm-account">
      <div className="fm-account-hero" style={{ backgroundImage: `url(${cfg.account})` }}>
        <StatusBar light />
        <MiniHeader brand={brand} light />
        <div className="fm-account-greeting"><h1>你好，梁 先生</h1><button>编辑资料</button></div>
      </div>
      <div className="fm-account-body">
        <div className="fm-section-head"><h2>售后预约记录</h2><button onClick={() => go("records")}>查看全部</button></div>
        {hasRecord ? <StatusCard brand={brand} onDetail={() => go("record")} /> : <div className="fm-empty-record" style={{ backgroundImage: `url(${cfg.watchmaker})` }}><span>暂无预约</span><button onClick={() => go("apply")}>去预约</button></div>}
        <button className="fm-account-row" onClick={() => toast.success(`已关注${cfg.chinese}`)}><span className="fm-round-logo">{brand}</span><span><strong>{cfg.chinese}</strong><small>探索更多非凡时刻</small></span><b>立即关注</b></button>
        <button className="fm-account-row" onClick={() => toast.info("已为您打开客服咨询演示") }><span className="fm-round-logo"><Headphones /></span><span><strong>客服咨询</strong><small>随时欢迎您的垂询</small></span><b>立即咨询</b></button>
        <button className="fm-account-row" onClick={() => go("works")}><span className="fm-round-logo"><Watch /></span><span><strong>我的作品</strong><small>查看与管理已认证腕表</small></span><b>查看作品</b></button>
      </div>
      <BottomNav brand={brand} page="account" go={go} />
    </section>
  );
}

function RecordsPage({ brand, go, hasRecord }: { brand: FigmaBrand; go: (p: Page) => void; hasRecord: boolean }) {
  const [tab, setTab] = useState<"active" | "completed" | "cancelled">("active");
  const hasActiveRecord = hasRecord && tab === "active";
  return (
    <section className="fm-page">
      <StatusBar />
      <MiniHeader brand={brand} back={() => go("account")} title="售后预约记录" />
      <div className="fm-record-tabs"><button className={tab === "active" ? "is-active" : ""} onClick={() => setTab("active")}>进行中</button><button className={tab === "completed" ? "is-active" : ""} onClick={() => setTab("completed")}>已完成</button><button className={tab === "cancelled" ? "is-active" : ""} onClick={() => setTab("cancelled")}>已取消</button></div>
      <div className="fm-record-list">{hasActiveRecord ? <StatusCard brand={brand} onDetail={() => go("record")} /> : <div className="fm-record-empty"><PackageCheck /><h2>{tab === "completed" ? "暂无已完成服务" : tab === "cancelled" ? "暂无已取消预约" : "暂无售后预约"}</h2><p>{tab === "active" ? "提交售后申请后，服务进度会显示在这里。" : "对应状态的服务记录会显示在这里。"}</p>{tab === "active" && <Button onClick={() => go("apply")}>去预约</Button>}</div>}</div>
    </section>
  );
}

function RecordDetail({ brand, go, onCancel }: { brand: FigmaBrand; go: (p: Page) => void; onCancel: () => void }) {
  const cfg = brandConfig[brand];
  const [confirmCancel, setConfirmCancel] = useState(false);
  return (
    <section className="fm-record-detail">
      <div className="fm-detail-hero" style={{ backgroundImage: `url(${cfg.detail})` }}>
        <StatusBar light /><MiniHeader brand={brand} back={() => go("records")} light />
        <h1>您已预约售后服务</h1>
      </div>
      <div className="fm-detail-card">
        <StatusCard brand={brand} onDetail={() => undefined} />
        <div className="fm-address-block"><p><MapPin /> 上海市长宁区愚园路1108号创邑园区2号2楼</p><small>*专属服务套件的寄送地址</small><p><MapPin /> 上海市长宁区愚园路1108号创邑园区2号2楼</p><small>*作品的寄回地址</small></div>
        <div className="fm-service-updates"><h2>售后服务更新</h2><p><strong>服务报价</strong><span>待门店检测后更新</span></p><p><strong>维修图片</strong><span>待门店上传</span></p><p><strong>门店备注</strong><span>专属顾问联系后更新</span></p><p><strong>物流信息</strong><span>专属服务套件尚未寄出</span></p></div>
      </div>
      <div className="fm-detail-actions"><Button variant="outline" onClick={() => setConfirmCancel(true)}>取消预约</Button><Button onClick={() => go("apply")}>修改预约</Button></div>
      <Dialog open={confirmCancel} onOpenChange={setConfirmCancel}><DialogContent><DialogHeader><DialogTitle>取消售后预约？</DialogTitle><DialogDescription>取消后该记录会移动到“已取消”。如需服务，可重新提交申请。</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setConfirmCancel(false)}>保留预约</Button><Button onClick={() => { onCancel(); setConfirmCancel(false); go("records"); toast.success("预约已取消"); }}>确认取消</Button></DialogFooter></DialogContent></Dialog>
    </section>
  );
}

function WorksPage({ brand, go }: { brand: FigmaBrand; go: (p: Page) => void }) {
  const cfg = brandConfig[brand];
  return (
    <section className="fm-page"><StatusBar /><MiniHeader brand={brand} back={() => go("account")} title="我的作品" /><div className="fm-works"><h1>我的作品</h1><article><div className="fm-watch-art" style={{ backgroundImage: `url(${cfg.watchmaker})` }} /><div><p>{cfg.chinese} · 已认证</p><h2>{cfg.product}</h2><span>{cfg.reference}</span><small>作品编号 GP17910001</small></div></article><Button variant="outline" onClick={() => go("apply")}><ImagePlus /> 添加作品</Button></div></section>
  );
}

function FaqPage({ brand, go }: { brand: FigmaBrand; go: (p: Page) => void }) {
  const questions = [
    ["我的腕表多久保养一次？", "建议每3至5年进行一次专业检修与养护，实际周期需结合佩戴情况和检测结果。"],
    ["腕表送修有哪些注意事项？", "请先提交售后申请。顾问审核通过后，门店会寄出专属服务套件并提供物流单号。"],
    ["全面保养包含哪些内容？", "包括拆卸、清洁、组装、润滑、功能检查、精度校正及必要的外观翻新。"],
    ["如何查看服务进度？", "进入“我的”页面，在售后预约记录中查看当前状态、物流、报价和服务图片。"],
  ];
  return <section className="fm-page fm-article"><StatusBar /><MiniHeader brand={brand} back={() => go("service")} title="常见问题" /><div className="fm-article-hero" style={{ backgroundImage: `url(${brandConfig[brand].detail})` }}><div><p>{brandConfig[brand].chinese}时计</p><h1>常见问题</h1></div></div><div className="fm-article-body"><p>您是否正在考虑购买或保养一枚{brandConfig[brand].chinese}时计？<br />这里有一些常见问题的答案。</p><Accordion type="single" collapsible>{questions.map(([q,a],i)=><AccordionItem value={`q${i}`} key={q}><AccordionTrigger>{q}</AccordionTrigger><AccordionContent>{a}</AccordionContent></AccordionItem>)}</Accordion></div></section>;
}

const careCopy = ["拆卸表链", "拆卸表壳", "完全解拆表壳", "解拆机芯", "在不同清洁池中清洗各种备件和零部件", "零备件管控", "更换零件", "润滑", "抛光零件", "重新组装机芯", "重新组装表壳", "防水性能测试", "最终调节", "最终外观检查"];
function CarePage({ brand, go }: { brand: FigmaBrand; go: (p: Page) => void }) {
  const images = Array.from({ length: 14 }, (_, i) => `./figma/imgRectangle346265${46 + i}.png`);
  return <section className="fm-page fm-article"><StatusBar /><MiniHeader brand={brand} back={() => go("aftersales")} title="了解腕表养护" /><div className="fm-article-hero" style={{ backgroundImage: `url(${brandConfig[brand].watchmaker})` }}><div><p>{brandConfig[brand].chinese}时计</p><h1>了解腕表养护</h1></div></div><div className="fm-article-body"><p>我们的制表大师将全力为您的腕表提供优质服务，延长其使用寿命。建议定期进行全面检修保养。</p>{careCopy.map((title,i)=><article className="fm-care-step" key={title}><img src={brand === "UN" ? images[i] : brandConfig.GP.watchmaker} alt={title}/><h2>{i+1}. {title}</h2><p>制表师将按照品牌标准完成此步骤，并在每个阶段进行严格质量检查。</p></article>)}</div></section>;
}

function HomePage({ brand, go }: { brand: FigmaBrand; go: (p: Page) => void }) {
  const cfg=brandConfig[brand];
  return <section className="fm-home" style={{backgroundImage:`url(${cfg.home})`}}><StatusBar light/><MiniHeader brand={brand} light/><div className="fm-service-shade"/><div className="fm-home-copy"><p>{cfg.product}</p><h1>{brand === "GP" ? "历久弥新的设计传奇" : "探索非凡时刻"}</h1><Button variant="outline">即刻探索</Button></div><BottomNav brand={brand} page="home" go={go}/></section>;
}

export function FigmaMobileApp({ brand }: { brand: FigmaBrand }) {
  const { page, go } = usePage();
  const [hasRecord, setHasRecord] = useState(true);
  useEffect(() => { document.title = `${brandConfig[brand].chinese} · 售后服务原型`; }, [brand]);
  const content = useMemo(() => {
    if (page === "home") return <HomePage brand={brand} go={go} />;
    if (page === "service") return <ServiceLanding brand={brand} go={go} />;
    if (page === "aftersales") return <Aftersales brand={brand} go={go} />;
    if (page === "apply") return <ApplyPage brand={brand} go={go} onSubmit={() => setHasRecord(true)} />;
    if (page === "account") return <AccountPage brand={brand} go={go} hasRecord={hasRecord} />;
    if (page === "records") return <RecordsPage brand={brand} go={go} hasRecord={hasRecord} />;
    if (page === "record") return <RecordDetail brand={brand} go={go} onCancel={() => setHasRecord(false)} />;
    if (page === "works") return <WorksPage brand={brand} go={go} />;
    if (page === "faq") return <FaqPage brand={brand} go={go} />;
    return <CarePage brand={brand} go={go} />;
  }, [page, brand, hasRecord]);
  return <main className={`figma-prototype fm-brand-${brand.toLowerCase()}`} style={{ "--fm-accent": brandConfig[brand].accent } as React.CSSProperties}><div className="fm-device">{content}</div></main>;
}
