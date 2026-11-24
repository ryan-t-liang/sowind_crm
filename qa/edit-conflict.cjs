const {chromium}=require('../frontend/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try{
  const ctx=await browser.newContext({viewport:{width:375,height:812}}),mobile=await ctx.newPage(),admin=await ctx.newPage();
  await admin.setViewportSize({width:1440,height:1000});
  await mobile.goto('http://127.0.0.1:4181/mockup/girard-perregaux/#/apply/GPAS12345678910');
  await mobile.getByRole('textbox',{name:'留言和说明',exact:true}).fill('保留客户正在输入的内容');
  await admin.goto('http://127.0.0.1:4181/mockup/sowind_crm/');
  await admin.getByRole('button',{name:'售后服务',exact:true}).click();
  await admin.locator('#serviceKeyword').fill('GPAS12345678910');await admin.getByRole('button',{name:'查询',exact:true}).click();
  await admin.locator('#serviceRows').getByRole('button',{name:'详情',exact:true}).click();
  await admin.getByRole('button',{name:'编辑工单',exact:true}).click();
  await admin.locator('#editServiceReturnAddress').fill('后台已更新的正确寄回地址');await admin.getByRole('button',{name:'保存更改',exact:true}).click();
  await mobile.getByRole('button',{name:'保存修改',exact:true}).click();
  await mobile.getByText(/工单已.*更新|预约已.*更新/).waitFor();
  assert.equal(await mobile.getByRole('textbox',{name:'留言和说明',exact:true}).inputValue(),'保留客户正在输入的内容');
  await admin.reload();await admin.getByRole('button',{name:'售后服务',exact:true}).click();
  await admin.locator('#serviceKeyword').fill('GPAS12345678910');await admin.getByRole('button',{name:'查询',exact:true}).click();await admin.locator('#serviceRows').getByRole('button',{name:'详情',exact:true}).click();
  await admin.getByText('后台已更新的正确寄回地址',{exact:true}).waitFor();
  console.log('PASS: concurrent edit blocked; customer draft and latest CRM address preserved');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
