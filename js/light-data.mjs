// Independent light-edition data. Shared v3 data and the other edition remain untouched.
export const checkedAt = '2026-10-15';
const leg = (id, zh, en, co2Tonnes, coverage, currency, activity, ports) => ({
  id, zh, en, co2Tonnes, ch4Tonnes: null, n2oTonnes: null, coverage, currency, activity, ports
});
export const vessels = [
  {
    id: 'v1', name: 'MV A3-BENCHMARK', zh: '附录 A3 基准货船', en: 'A3 reference cargo vessel',
    gt: 10000, serviceSpeedKn: 13.5, fuel: 'VLSFO', actualWtWIntensity: 91.6, euEnergyMJ: 164000000,
    legs: [
      leg('E1', '非欧盟 → 鹿特丹（示意）', 'Non-EU → Rotterdam (illustration)', 1000, .5, 'EUR', 'sailing', ['CNSHA','SGSIN','EGPSD','MAPTM','NLRTM']),
      leg('E2', '鹿特丹 → 汉堡', 'Rotterdam → Hamburg', 500, 1, 'EUR', 'sailing', ['NLRTM','DEHAM']),
      leg('E3', '欧盟港内活动', 'EU port activity', 100, 1, 'EUR', 'port', ['NLRTM']),
      leg('U1', '费利克斯托 → 南安普顿', 'Felixstowe → Southampton', 200, 1, 'GBP', 'sailing', ['GBFXT','GBSOU']),
      leg('U2', '英国港内活动', 'UK port activity', 20, 1, 'GBP', 'port', ['GBSOU'])
    ]
  },
  {
    id: 'v2', name: 'MV PACIFIC HORIZON', zh: '巴拿马型散货船示例', en: 'Illustrative Panamax bulker',
    gt: 35800, serviceSpeedKn: 12.5, fuel: 'HFO / VLSFO', actualWtWIntensity: 91.6, euEnergyMJ: 164000000,
    legs: [
      leg('E1', '上海 → 鹿特丹（示意）', 'Shanghai → Rotterdam (illustration)', 12456, .5, 'EUR', 'sailing', ['CNSHA','SGSIN','EGPSD','MAPTM','NLRTM']),
      leg('E2', '鹿特丹 → 安特卫普', 'Rotterdam → Antwerp', 5228, 1, 'EUR', 'sailing', ['NLRTM','BEANR']),
      leg('E3', '欧盟港内活动', 'EU port activity', 1000, 1, 'EUR', 'port', ['NLRTM']),
      leg('U1', '英国国内航段（示意）', 'UK domestic voyage (illustration)', 380, 1, 'GBP', 'sailing', ['GBFXT','GBSOU']),
      leg('U2', '英国港内活动', 'UK port activity', 40, 1, 'GBP', 'port', ['GBSOU'])
    ]
  },
  {
    id: 'v3', name: 'MV NORDIC BREEZE', zh: '支线集装箱船示例', en: 'Illustrative feeder containership',
    gt: 14200, serviceSpeedKn: 15, fuel: 'VLSFO + B24 (示例 / demo)', actualWtWIntensity: 88.2, euEnergyMJ: 142000000,
    legs: [
      leg('E1', '丹吉尔 → 鹿特丹（范围待核对）', 'Tanger Med → Rotterdam (scope unverified)', 1400, .5, 'EUR', 'sailing', ['MAPTM','NLRTM']),
      leg('E2', '鹿特丹 → 不来梅港', 'Rotterdam → Bremerhaven', 950, 1, 'EUR', 'sailing', ['NLRTM','DEBRV']),
      leg('E3', '欧盟港内活动', 'EU port activity', 180, 1, 'EUR', 'port', ['NLRTM']),
      leg('U1', '费利克斯托 → 南安普顿', 'Felixstowe → Southampton', 310, 1, 'GBP', 'sailing', ['GBFXT','GBSOU']),
      leg('U2', '英国港内活动', 'UK port activity', 35, 1, 'GBP', 'port', ['GBSOU'])
    ]
  }
];

