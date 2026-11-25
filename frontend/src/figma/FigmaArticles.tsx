import type { ReactNode } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import './FigmaArticles.css';

type Brand = 'GP' | 'UN';
type Question = { question: string; answer: string; open?: boolean };
const asset = (name: string) => `./figma/articles/${name}`;
const gpQuestions: Question[] = [
  { question: '我的腕表建议多久保养一次？', answer: '我们建议每隔 3 至 5 年 对腕表进行一次全面保养。\n具体间隔取决于佩戴频率与气候环境。\n若您每天佩戴，建议每 3 年保养一次；若仅在特殊场合佩戴，则可延长至 5 年左右。', open: true },
  { question: '谁有资格为我的腕表提供保养服务？', answer: '请联系芝柏表授权服务中心或您的专属顾问，为您的腕表安排专业检修与养护。' },
  { question: '完整保养服务包含哪些项目 ？', answer: '- 拆解、清洁、润滑并重新组装机芯\n- 更换或修复磨损或损坏的零部件\n- 按照 Girard-Perregaux 标准调整走时精度\n- 检查各项功能并完成装壳\n- 更换密封圈\n- 恢复出厂级别的防水性能\n- 对表壳和表链进行翻新抛光处理', open: true },
  { question: '什么是防水性能？', answer: '防水性能与腕表型号及密封部件状况有关。请按照腕表使用说明佩戴，并由授权服务中心检查防水性能。' },
  { question: '我经常佩戴腕表游泳或潜水，多久应检测一次防水？', answer: '请向专属顾问说明您的佩戴和使用情况，由授权服务中心为您的腕表安排防水性能检测。' },
  { question: '官方维修是否提供保修？', answer: '具体服务保修范围与期限，请以授权服务中心提供的维修凭证及服务条款为准。' },
  { question: '寄送腕表进行保养时，有哪些注意事项？', answer: '请先提交售后预约，等待专属顾问联系。收到专属服务套件后，按照门店指引妥善包装腕表，保留物流凭证并填写寄回快递单号。' },
];
const unQuestions: Question[] = [
  { question: '对于腕表的保养频率有什么建议？', answer: '建议您每隔3至5年对您的腕表进行一次保养服务。保养的间隔时间会受到诸如使用频率、气候等多种因素的影响。每天都佩戴的钟表，其机芯部件的磨损会更严重，可能需要每隔约3年进行一次保养。而只在特殊场合佩戴的钟表，可能每隔约5年进行一次保养即可。', open: true },
  { question: '腕表售后保养服务的指定机构是什么？', answer: '请联系雅典表授权服务中心或您的专属顾问，为您的腕表安排专业检修与养护。' },
  { question: '全面保养包含哪些内容？', answer: '- 解拆、清洁、组装、润滑腕表机芯\n- 维修或更换磨损/损坏的机芯部件\n- 根据雅典表的标准进行计时和精度校正\n- 装壳并检查各种功能\n- 更换表冠、按钮、垫圈 (如适用)\n- 将防水性能恢复至出厂规格\n- 将表壳和表链翻新至出厂规格', open: true },
  { question: '什么是防水性能？', answer: gpQuestions[3].answer },
  { question: '佩戴腕表潜水和游泳的用户应该每隔多久进行一次腕表的防水性能测试？', answer: gpQuestions[4].answer },
  { question: '维修保修服务是什么？', answer: gpQuestions[5].answer },
  { question: '关于腕表送修有哪些注意事项？', answer: gpQuestions[6].answer },
  { question: '我有一块老款的雅典表时计，我很有兴趣了解它的相关情况。查询档案需要哪些信息呢？', answer: '我们很高兴为您搜索我们珍藏的相关资料。我们的珍藏的资料以机芯编码为分类依据，我们需要您提供以下信息：\n1. 时计的电子照片 (正面和背面)\n2. 机芯编码 — 这个编码镌刻于机芯上，需要由具备资质的制表师打开表壳、取出机芯，才能看到这个编码。您可以通过电子邮件给我们发送这个信息，我们将代您搜索资料。', open: true },
  { question: '我有一枚较老款的雅典表时计，我想把它送去保养，我该怎么做？', answer: '您可以提交售后预约，并提供作品编号、型号和腕表情况。专属顾问会与您联系，协助确认适合的检修与养护安排。' },
  { question: '如果我的时计失窃，如何进行声明？', answer: '请联系雅典表专属顾问，提供作品编号、腕表资料及相关证明，以确认登记失窃声明所需的信息。' },
];
const gpQuestionsEn: Question[] = [
  { question: 'How often should my watch be serviced?', answer: 'We recommend a complete service every 3 to 5 years. The exact interval depends on wearing frequency and climate. A watch worn daily may need service every 3 years, while occasional wear may extend the interval to around 5 years.', open: true },
  { question: 'Who is authorised to service my watch?', answer: 'Please contact an authorised Girard-Perregaux service centre or your dedicated advisor to arrange professional inspection and servicing.' },
  { question: 'What does a complete service include?', answer: '- Movement disassembly, cleaning, lubrication and reassembly\n- Replacement or repair of worn or damaged components\n- Timing adjustment to Girard-Perregaux standards\n- Function checks and casing\n- Gasket replacement\n- Restoration of factory-level water resistance\n- Case and bracelet refinishing', open: true },
  { question: 'What does water resistance mean?', answer: 'Water resistance depends on the watch model and the condition of its seals. Follow the watch instructions and have an authorised service centre test its water resistance.' },
  { question: 'How often should water resistance be tested if I swim or dive with my watch?', answer: 'Tell your dedicated advisor how the watch is worn and used. An authorised service centre will recommend the appropriate testing interval.' },
  { question: 'Is official servicing covered by a warranty?', answer: 'The coverage and duration of the service warranty are governed by the service certificate and terms provided by the authorised service centre.' },
  { question: 'What should I know before sending my watch for service?', answer: 'Submit an after-sales appointment and wait for your dedicated advisor. After receiving the service kit, follow the boutique packing instructions, keep the shipping receipt and enter the return tracking number.' },
];
const unQuestionsEn: Question[] = [
  { question: 'How often should a watch be serviced?', answer: 'We recommend servicing your watch every 3 to 5 years. The interval depends on factors such as wearing frequency and climate. Daily wear may require service about every 3 years, while occasional wear may extend the interval to around 5 years.', open: true },
  { question: 'Who is authorised to provide after-sales service?', answer: 'Please contact an authorised Ulysse Nardin service centre or your dedicated advisor to arrange professional inspection and servicing.' },
  { question: 'What is included in a complete service?', answer: '- Movement disassembly, cleaning, assembly and lubrication\n- Repair or replacement of worn or damaged movement components\n- Timing and accuracy adjustment to Ulysse Nardin standards\n- Casing and function checks\n- Crown, pusher and gasket replacement where applicable\n- Restoration of factory water resistance\n- Case and bracelet refinishing', open: true },
  { question: 'What does water resistance mean?', answer: 'Water resistance depends on the watch model and the condition of its seals. Follow the watch instructions and have an authorised service centre test its water resistance.' },
  { question: 'How often should water resistance be tested for swimming or diving?', answer: 'Tell your dedicated advisor how the watch is worn and used. An authorised service centre will recommend the appropriate testing interval.' },
  { question: 'What is the service warranty?', answer: 'The coverage and duration of the service warranty are governed by the service certificate and terms provided by the authorised service centre.' },
  { question: 'What should I know before sending a watch for service?', answer: 'Submit an after-sales appointment and wait for your dedicated advisor. Follow the boutique packing instructions, retain the shipping receipt and enter the tracking number.' },
  { question: 'What information is needed for an archive search for a vintage Ulysse Nardin timepiece?', answer: 'Please provide photographs of the front and back of the timepiece and the movement number. A qualified watchmaker must open the case to locate the movement number. Send this information to us so that we can search the archives.', open: true },
  { question: 'How do I arrange service for a vintage Ulysse Nardin timepiece?', answer: 'Submit an after-sales appointment with the timepiece number, model and condition. Your dedicated advisor will contact you to arrange the appropriate inspection and service.' },
  { question: 'How do I report a stolen timepiece?', answer: 'Contact your Ulysse Nardin advisor and provide the timepiece number, watch details and supporting documents required to register the theft.' },
];

