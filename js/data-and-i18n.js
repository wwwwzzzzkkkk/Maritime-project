/* ==========================================================================
   MultiReg Maritime Compliance & Digital Twin Platform (Maritime-project)
   Bilingual Data Store (CN / EN) & Deterministic Multi-Regime Calculation Engine
   Strictly aligned with MT6503 Venture Report (Appendices A1, A2, A3) & Course Slides
   ========================================================================== */

window.MAREG_DATA = {
  lang: 'zh',
  selectedVesselId: 'v1',
  selectedScenario: 'deadlock', // 'as_is' | 'amended' | 'deadlock'
  selectedLegFilter: 'all',

  // Interactive Digital Twin Sandbox State
  twinState: {
    euaPrice: 80,            // EUR / tCO2 (Appendix A3 base = 80, sensitivity 60 / 100)
    ukEtsPrice: 60,          // GBP / tCO2 (Appendix A3 base = 60)
    fueleuTargetCut: 2.0,    // 2.0% (2025-2029) vs 6.0% (2030 / Amended stress condition)
    biofuelBlendPct: 0,      // 0% to 50% certified B30/e-Methanol blend
    jitSpeedDeltaKn: 0,      // 0 to -2.0 knots (Week 8 JIT Cube Law speed reduction)
    poolingSurplusTonnes: 0, // 0 to 400 tCO2e external/internal verified pool offset
    charterType: 'voyage_gencon', // 'voyage_gencon' | 'time_nype_bimco' | 'split_blue_ga'
    advisorSavingsEur: 2000, // Appendix A1: €2,000 cancellable external consultant fee
    hoursSaved: 120          // Appendix A1: 240h -> 120h (120h saved @ €40/h)
  },

  // 5-Vessel SME Fleet (Anchored by Appendix A3 10,000 GT Cargo Ship & Lecture 3/8 60,000 DWT Panamax)
  vessels: [
    {
      id: 'v1',
      nameZh: 'MV A3-BENCHMARK（附录A3基准货船）',
      nameEn: 'MV A3-BENCHMARK (Appendix A3 Reference Cargo)',
      imo: 'IMO 9841023',
      typeZh: '多用途远洋货船 (General Cargo)',
      typeEn: 'General Cargo Vessel',
      gt: 10000,
      dwt: 14500,
      serviceSpeedKn: 13.5,
      fuelType: 'VLSFO',
      actualWtWIntensity: 91.6, // gCO2e/MJ (Appendix A3)
      euEnergyMJ: 164000000,    // 164,000,000 MJ (Appendix A3 exact figure)
      ch4N2oVerified: false,    // Appendix A3: 2026 CH4/N2O missing -> blocked from zero-default
      legs: [
        { id: 'E1', code: 'EU-E1', routeZh: '非欧盟 ↔ 鹿特丹 (Extra-EU)', routeEn: 'Non-EU ↔ Rotterdam (Extra-EU)', regime: 'EU ETS', co2Tonnes: 1000, coveragePct: 0.50, coveredTonnes: 500, currency: 'EUR', status: 'in-force' },
        { id: 'E2', code: 'EU-E2', routeZh: '鹿特丹 → 汉堡 (Intra-EU)', routeEn: 'Rotterdam → Hamburg (Intra-EU)', regime: 'EU ETS', co2Tonnes: 500, coveragePct: 1.00, coveredTonnes: 500, currency: 'EUR', status: 'in-force' },
        { id: 'E3', code: 'EU-E3', routeZh: '欧盟港内停泊 (EU Berth)', routeEn: 'EU Port at Berth (Intra-EU)', regime: 'EU ETS', co2Tonnes: 100, coveragePct: 1.00, coveredTonnes: 100, currency: 'EUR', status: 'in-force' },
        { id: 'U1', code: 'UK-U1', routeZh: '英国国内航段 (UK Domestic)', routeEn: 'UK Domestic Leg (Post Jul-2026)', regime: 'UK ETS', co2Tonnes: 200, coveragePct: 1.00, coveredTonnes: 200, currency: 'GBP', status: 'in-force' },
        { id: 'U2', code: 'UK-U2', routeZh: '英国港内停泊 (UK Berth)', routeEn: 'UK Port at Berth (Post Jul-2026)', regime: 'UK ETS', co2Tonnes: 20, coveragePct: 1.00, coveredTonnes: 20, currency: 'GBP', status: 'in-force' }
      ]
    },
    {
      id: 'v2',
      nameZh: 'MV PACIFIC HORIZON（课件6万吨巴拿马散货）',
      nameEn: 'MV PACIFIC HORIZON (Lecture 3/8 60k DWT Panamax)',
      imo: 'IMO 9792214',
      typeZh: '巴拿马型散货船 (Panamax Bulker)',
      typeEn: 'Panamax Bulk Carrier',
      gt: 35800,
      dwt: 60000,
      serviceSpeedKn: 12.5,
      fuelType: 'HFO / VLSFO',
      actualWtWIntensity: 91.6,
      euEnergyMJ: 164000000,
      ch4N2oVerified: true,
      legs: [
        { id: 'E1', code: 'EU-E1', routeZh: '上海 → 鹿特丹 (Extra-EU 50%)', routeEn: 'Shanghai → Rotterdam (Extra-EU 50%)', regime: 'EU ETS', co2Tonnes: 12456, coveragePct: 0.50, coveredTonnes: 6228, currency: 'EUR', status: 'in-force' },
        { id: 'E2', code: 'EU-E2', routeZh: '鹿特丹 → 安特卫普 (Intra-EU 100%)', routeEn: 'Rotterdam → Antwerp (Intra-EU 100%)', regime: 'EU ETS', co2Tonnes: 5228, coveragePct: 1.00, coveredTonnes: 5228, currency: 'EUR', status: 'in-force' },
        { id: 'E3', code: 'EU-E3', routeZh: '欧盟港内停泊 (EU Berth 100%)', routeEn: 'EU Port at Berth (100%)', regime: 'EU ETS', co2Tonnes: 1000, coveragePct: 1.00, coveredTonnes: 1000, currency: 'EUR', status: 'in-force' },
        { id: 'U1', code: 'UK-U1', routeZh: '英国沿海转港 (UK Domestic)', routeEn: 'UK Domestic Coastal Call', regime: 'UK ETS', co2Tonnes: 380, coveragePct: 1.00, coveredTonnes: 380, currency: 'GBP', status: 'in-force' },
        { id: 'U2', code: 'UK-U2', routeZh: '英国港内停泊 (UK Berth)', routeEn: 'UK Port at Berth', regime: 'UK ETS', co2Tonnes: 40, coveragePct: 1.00, coveredTonnes: 40, currency: 'GBP', status: 'in-force' }
      ]
    },
    {
      id: 'v3',
      nameZh: 'MV NORDIC BREEZE（支线集装箱船 14,200 GT）',
      nameEn: 'MV NORDIC BREEZE (Feeder Containership 14,200 GT)',
      imo: 'IMO 9810456',
      typeZh: '支线集装箱船 (Feeder Container)',
      typeEn: 'Feeder Containership',
      gt: 14200,
      dwt: 18900,
      serviceSpeedKn: 15.0,
      fuelType: 'VLSFO + B24 Biofuel',
      actualWtWIntensity: 88.2, // Compliant surplus ship!
      euEnergyMJ: 142000000,
      ch4N2oVerified: true,
      legs: [
        { id: 'E1', code: 'EU-E1', routeZh: '丹吉尔 ↔ 鹿特丹 (Extra-EU)', routeEn: 'Tanger Med ↔ Rotterdam', regime: 'EU ETS', co2Tonnes: 1400, coveragePct: 0.50, coveredTonnes: 700, currency: 'EUR', status: 'in-force' },
        { id: 'E2', code: 'EU-E2', routeZh: '鹿特丹 ↔ 不来梅港 (Intra-EU)', routeEn: 'Rotterdam ↔ Bremerhaven', regime: 'EU ETS', co2Tonnes: 950, coveragePct: 1.00, coveredTonnes: 950, currency: 'EUR', status: 'in-force' },
        { id: 'E3', code: 'EU-E3', routeZh: '欧盟港内停泊 (EU Berth)', routeEn: 'EU Port at Berth', regime: 'EU ETS', co2Tonnes: 180, coveragePct: 1.00, coveredTonnes: 180, currency: 'EUR', status: 'in-force' },
        { id: 'U1', code: 'UK-U1', routeZh: '费利克斯托 ↔ 南安普顿 (UK)', routeEn: 'Felixstowe ↔ Southampton', regime: 'UK ETS', co2Tonnes: 310, coveragePct: 1.00, coveredTonnes: 310, currency: 'GBP', status: 'in-force' },
        { id: 'U2', code: 'UK-U2', routeZh: '英国港内停泊 (UK Berth)', routeEn: 'UK Port at Berth', regime: 'UK ETS', co2Tonnes: 35, coveragePct: 1.00, coveredTonnes: 35, currency: 'GBP', status: 'in-force' }
      ]
    }
  ],

  // 3 IMO Scenarios (Venture Report Section 5 + Stress Test Supplement)
  scenarios: {
    as_is: {
      id: 'as_is',
      tagStatus: 'pending',
      titleZh: '情景 1：IMO 净零框架原样通过 (Adopted as-is)',
      titleEn: 'Scenario 1: IMO Net-Zero Framework Adopted As-Is',
      triggerZh: '以 2028 实施时间表与最终文件公布为触发，验证全球双层 GFI 模块与 Net-Zero Fund 奖励/补偿机制；区域法规未正式废止前保留双轨核算。',
      triggerEn: 'Triggered upon official adoption & 2028 entry-into-force schedule; activates global two-tier GFI & Net-Zero Fund calculations alongside active regional rules.',
      globalSurchargeFactor: 0.35, // Additional global remedial tier exposure if unmitigated
      platformClients: 60,
      contributionPerClient: 3000,
      fixedCostEur: 210000,
      operatingResultEur: -30000,
      breakEvenClients: 70,
      strategyZh: '转向全球+区域双轨实施预算与清洁燃料先行者红利测算；若持续性收入贡献不足以覆盖新增规则维护成本（€210,000），暂停扩张。',
      strategyEn: 'Shift policy reports to dual-track implementation budgeting; pause expansion if recurring contribution fails to cover higher €210k rule-engineering cost.'
    },
    amended: {
      id: 'amended',
      tagStatus: 'assumption',
      titleZh: '情景 2：IMO 框架修订后通过 (Adopted but amended)',
      titleEn: 'Scenario 2: IMO Framework Adopted but Amended',
      triggerZh: '范围、起始日或核算方法发生重大修改即触发调整；保留旧输出、解释差异并经专家批准后更新版本化公式。',
      triggerEn: 'Triggered when scope, start dates, or GFI thresholds are weakened/amended; retains historical outputs and updates versioned formulas after approval.',
      globalSurchargeFactor: 0.15,
      platformClients: 65,
      contributionPerClient: 3000,
      fixedCostEur: 200000,
      operatingResultEur: -5000,
      breakEvenClients: 67,
      strategyZh: '高频支持多版本政策参数对比与分阶段合规调整；定制分析事先约定范围及报价，现有客户按合同获得应有更正。',
      strategyEn: 'Support multi-version parameter comparisons; scope custom revision work upfront while delivering contractual rule updates to base clients.'
    },
    deadlock: {
      id: 'deadlock',
      tagStatus: 'in-force',
      titleZh: '情景 3：全球谈判持续僵局 (Continued deadlock)',
      titleEn: 'Scenario 3: Continued IMO Deadlock (Regional Patchwork)',
      triggerZh: 'IMO 2025年10月特别会议延期后持续僵持，全球统一碳价缺位；平台聚焦现行生效的 EU ETS、FuelEU 与 UK ETS 区域拼凑格局。',
      triggerEn: 'Global talks remain stalled following MEPC ES.2 adjournment; platform anchors on in-force EU ETS, FuelEU, and UK ETS patchwork.',
      globalSurchargeFactor: 0.0,
      platformClients: 55,
      contributionPerClient: 3200,
      fixedCostEur: 180000,
      operatingResultEur: -4000,
      breakEvenClients: 57,
      strategyZh: '无悔核心业务（多区域合规核算+租约分摊）价值最大化；商业建议倾向于类 Pacific Basin 的“分阶段投入、保留期权（Optionality）”策略。',
      strategyEn: 'Maximizes No-Regret Core value (multi-region compliance + charterparty split); recommends Pacific Basin-style staged optionality over premature CAPEX.'
    }
  },

  // Guardrailed AI Regulatory Intelligence Feed (Section 2 & 3)
  aiFeed: [
    {
      id: 'pol-1',
      status: 'in-force',
      badgeZh: '已生效法规 IN-FORCE',
      badgeEn: 'IN-FORCE LAW',
      date: '2026-01-01',
      source: 'EU ETS Directive 2003/87/EC & MRV Reg (EU) 2015/757',
      titleZh: 'EU ETS 2026 清缴比例升至 100%，并纳入 CH4 与 N2O',
      titleEn: 'EU ETS Surrender Reaches 100% in 2026; CH4 & N2O Included',
      summaryZh: '适用 ≥5,000 GT 货船与客船；欧盟内航段与港内 100% 覆盖，进出欧盟 50% 覆盖；2026 排放于 2027年9月30日前履约。缺失 CH4/N2O 数据不得默认归零。',
      summaryEn: 'Covers ≥5,000 GT cargo/passenger vessels (100% intra-EU/berth, 50% extra-EU). Missing CH4/N2O records cannot be defaulted to zero.',
      humanReview: false
    },
    {
      id: 'pol-2',
      status: 'in-force',
      badgeZh: '已生效法规 IN-FORCE',
      badgeEn: 'IN-FORCE LAW',
      date: '2025-01-01 / 2030-01-01',
      source: 'Regulation (EU) 2023/1805 (FuelEU Maritime Art. 4 & Annex IV)',
      titleZh: 'FuelEU 全生命周期强度目标：2025 降 2%（89.34）→ 2030 降 6%（85.69）',
      titleEn: 'FuelEU WtW Intensity Limit: -2% (89.34) in 2025 → -6% (85.69) in 2030',
      summaryZh: '按船上能源使用量与 WtW 强度核算年度合规余额；赤字按 €2,400/吨 VLSFO 等效能源（41,000 MJ/t）计罚。组池（Pooling）须经核验且不可同时借用。',
      summaryEn: 'Annual WtW GHG intensity balance; uncovered deficit penalized at €2,400/t VLSFO-eq. Pooling requires accredited verification.',
      humanReview: false
    },
    {
      id: 'pol-3',
      status: 'in-force',
      badgeZh: '英国新规 IN-FORCE (2026.07)',
      badgeEn: 'UK ETS IN-FORCE (JUL 2026)',
      date: '2026-07-01',
      source: 'UK ETS Authority Maritime Expansion Response (2026)',
      titleZh: 'UK ETS 自 2026年7月1日纳入 ≥5,000 GT 国内海事活动与港口停靠',
      titleEn: 'UK ETS Covers ≥5,000 GT Domestic Maritime & Port Calls from 1 Jul 2026',
      summaryZh: '覆盖 CO2、CH4 与 N2O；首个履约期为 2026年7–12月；离岸船自 2027 年纳入。国际航段扩围不可简单照搬欧盟 50% 规则，英镑与欧元须分列。',
      summaryEn: 'Covers CO2, CH4, and N2O; first period Jul–Dec 2026. International voyage scope requires legal review and cannot blindly copy EU 50% rule.',
      humanReview: true
    },
    {
      id: 'pol-4',
      status: 'pending',
      badgeZh: '待审提案 PENDING',
      badgeEn: 'PENDING IMO PROPOSAL',
      date: '2025-10 / 2026-10',
      source: 'IMO MEPC 83 Approved Draft / MEPC ES.2 Adjournment Record',
      titleZh: 'IMO 净零框架（NZF）采纳讨论延期一年，处于政治不确定期',
      titleEn: 'IMO Net-Zero Framework (NZF) Adoption Adjourned 1 Year Amid Geopolitics',
      summaryZh: '2025年4月批准草案，但10月特别会议以 57:49 延期一年。平台仅将其作为三种压力测试情景条件，严禁在未核对最新官方记录前混入法定必缴账单。',
      summaryEn: 'Draft approved Apr 2025, adjourned Oct 2025. Treated strictly as stress-test scenarios, never blended into mandatory in-force budgets.',
      humanReview: true
    }
  ],

  // Interactive AI Q&A Knowledge Base (Zero-hallucination evidence-grounded answers)
  aiPrompts: [
    {
      id: 'q1',
      qZh: '为什么 2026 年 EU ETS 示例只单列 CO2，缺失的 CH4/N2O 能填 0 吗？',
      qEn: 'Why does the 2026 EU ETS baseline isolate CO2, and can missing CH4/N2O be set to 0?',
      aZh: '【法规依据：EU MRV 修订条例 & 报告第2/3节】自 2026 年起 EU ETS 正式纳入甲烷（CH4）和氧化亚氮（N2O）。本平台数据质检层（Data Hygiene Gate）严禁将缺失的 CH4/N2O 记录默认当成零——因为“填零”会导致预算严重低估并触发合规审计风险。系统已自动单列已核验的 CO2 部分（1,100 吨 → €88,000），并挂起黄色数据缺口预警，待船队补充油样与主机滑失系数后再合并完整总额。',
      aEn: '[Legal Basis: Amended EU MRV Reg & Report §2/§3] From 2026, EU ETS prices CH4 and N2O alongside CO2. Our Data Hygiene Gate strictly prohibits defaulting missing CH4/N2O fields to zero, as doing so understates liabilities and creates audit discrepancies. The engine outputs the verified CO2 portion (1,100 t → €88,000) and flags an explicit data gap alert until slip factors are uploaded.',
      statusTag: 'in-force',
      expertFlag: false
    },
    {
      id: 'q2',
      qZh: '如果 IMO 净零框架继续僵局或预测失准，我们的平台会倒闭吗？',
      qEn: 'If the IMO Net-Zero Framework remains deadlocked or forecasts miss, does our venture fail?',
      aZh: '【项目诊所依赖项拆解：Name Your Dependency】绝不会倒闭。平台的“无悔核心业务（No-Regret Core）”是现行已生效的区域碎片化法规核算（EU ETS + FuelEU + UK ETS）与 NYPE/GENCON 租约碳成本分摊。远期 IMO 政策情景模拟仅属于附加分析模块：即便全球谈判长期僵局（情景 3），中小船东跨欧英航线的多制度合规与租约对账痛点依然刚性存在，平台仅需 57 家基础客户即可实现经营盈亏平衡。',
      aEn: '[Project Clinic: Name Your Dependency] No. Our No-Regret Core is multi-regional compliance accounting (EU ETS + FuelEU + UK ETS) and NYPE/GENCON charterparty cost allocation. Long-term IMO scenario simulation is a value-added stress-test module; under Continued Deadlock (Scenario 3), regional patchwork friction remains acute and our venture breaks even at just 57 base clients.',
      statusTag: 'assumption',
      expertFlag: false
    },
    {
      id: 'q3',
      qZh: '当前 10,000 GT 货船在 FuelEU 2% 与 2030 年 6% 目标下，直接交罚款还是做燃料/组池调整？',
      qEn: 'For our 10,000 GT vessel under 2% vs 6% FuelEU targets, should we pay penalties, switch fuel, or pool?',
      aZh: '【确定性公式对比 & 专家复核触发】在 164,000,000 MJ 年度欧盟能源基准下：① 2025–2029（-2% 目标 89.3368 gCO2e/MJ）合规赤字为 371.165 吨，罚款 €237,191.27；② 2030（-6% 目标 85.6904）赤字扩大至 969.174 吨，罚款跃升至 €619,346.72。建议：短期可通过约 15%–20% 认证生物燃料掺烧或接入合规组池（Pooling）消除赤字；但请注意【绿色燃料港口加注瓶颈】与【组池核验约束】，涉及重大燃料改造投资已自动触发 [需专家复核 Expert Review Required]。',
      aEn: '[Deterministic Formula & Expert Review Trigger] At 164,000,000 MJ EU-scoped energy: (1) 2025–2029 (-2% limit 89.3368 gCO2e/MJ) yields a 371.165 t deficit and €237,191.27 penalty; (2) 2030 (-6% limit 85.6904) jumps to a 969.174 t deficit and €619,346.72 penalty. Short-term B24/B30 biofuel blending or verified FuelEU pooling is cheaper than paying €2,400/t VLSFO-eq, subject to bunker availability and verifier lock-in.',
      statusTag: 'pending',
      expertFlag: true
    }
  ],

  // Appendix A2 Risk Register
  riskRegister: [
    { riskZh: '规则错误或失效', riskEn: 'Rule Error or Obsolescence', level: 'High / Med', ownerZh: '法规负责人', ownerEn: 'Regulatory Lead', controlZh: '核对官方条文来源、双人批准、版本化回归测试；重大修订时冻结旧输出。', controlEn: 'Source verification, dual sign-off, regression tests; freeze output during major revisions.', residualZh: '法律解释分歧', residualEn: 'Legal interpretation divergence' },
    { riskZh: '缺失或错误数据 (GIGO)', riskEn: 'Missing or Faulty Input Data', level: 'High / Med', ownerZh: '数据负责人', ownerEn: 'Data Lead', controlZh: '自动检查单位、航段重复与完整性；缺关键字段（如CH4/N2O）拦截完整总额输出。', controlEn: 'Automated unit, duplicate & completeness checks; block final totals if key gases are missing.', residualZh: '客户原始台账记录错误', residualEn: 'Client source log inaccuracy' },
    { riskZh: 'AI 解释或建议失误', riskEn: 'AI Explanation / Advisory Hallucination', level: 'High / Med', ownerZh: '技术负责人', ownerEn: 'Tech Lead', controlZh: '财务数字100%由确定性公式生成；AI实施来源约束与证据追溯，重大决策转专家复核。', controlEn: '100% deterministic math; RAG source constraints + Human-in-the-loop expert review.', residualZh: '貌似合理的语境偏差', residualEn: 'Plausible contextual nuance gap' },
    { riskZh: '隐私或网络安全事件', riskEn: 'Privacy or Cybersecurity Incident', level: 'High / Med', ownerZh: '安全负责人', ownerEn: 'Security Lead', controlZh: '首版采用表格导入导出，不连船载OT系统；租户数据隔离加密与恢复测试（参考IACS E26/E27边界）。', controlEn: 'Spreadsheet ingestion only (no shipboard OT link in v1); tenant encryption & backup tests.', residualZh: '第三方云基础设施泄露', residualEn: 'Third-party cloud breach' },
    { riskZh: '责任边界与漂绿指控', riskEn: 'Liability & Greenwashing Accusation', level: 'High / Med', ownerZh: '治理负责人', ownerEn: 'Governance Lead', controlZh: '严格区分“预算估算”与“法定核验认证”，双轨分列“财务账单变化”与“物理生命周期排放”。', controlEn: 'Separate budget estimates from accredited verification; dual-track financial vs physical WtW emissions.', residualZh: '赔偿与声誉残余风险', residualEn: 'Residual reputational risk' }
  ],

  // Bilingual UI Strings
  i18n: {
    zh: {
      appTitle: 'MAREG 智航合规驾驶舱',
      appSub: 'MAREG STUDIO · v3.4',
      vesselLabel: '当前选中船舶 (SME 5船队)',
      navSectionCore: '核心功能模块 (5 MODULES)',
      navTab1: '1. 全息航线与合规驾驶舱',
      navTab2: '2. 白盒公式审计与反漂绿',
      navTab3: '3. 数字孪生与租约分摊沙盒',
      navTab4: '4. IMO 三情景压力测试台',
      navTab5: '5. 受控 AI 雷达与商业模型',
      boundaryTitle: '概念原型与合规免责边界',
      boundaryDesc: '本系统为决策辅助原型，不替代授权核验方（Verifier）或海事律师意见；EUR 与 GBP 严格分列，不混加未授权汇率。',
      headerTitle: '海事多法规合规成本分析与数字孪生决策平台',
      scenarioLabel: 'IMO 压力情景:',
      scenAsIs: '1. 原样通过',
      scenAmended: '2. 修订通过',
      scenDeadlock: '3. 持续僵局',
      auditBtn: '查看 A3 审计链日志',
      kpi1Label: 'EU ETS 年度配额账单 (欧元单列)',
      kpi2Label: 'FuelEU 强度合规罚款 (欧元单列)',
      kpi3Label: 'UK ETS 国内海事账单 (英镑单列)',
      kpi4Label: '租约下船东净承担比例 (欧元部分)',
      cockpitLeftTitle: '船舶数字孪生快速调节器',
      cockpitLeftSub: '拖动滑块实时重算多制度合规成本与物理排放',
      cockpitMapTitle: '亚欧—英国跨管辖区航线数字孪生拓扑图',
      cockpitMapSub: '自动识别航段司法边界（EU 50% / 100% / UK ETS），点击航段过滤台账',
      cockpitRightTitle: '分制度核算卡片与 AI 预警',
      cockpitRightSub: '版本化公式计算 · 杜绝通用碳价掩盖规则差异'
    },
    en: {
      appTitle: 'MAREG COMPLIANCE COCKPIT',
      appSub: 'MAREG STUDIO · v3.4',
      vesselLabel: 'ACTIVE VESSEL (5-SHIP SME FLEET)',
      navSectionCore: 'CORE WORKBENCH (5 MODULES)',
      navTab1: '1. Holographic Cockpit & Route Twin',
      navTab2: '2. White-Box Audit & Anti-Greenwash',
      navTab3: '3. Digital Twin & Charterparty Split',
      navTab4: '4. IMO 3-Scenario Stress-Test Matrix',
      navTab5: '5. Guardrailed AI & A1 Unit Economics',
      boundaryTitle: 'Prototype & Legal Liability Boundary',
      boundaryDesc: 'Conceptual decision-support prototype; does not replace accredited MRV verifiers or legal counsel. EUR & GBP strictly separated.',
      headerTitle: 'Multi-Regime Maritime Carbon Compliance & Digital Twin Platform',
      scenarioLabel: 'IMO SCENARIO:',
      scenAsIs: '1. Adopted As-Is',
      scenAmended: '2. Amended',
      scenDeadlock: '3. Deadlock',
      auditBtn: 'Inspect A3 Audit Log',
      kpi1Label: 'EU ETS Annual Allowance Bill (EUR Only)',
      kpi2Label: 'FuelEU Intensity Penalty (EUR Only)',
      kpi3Label: 'UK ETS Domestic Bill (GBP Separate)',
      kpi4Label: 'Owner Net Share under Charterparty (EUR)',
      cockpitLeftTitle: 'Vessel Digital Twin Quick Controls',
      cockpitLeftSub: 'Adjust telemetry sliders to recompute multi-regime costs & WtW emissions',
      cockpitMapTitle: 'Asia–Europe–UK Multi-Jurisdiction Route Digital Twin',
      cockpitMapSub: 'Auto-maps voyage legs across EU 50%, EU 100%, and UK ETS boundaries',
      cockpitRightTitle: 'Regime Breakdown & Guardrailed Alerts',
      cockpitRightSub: 'Versioned deterministic formulas · No blended generic carbon price'
    }
  }
};