export const ports = {
  CNSHA: { coords: [31.23,121.47], zh: '上海', en: 'Shanghai' },
  SGSIN: { coords: [1.26,103.82], zh: '新加坡', en: 'Singapore' },
  EGPSD: { coords: [31.26,32.31], zh: '塞得港东港', en: 'East Port Said' },
  MAPTM: { coords: [35.89,-5.50], zh: '丹吉尔地中海港', en: 'Tanger Med' },
  NLRTM: { coords: [51.95,4.14], zh: '鹿特丹', en: 'Rotterdam' },
  DEHAM: { coords: [53.54,9.97], zh: '汉堡', en: 'Hamburg' },
  BEANR: { coords: [51.26,4.40], zh: '安特卫普', en: 'Antwerp' },
  DEBRV: { coords: [53.54,8.58], zh: '不来梅港', en: 'Bremerhaven' },
  GBFXT: { coords: [51.95,1.33], zh: '费利克斯托', en: 'Felixstowe' },
  GBSOU: { coords: [50.89,-1.40], zh: '南安普顿', en: 'Southampton' }
};

export const sources = [
  { id:'eu', zh:'EU ETS：排放年与清缴年', en:'EU ETS: emissions and surrender years', status:'law',
    url:'https://climate.ec.europa.eu/areas-action/transport-decarbonisation/reducing-emissions-shipping-sector_en',
    clause:'Directive 2003/87/EC · maritime scope',
    summaryZh:'2026 排放纳入 CH₄/N₂O，2027 年按 100% 清缴；2026 年对 2025 排放的清缴比例为 70%。通常欧盟内及港内 100%，进出欧盟 50%。',
    summaryEn:'2026 emissions include CH₄/N₂O and require 100% surrender in 2027; 2025 emissions surrendered in 2026 use 70%. Generally 100% intra-EU/port and 50% extra-EU.' },
  { id:'fuel', zh:'FuelEU：年度强度与赤字', en:'FuelEU: annual intensity and deficit', status:'law',
    url:'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1805', clause:'Regulation (EU) 2023/1805 · Art. 4, 23; Annex IV',
    summaryZh:'参考强度 91.16；2025–2029 降 2%，2030 起降 6%。连续缺口需考虑加成。此原型不模拟岸电、RFNBO 奖励、冰区与认证燃料完整方法。',
    summaryEn:'Reference intensity 91.16; a 2% reduction in 2025–2029 and 6% from 2030. Repeated deficits escalate penalties. OPS, RFNBO rewards, ice adjustments and full certified-fuel methods are outside this model.' },
  { id:'pool', zh:'FuelEU：组池可行性', en:'FuelEU: pooling conditions', status:'law',
    url:'https://transport.ec.europa.eu/transport-modes/maritime/decarbonising-maritime-transport-fueleu-maritime/questions-and-answers-regulation-eu-20231805-use-renewable-and-low-carbon-fuels-maritime-transport_en',
    clause:'Art. 20–21 · Commission implementation Q&A',
    summaryZh:'真实组池须满足参与、年度、分配和核验条件；本页只模拟可用盈余与价格，不连接 FuelEU 数据库。盈余价格由商业协议决定。',
    summaryEn:'Real pooling requires eligible participants, reporting periods, allocation and verification. This page simulates available surplus and prices; it is not connected to the FuelEU database. Prices are privately agreed.' },
  { id:'uk', zh:'UK ETS：国内与港内活动', en:'UK ETS: domestic and in-port activity', status:'law',
    url:'https://www.gov.uk/guidance/uk-emissions-trading-scheme-for-maritime-how-to-comply', clause:'UK ETS maritime guidance · scope and surrender',
    summaryZh:'2026-07-01 起，符合条件的 ≥5,000 GT 船舶国内及港内活动纳入三种气体。首期为 2026 年 7–12 月，首次清缴期限为 2028-04-30。北爱—大不列颠等例外需另核。',
    summaryEn:'Eligible ships ≥5,000 GT enter for domestic/in-port activity from 1 July 2026, covering three gases. First period: July–December 2026; first surrender deadline: 30 April 2028. NI–GB and other exceptions require separate review.' },
  { id:'imo', zh:'IMO：草案与续会安排', en:'IMO: draft and resumed negotiations', status:'proposal',
    url:'https://www.imo.org/en/mediacentre/meetingsummaries/pages/iswg-ghg-22.aspx', clause:'ISWG-GHG 22 · September 2026 meeting summary',
    summaryZh:'草案获批不等于采纳、生效。特别会议拟于 2026-12-04 续会，仍取决于 MEPC 85 讨论；不据此更改现行区域账单。',
    summaryEn:'Draft approval is distinct from adoption and entry into force. The extraordinary session is scheduled to resume on 4 December 2026, subject to MEPC 85 discussions; regional bills do not change automatically.' },
  { id:'charter', zh:'租约：责任与偿付', en:'Charters: responsibility and reimbursement', status:'contract',
    url:'https://www.bimco.org/contractual-affairs/bimco-clauses/current-clauses/etsa_clause/', clause:'BIMCO ETS Time Charter Clause 2022',
    summaryZh:'合同偿付与法定义务应分列。85/15、18/82 和 50/50 均为本页可编辑示例，不是 GENCON、NYPE 或 BIMCO 的默认比例。',
    summaryEn:'Contractual reimbursement and statutory responsibility are separate. Editable 85/15, 18/82 and 50/50 presets are examples, not GENCON, NYPE or BIMCO defaults.' },
  { id:'ports', zh:'邻近集装箱转运港', en:'Neighbouring container transhipment ports', status:'law',
    url:'https://emsa.europa.eu/reducing-emissions/extension-ets/faq-extension-ets.html', clause:'Port-of-call definition · neighbouring container transhipment ports',
    summaryZh:'300 海里并非通用征税圈。须按船型、港口性质及官方名单判断；集装箱转运港可能需要追溯上游有效挂靠港。地图不自动判定适用范围。',
    summaryEn:'300 nm is not a general tax zone. Ship type, call purpose and official lists matter; container transhipment may require tracing the previous qualifying call. The map does not determine legal scope.' }
];