const careSteps = [
  ['拆卸表链', '将表链拆离表壳。', '77fd6.png'],
  ['拆卸表壳', '开启表壳，拆卸机芯。', '23586.png'],
  ['完全解拆表壳', '然后把表壳彻底解拆，准备进行清洁和检查。', 'da3ff.png'],
  ['解拆机芯', '制表师会把机芯彻底解拆，首先对每一个零部件进行检查，以此发现任何过早磨损迹象或可能影响机械装置运行的风险。', '8eaa9.png'],
  ['在不同清洁池中清洗各种备件和零部件', '机芯的每一个零件都要经过超声波清洁并在专用配方溶剂中清除油脂，整个过程遵守规定步骤。', '20fe2.png'],
  ['零备件管控', '制表师仔细检查每一个零备件、进行辨别并更换不符合我们标准的零件。', 'cdb48.png'],
  ['更换零件', '如果必要，会根据最新技术为您的时计装配新部件。仅使用由雅典表瑞士总部直供的原装替换件。', '43374.png'],
  ['润滑', '使用最先进的润滑剂仔细润滑机芯的每一个功能性零件，以此最大程度减少摩擦、预防磨损。这能够确保您的雅典表时计的机芯持续精准运行。', '009e4.png'],
  ['抛光零件', '我们既重视您时计的机芯，也重视它的外观。经过初始清洁后，我们会全面检查并更换表壳和表链的任何磨损或损坏的零件。专业抛光服务将使腕表恢复初始光泽，新表带将使腕表看起来崭新如初。', 'c2d3f.png'],
  ['重新组装机芯', '重新组装机芯的过程中会检查机芯的运行精度，以此确保符合雅典表时计的高水平质量和可靠性标准。', '31d3c.png'],
  ['重新组装表壳', '重新组装表壳并更换所有密封件，以此保证防水性能。', 'ee7c4.png'],
  ['防水性能测试', '对表壳进行严格测试，以此确保其符合各项耐压要求。分三个步骤进行：真空测试、压缩测试和冷凝测试 — 保证不放过表壳内的任何一点点湿气。', '51d74.png'],
  ['最终调节', '整个检修保养过程的每一个阶段都会进行严格的质量检查，保证您的时计符合雅典表的各项高标准要求。', '159bf.png'],
  ['最终外观检查', '在最终检查时，会按照生产规格对您时计的动力储备、计时精度和外观美学进行最后一次核验，以保证时计符合最高质量标准要求。', 'e2bb0.png'],
  ['时计的日常保养', '在对您的雅典表时计完成全面检修保养等服务后，会将时计返还给您。\n\n您的时计值得每日精心养护，为此提出以下建议，以使时计尽可能长久地正常发挥功用：\n- 尽量避免接触磁体。\n- 避免同一只手腕同时佩戴手镯。\n- 避免在睡觉和运动期间佩戴腕表。\n- 避免温度变化。\n- 用干燥软布清洁。', '86144.png'],
];
const careStepsEn = [
  ['Removing the bracelet', 'The bracelet is detached from the case.', '77fd6.png'],
  ['Opening the case', 'The case is opened and the movement is removed.', '23586.png'],
  ['Complete case disassembly', 'The case is fully disassembled in preparation for cleaning and inspection.', 'da3ff.png'],
  ['Movement disassembly', 'The watchmaker completely disassembles the movement and inspects every component for premature wear or risks to reliable operation.', '8eaa9.png'],
  ['Cleaning components in dedicated baths', 'Each movement component is ultrasonically cleaned and degreased in specially formulated solutions following a controlled process.', '20fe2.png'],
  ['Component inspection', 'Every component is identified and carefully inspected; any part that does not meet our standards is replaced.', 'cdb48.png'],
  ['Replacing components', 'Where necessary, updated components are fitted using genuine replacement parts supplied by Ulysse Nardin in Switzerland.', '43374.png'],
  ['Lubrication', 'Every functional movement component is lubricated with advanced lubricants to reduce friction, prevent wear and maintain precision.', '009e4.png'],
  ['Polishing', 'The case and bracelet are inspected after initial cleaning. Worn or damaged exterior components are replaced and professional polishing restores the original brilliance.', 'c2d3f.png'],
  ['Movement reassembly', 'The movement is reassembled and its rate is checked to meet Ulysse Nardin standards for quality and reliability.', '31d3c.png'],
  ['Case reassembly', 'The case is reassembled and all seals are replaced to restore water resistance.', 'ee7c4.png'],
  ['Water-resistance testing', 'The case undergoes vacuum, pressure and condensation tests to verify resistance and detect any moisture.', '51d74.png'],
  ['Final adjustment', 'Strict quality checks are performed throughout the service to ensure the timepiece meets Ulysse Nardin standards.', '159bf.png'],
  ['Final appearance inspection', 'Power reserve, timing accuracy and appearance are checked against production specifications before release.', 'e2bb0.png'],
  ['Daily care of your timepiece', 'After the complete service, your timepiece is returned to you. Avoid magnets, bracelets worn on the same wrist, sleeping or exercising with the watch, and sudden temperature changes. Clean it with a dry, soft cloth.', '86144.png'],
];

