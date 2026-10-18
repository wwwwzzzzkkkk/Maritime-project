// Preliminary screening for ordinary 2026 cargo/passenger activities, not legal verification.
export const SCOPE_CHECKED_AT='2026-10-18';
export const EU27=new Set('AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE'.split(' '));
export const CSV_COLUMNS=['id','date','activity','from','to','fuelTonnes','lhvMJPerKg','co2Factor','wtwIntensity','distanceNm','source'];
const finite=(v,min,max)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
export function validateLedger(document) {
  if(!document||typeof document!=='object')throw new Error('台账格式错误 / Invalid ledger');
  const p=document.profile;
  if(!p||typeof p.name!=='string'||!p.name.trim()||p.name.length>80||!finite(p.gt,1,1000000)||!Number.isInteger(p.gt)||!['cargo','passenger','other'].includes(p.shipType)||!finite(p.serviceSpeedKn,5,30)||!['ordinary','review'].includes(p.scopeStatus))throw new Error('请完整填写船名、总吨、船型、航速及范围声明 / Complete vessel and scope fields');
  if(p.periodStart!=='2026-01-01'||p.periodEnd!=='2026-12-31')throw new Error('本版台账支持 2026 年度；2030 仅为目标条件比较 / Ledger supports 2026; 2030 is a target-condition comparison');
  if(!Array.isArray(document.rows)||document.rows.length<1||document.rows.length>500)throw new Error('台账须有 1–500 行 / Use 1–500 rows');
  const ids=new Set();
  for(const [i,r] of document.rows.entries()) {
    const date=new Date(`${r.date}T00:00:00Z`);
    if(typeof r.id!=='string'||!/^[A-Za-z0-9_-]{1,24}$/.test(r.id)||r.id==='AUX'||ids.has(r.id))throw new Error(`第 ${i+1} 行编号缺失、重复或保留 / Invalid or duplicate row ID`);
    ids.add(r.id);
    if(typeof r.date!=='string'||!/^2026-\d{2}-\d{2}$/.test(r.date)||!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==r.date)throw new Error(`第 ${i+1} 行日期无效 / Invalid 2026 date`);
    if(!['sailing','port'].includes(r.activity)||![r.from,r.to].every(code=>typeof code==='string'&&/^[A-Z]{2}[A-Z0-9]{3}$/.test(code))||(r.activity==='port'&&r.from!==r.to))throw new Error(`第 ${i+1} 行活动或港口代码无效 / Invalid activity or port code`);
    if(!finite(r.fuelTonnes,.000001,1000000)||!finite(r.lhvMJPerKg,1,100)||!finite(r.co2Factor,.000001,10)||!finite(r.wtwIntensity,1,200)||!finite(r.distanceNm,0,1000000)||(r.activity==='sailing'&&r.distanceNm===0)||(r.activity==='port'&&r.distanceNm!==0))throw new Error(`第 ${i+1} 行燃料、因子或距离越界 / Fuel, factors or distance outside bounds`);
    if(typeof r.source!=='string'||!r.source.trim()||r.source.length>200)throw new Error(`第 ${i+1} 行需要原始记录来源 / Source record required`);
  }
  return document;
}
export function parseLedgerCSV(text) {
  if(typeof text!=='string'||text.length>1000000)throw new Error('CSV 最大 1 MB / CSV maximum 1 MB');
  const records=[];let row=[],field='',quoted=false;
  text=text.replace(/^\uFEFF/,'');
  for(let i=0;i<text.length;i++) {
    const c=text[i];
    if(c==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++;}else if(!quoted&&field!=='')throw new Error('CSV 引号位置错误 / Misplaced CSV quote');else quoted=!quoted;}
    else if(!quoted&&(c===','||c==='\n'||c==='\r')) {
      row.push(field);field='';
      if(c!==','){if(row.some(x=>x.trim()!==''))records.push(row);row=[];if(c==='\r'&&text[i+1]==='\n')i++;}
    }else field+=c;
  }
  if(quoted)throw new Error('CSV 引号未闭合 / Unclosed CSV quote');
  if(field||row.length){row.push(field);if(row.some(x=>x.trim()!==''))records.push(row);}
  if(!records.length||records[0].map(x=>x.trim()).join(',')!==CSV_COLUMNS.join(','))throw new Error('CSV 表头须与模板一致 / CSV headers must match the template');
  return records.slice(1).map((cells,i)=>{
    if(cells.length!==CSV_COLUMNS.length)throw new Error(`第 ${i+2} 行列数错误 / Wrong CSV column count`);
    return Object.fromEntries(CSV_COLUMNS.map((key,j)=>[key,['fuelTonnes','lhvMJPerKg','co2Factor','wtwIntensity','distanceNm'].includes(key)?(cells[j].trim()===''?NaN:Number(cells[j])):cells[j].trim()]));
  });
}
export function serializeLedgerCSV(rows) {
  const cell=value=>/[",\r\n]/.test(String(value))?'"'+String(value).replaceAll('"','""')+'"':String(value);
  return CSV_COLUMNS.join(',')+'\n'+rows.map(row=>CSV_COLUMNS.map(key=>cell(row[key])).join(',')).join('\n')+'\n';
}
export function screenLedger(document) {
  validateLedger(document);const {profile:p}=document;
  const supported=p.gt>5000&&['cargo','passenger'].includes(p.shipType)&&p.scopeStatus==='ordinary';
  const rows=document.rows.map(r=>{
    const a=r.from.slice(0,2),b=r.to.slice(0,2),review=['NO','IS'].includes(a)||['NO','IS'].includes(b);
    const eu=review?0:r.activity==='port'?(EU27.has(a)?1:0):(EU27.has(a)&&EU27.has(b)?1:EU27.has(a)||EU27.has(b)?.5:0);
    const uk=r.date>='2026-07-01'&&(r.activity==='port'?a==='GB':a==='GB'&&b==='GB')?1:0;
    return {...r,energyMJ:r.fuelTonnes*1000*r.lhvMJPerKg,co2Tonnes:r.fuelTonnes*r.co2Factor,euCoverage:eu,ukCoverage:uk,needsReview:review};
  });
  const hasEU=rows.some(r=>r.euCoverage>0),hasUK=rows.some(r=>r.ukCoverage>0);
  const energyMJ=rows.reduce((s,r)=>s+r.energyMJ*r.euCoverage,0);
  const distanceNm=rows.reduce((s,r)=>s+r.distanceNm*r.euCoverage,0);
  const issues=[];
  if(!['cargo','passenger'].includes(p.shipType))issues.push('本版只支持普通货船／客船；其他船型需专业核对 / Only ordinary cargo/passenger ships are supported');
  if(p.gt<=5000)issues.push('FuelEU 门槛为超过 5,000 GT；EU/UK ETS 一般为至少 5,000 GT。本版不载入边界或较小船舶 / FuelEU >5,000 GT; ETS generally ≥5,000 GT; this calculator does not load boundary/smaller ships');
  if(p.scopeStatus!=='ordinary')issues.push('有效挂靠、豁免或特别安排待核对 / Qualifying calls, exemptions or special arrangements need review');
  if(rows.some(r=>r.needsReview))issues.push('挪威／冰岛：ETS 与 FuelEU 范围可能不同，本版转人工复核 / Norway/Iceland require separate ETS/FuelEU review');
  if(!hasEU||energyMJ<1000||energyMJ>1e12||distanceNm<1||distanceNm>1e6)issues.push('当前估算器需要有效的欧盟范围内能源与航行距离；不支持的台账仅展示检查 / Calculator needs supported EU-scoped energy and distance; unsupported ledgers remain screening-only');
  return {rows,energyMJ,distanceNm,actualWtWIntensity:energyMJ?rows.reduce((s,r)=>s+r.energyMJ*r.euCoverage*r.wtwIntensity,0)/energyMJ:null,
    canApply:supported&&issues.length===0,issues,
    regimes:{euEts:p.gt>=5000&&hasEU?'preliminary-in-scope':'outside-or-review',fuelEU:p.gt>5000&&hasEU?'preliminary-in-scope':'outside-or-review',ukEts:p.gt>=5000&&hasUK?'preliminary-in-scope':'no-covered-records-or-review'},
    checkedAt:SCOPE_CHECKED_AT,limitations:['CO2-only; CH4/N2O missing','Annual completeness and fuel factors unverified','Ordinary EU27/UK activities only; exceptions and transhipment require review','Speed/fuel what-if coefficients remain the existing simplified model']};
}
export function compileLedger(document,slotId) {
  const screened=screenLedger(document);
  if(!screened.canApply)throw new Error(screened.issues.join('\n'));
  const legs=[];
  for(const row of screened.rows)for(const [currency,coverage]of [['EUR',row.euCoverage],['GBP',row.ukCoverage]])if(coverage>0)legs.push({id:row.id,zh:`${row.from} → ${row.to}`,en:`${row.from} → ${row.to}`,activity:row.activity,co2Tonnes:row.co2Tonnes,ch4Tonnes:null,n2oTonnes:null,coverage,currency,ports:[row.from,row.to]});
  return {vessel:{id:slotId,name:document.profile.name,gt:document.profile.gt,serviceSpeedKn:document.profile.serviceSpeedKn,fuel:'User ledger / unverified',euEnergyMJ:screened.energyMJ,actualWtWIntensity:screened.actualWtWIntensity,legs},screened};
}
export const LEDGER_TEMPLATE=CSV_COLUMNS.join(',')+'\n'+[
 ['R1','2026-02-10','sailing','CNSHA','NLRTM',320,41,3.114,91.6,6000,'Demo log 001 - replace with authorised records'],
 ['R2','2026-03-12','sailing','NLRTM','DEHAM',160,41,3.114,91.6,300,'Demo log 002'],
 ['R3','2026-03-13','port','NLRTM','NLRTM',32,41,3.114,91.6,0,'Demo berth log'],
 ['R4','2026-08-15','sailing','GBFXT','GBSOU',64,41,3.114,91.6,200,'Demo UK log'],
 ['R5','2026-08-16','port','GBSOU','GBSOU',6.4,41,3.114,91.6,0,'Demo UK berth log']
].map(r=>r.join(',')).join('\n')+'\n';