export const scenarios = [
  { id:'as_is', zh:'原样通过', en:'Adopted as agreed', clients:60, contribution:3000, fixedCost:210000,
    triggerZh:'正式采纳文本和实施时间表公布后，才确认全球模块需求。', triggerEn:'Confirm the global-module scope only after an adopted text and implementation timetable are published.',
    actionZh:'验证全球模块与新增字段；保留区域规则；在 €210k 固定预算下先验证续订和支持能力，贡献不足则暂停扩张。',
    actionEn:'Validate the global module and new fields; retain regional rules. Test renewals and support capacity under a €210k fixed budget; pause expansion if contribution is insufficient.' },
  { id:'amended', zh:'修订后通过', en:'Adopted with amendments', clients:65, contribution:3000, fixedCost:200000,
    triggerZh:'范围、方法或起始时间改变，以正式文本为触发。', triggerEn:'Changes to scope, methodology or start date trigger work when confirmed in the adopted text.',
    actionZh:'保留旧输出、重做差异评估；评估数据结构及开发工时，不假设只需调参；定制工作单独约定。',
    actionEn:'Preserve previous outputs and assess differences. Budget data-model and engineering changes instead of assuming parameter-only updates; scope custom work separately.' },
  { id:'deadlock', zh:'持续僵局', en:'Continued deadlock', clients:55, contribution:3200, fixedCost:180000,
    triggerZh:'持续没有已采纳全球框架，定期检查官方谈判记录。', triggerEn:'No adopted global framework; check official negotiation records periodically.',
    actionZh:'聚焦现行区域核算、数据质量和合同对账；缩减推测性研发。区域需求仍在，但并不保证获客、融资和经营存续。',
    actionEn:'Focus on current regional calculations, data quality and reimbursement. Reduce speculative development. Continuing regional demand does not guarantee customers, funding or survival.' }
];

export const risks = [
  ['规则变更','Rule changes','法规负责人','Regulatory lead','官方来源、版本与第二人复核（流程规划）','Official sources, versioning and second-person review (planned)','解释差异与持续维护成本','Interpretation differences and maintenance cost'],
  ['数据与模型','Data and model','数据负责人','Data lead','缺失气体保留空值；只显示 CO₂ 小计；关键算式回归检查','Keep missing gases null; show CO₂ subtotals; regression checks for core calculations','原始记录、范围和模型系数待核实','Source records, scope and coefficients remain unverified'],
  ['获客与续订','Acquisition and retention','商业负责人','Commercial lead','计划 12 家访谈、3 家付费试点；按真实续订意愿决定扩张','Plan 12 interviews and 3 paid pilots; expand on measured renewal intent','客户不足、价值未覆盖价格','Too few customers or value below price'],
  ['交付工时','Delivery workload','运营负责人','Operations lead','记录质控和支持工时；16h→32h 敏感性测算','Measure quality-control/support hours; compare 16h and 32h QC assumptions','人工成本超预算','Labour cost exceeding budget'],
  ['数据安全与责任','Security and liability','治理负责人','Governance lead','本页无后台或船载连接；正式服务的隔离、恢复与责任条款仍需验证','No backend or shipboard connection here; tenant isolation, recovery and liability terms need validation','正式服务尚未建立控制证据','No operational-service assurance yet']
];