export function FigmaArticles({ brand, kind, header }: {brand: Brand;kind: 'faq'|'care';header: ReactNode}) {
  // The GP design has no separate care article; its complete-service FAQ is the supplied GP reference.
  const isCare = kind === 'care' && brand === 'UN';
  const english = window.SowindI18n?.getLocale?.().startsWith('en');
  const questions = english ? (brand === 'GP' ? gpQuestionsEn : unQuestionsEn) : (brand === 'GP' ? gpQuestions : unQuestions);
  const steps = english ? careStepsEn : careSteps;
  return <section className={`fa-root fa-${brand.toLowerCase()} ${isCare?'fa-care':'fa-faq'}`}>
    <div className="fa-hero">
      <img className="fa-hero-image" src={asset(isCare?'c87b6.png':brand==='GP'?'9831a.png':'bb9fc.png')} alt={isCare?'雅典表腕表养护':brand==='GP'?'制表师检修机芯':'雅典表机芯部件'} />
      <div className="fa-header">{header}</div>
      <div className="fa-hero-copy"><p>雅典表时计</p><h1>{isCare?'了解腕表养护':'常见问题'}</h1></div>
    </div>
    <div className="fa-body">
      {isCare ? <>
        <p className="fa-intro">我们的制表大师将全力为您的腕表提供优质服务，延长其使用寿命。建议每隔五年进行一次全面的检修保养服务。雅典表专业制表师会进行各种检查，保证您腕表的使用功能。</p>
        <div className="fa-care-list">{steps.map(([title,copy,file],i)=><article key={title} className={`fa-care-step fa-step-${i+1}`}><div className="fa-step-image"><img src={asset(file)} alt={title} /></div><h2>{i+1}. {title}</h2><p>{copy}</p></article>)}</div>
      </> : <>
        <p className="fa-intro">您是否正在考虑购买或保养一枚{brand==='GP'?'芝柏表':'雅典表'}时计？<br/>这里有一些常见问题的答案。</p>
        <Accordion key={brand} type="multiple" defaultValue={questions.flatMap((q,i)=>q.open?[`faq-${i}`]:[])} className="fa-questions">
          {questions.map(({question,answer},i)=><AccordionItem key={question} value={`faq-${i}`}>
            <AccordionTrigger><span>{question}</span><span className="fa-question-icon" aria-hidden="true"><img className="fa-plus" src={asset('3f09a.svg')} alt=""/><img className="fa-minus" src={asset('a308f.svg')} alt=""/></span></AccordionTrigger>
            <AccordionContent><p>{answer}</p></AccordionContent>
          </AccordionItem>)}
        </Accordion>
      </>}
    </div>
    <div className="fa-indicator" aria-hidden="true"><span/></div>
  </section>;
}
