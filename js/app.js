import { MODEL_VERSION, ASSUMPTIONS, defaultSettings, computeScenario, compareOptions } from './compliance-engine.mjs';
import { createMobileBudget } from './mobile-budget.mjs';
import { vessels as modelVessels, ports as modelPorts, sources as officialSources, scenarios as ventureScenarios, checkedAt } from './light-data.mjs';
/* ==========================================================================
   MAREG — Core Deterministic Engine, Real GIS Maritime Map & Spatial 3D Tilt UI (v3.2)
   Fixes:
   1. 100% Aligned DOM IDs with index.html & data-and-i18n.js (Zero runtime errors)
   2. Guaranteed Leaflet GIS Map Initialization + Multi-Stage invalidateSize()
   3. Dedicated Camera Preset Switcher (Eurasia / Europe+UK / Suez & Gibraltar 300nm)
   4. Leaflet-Safe 3D Spatial Tilt Engine (Never distorts map canvas or toolbar clicks)
   ========================================================================== */

(function () {
  const state = window.MAREG_DATA;
  // Independent per-page state; the shared v3 source file is not edited.
  state.vessels = state.vessels.map(v => ({...v, imo:`DEMO-${v.id.toUpperCase()}`, ch4N2oVerified:false}));
  for(const scenario of ventureScenarios) {
    Object.assign(state.scenarios[scenario.id],{
      triggerZh:scenario.triggerZh,triggerEn:scenario.triggerEn,
      strategyZh:scenario.actionZh,strategyEn:scenario.actionEn,
      tagStatus:'assumption'
    });
  }
  for (const lang of ['zh','en']) {
    Object.assign(state.i18n[lang], lang==='zh'?{
      kpi1Label:'EU ETS · CO₂ 部分预算（欧元）',kpi2Label:'FuelEU 简化罚款估算（欧元）',
      kpi3Label:'UK ETS · CO₂ 部分预算（英镑）',kpi4Label:'船东承担金额估算（欧元合规部分）',
      cockpitMapTitle:'亚欧—英国示例航线与预设活动范围',
      cockpitLeftSub:'实时比较预算与范围内 WtW 模型估算；系数为教学假设'
    }:{
      kpi1Label:'EU ETS CO₂ Subtotal (EUR)',kpi2Label:'FuelEU Model Penalty (EUR)',
      kpi3Label:'UK ETS CO₂ Subtotal (GBP)',kpi4Label:'Estimated Owner Allocation (EUR Compliance)',
      cockpitMapTitle:'Asia–Europe–UK Illustrative Route & Preset Activities',
      cockpitLeftSub:'Compare budgets and in-scope WtW model estimates; teaching coefficients'
    });
  }
  state.aiFeed = officialSources.filter(s=>['eu','fuel','uk','imo'].includes(s.id)).map(s=>({
    status:s.status==='proposal'?'pending':'in-force',badgeZh:s.status==='proposal'?'待采纳草案':'现行规则参考',
    badgeEn:s.status==='proposal'?'DRAFT':'RULE REFERENCE',date:checkedAt,source:s.clause,url:s.url,
    titleZh:s.zh,titleEn:s.en,summaryZh:s.summaryZh,summaryEn:s.summaryEn
  }));
  state.riskRegister.push({riskZh:'获客、续订与交付工时',riskEn:'Acquisition, Renewal & Delivery Workload',level:'High / Med',ownerZh:'商业 / 运营负责人',ownerEn:'Commercial / Operations Lead',controlZh:'访谈及付费试点为计划；记录实际质控与支持工时，验证净价值和续订意愿。',controlEn:'Interviews and paid pilots are planned; measure actual QC/support effort, net value and renewal intent.',residualZh:'客户不足、成本超支与资金缺口',residualEn:'Too few customers, cost overruns and funding gaps'});
  state.riskRegister[1].controlZh='缺失气体保留空值；当前仅计算 CO₂ 部分，未宣称完整 ETS 总额。';
  state.riskRegister[1].controlEn='Keep missing gases null; calculate CO₂ subtotals without claiming complete ETS totals.';
  state.riskRegister[2].controlZh='当前为预设解释模板，不连接 AI 或检索服务；重大建议仍需专业复核。';
  state.riskRegister[2].controlEn='Preset explanations only, without AI or retrieval; material decisions still need professional review.';
  state.riskRegister[3].controlZh='当前无后台和船载连接；正式服务的隔离、加密与恢复测试属于待验证计划。';
  state.riskRegister[3].controlEn='No backend or shipboard connection; isolation, encryption and recovery tests are unverified plans.';
  let deferredCamera = null;
  let originalE1Coordinates;
  let snapshot;
  let mobileBudget;

  let leafletMap = null;
  let mapLayers = {};
  let currentTabIndex = 0;
  let activePromptId = 'q1';

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function setHTML(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }

  function fmtNum(val, decimals = 0) {
    return Number(val).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  function fmtEur(val, decimals = 0) {
    const sign = val < 0 ? '-' : '';
    return sign + '€' + fmtNum(Math.abs(val), decimals);
  }

  function fmtGbp(val, decimals = 0) {
    const sign = val < 0 ? '-' : '';
    return sign + '£' + fmtNum(Math.abs(val), decimals);
  }

  function getActiveVessel() {
    return state.vessels.find(v => v.id === state.selectedVesselId);
  }

  function computeComplianceMetrics() {
    const vessel=getActiveVessel(), twin=state.twinState;
    const modelVessel=modelVessels.find(v=>v.id===vessel.id);
    const ownerSharePct={voyage_gencon:.85,time_nype_bimco:.18,split_blue_ga:.5}[twin.charterType];
    const settings={...defaultSettings(),year:twin.fueleuTargetCut===6?2030:2026,
      euaPrice:twin.euaPrice,ukPrice:twin.ukEtsPrice,speedDelta:twin.jitSpeedDeltaKn,
      blendPct:twin.biofuelBlendPct,poolingTonnes:twin.poolingSurplusTonnes,
      etsOwnerPct:ownerSharePct*100,fuelOwnerPct:ownerSharePct*100,poolOwnerPct:ownerSharePct*100};
    const c=compareOptions(modelVessel,settings), a=c.active, b=c.baseline;
    const computedLegs=vessel.legs.map((leg,i)=>({...leg,adjRaw:a.legs[i].co2Tonnes,
      adjCovered:a.legs[i].coveredTonnes,unitPrice:a.legs[i].unitPrice,cost:a.legs[i].cost}));
    const grossClientValueEur=twin.hoursSaved*40+twin.advisorSavingsEur;
    return {
      vessel,modelVessel,settings,comparison:c,scenario:state.scenarios[state.selectedScenario],computedLegs,
      euCoveredCo2:a.euCoveredCo2,ukCoveredCo2:a.ukCoveredCo2,euEtsBillEur:a.euEts,
      euEtsLow60:a.euCoveredCo2*60,euEtsHigh100:a.euCoveredCo2*100,ukEtsBillGbp:a.ukEts,
      targetIntensity:a.target,actualIntensity:a.actualIntensity,netBalanceGrams:a.netBalanceGrams,
      netBalanceTonnes:a.netBalanceGrams/1e6,vlsfoEqTonnes:Math.max(-a.netBalanceGrams,0)/(a.actualIntensity*41000),
      fueleuPenaltyEur:a.fuelEu,a3Penalty2Eur:b.fuelEu,jitFuelSavingsEur:a.fuelSaving,
      biofuelPremiumCostEur:a.blendCost,poolingCostEur:a.poolCost,totalRegionalEur:a.complianceEur,
      ownerSharePct,chartererSharePct:1-ownerSharePct,ownerEurExposure:a.ownerEur,chartererEurExposure:a.chartererEur,
      charterNoteZh:`演示分摊：船东 ${(ownerSharePct*100).toFixed(0)}% / 合同偿付方 ${((1-ownerSharePct)*100).toFixed(0)}%。不是 GENCON、NYPE 或 BIMCO 的默认比例；只分配欧元合规部分（含组池），不含营运增量与英国费用。`,
      charterNoteEn:`Illustrative allocation: Owner ${(ownerSharePct*100).toFixed(0)}% / reimbursing party ${((1-ownerSharePct)*100).toFixed(0)}%. Not GENCON/NYPE/BIMCO defaults. EUR compliance only (including pool fees), excluding operating deltas and UK costs.`,
      baselinePhysicalWtWTonnes:b.physicalWtWTonnes,currentPhysicalWtWTonnes:a.physicalWtWTonnes,
      physicalReductionPct:-c.physicalDeltaPct,baselineFinancialEur:b.totalEur,currentFinancialEur:a.totalEur,
      financialReductionPct:-c.costDeltaPct,laborSavingsEur:twin.hoursSaved*40,grossClientValueEur,
      recurringNetBenefitEur:grossClientValueEur-4800,year1NetBenefitEur:grossClientValueEur-5400
    };
  }

  /**
   * Effect #1: Position & Glide the Top Bar Apple Convex Liquid Lens Pill Indicator
   */
  function updateSlidingPill(activeBtn, animateStretch = true) {
    const navContainer = document.getElementById('primaryNavTabs');
    const indicator = document.getElementById('navPillIndicator');
    if (!navContainer || !indicator || !activeBtn) return;

    navContainer.classList.add('pill-ready');
    const offsetLeft = activeBtn.offsetLeft;
    const width = activeBtn.offsetWidth;

    indicator.style.width = `${width}px`;
    indicator.style.transform = `translate3d(${offsetLeft}px, 0, 0)`;

    if (animateStretch) {
      indicator.classList.remove('stretching');
      void indicator.offsetWidth;
      indicator.classList.add('stretching');
    }
  }

  /**
   * Effect #4: Assign Staggered Cascade Indices to Active Tab's Bento Cards & Controls
   * Skips the panel-card containing #realMaritimeMap so Leaflet never experiences parent transform shifts
   */
  function applyStaggeredCascade(panelEl) {
    if (!panelEl) return;
    const items = panelEl.querySelectorAll('.panel-card, .control-group, .gauge-card');
    items.forEach((item, idx) => {
      if (item.querySelector('#realMaritimeMap')) {
        item.classList.remove('stagger-item');
        return;
      }
      item.classList.remove('stagger-item');
      void item.offsetWidth;
      item.style.setProperty('--stagger-i', Math.min(idx, 10));
      item.classList.add('stagger-item');
    });
  }

  /**
   * Effect #6: Live Telemetry & Chart Replay on Tab Entry
   */
  function triggerLiveChartReplay(panelId) {
    const m = computeComplianceMetrics();

    if (panelId === 'tab-sandbox') {
      const ownerBar = document.getElementById('ownerSplitBar');
      const chartBar = document.getElementById('chartererSplitBar');
      if (ownerBar && chartBar) {
        ownerBar.style.transition = 'none';
        chartBar.style.transition = 'none';
        ownerBar.style.width = '0%';
        chartBar.style.width = '0%';
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            ownerBar.style.transition = 'width 680ms cubic-bezier(0.16, 1, 0.3, 1)';
            chartBar.style.transition = 'width 680ms cubic-bezier(0.16, 1, 0.3, 1)';
            ownerBar.style.width = `${(m.ownerSharePct * 100).toFixed(0)}%`;
            chartBar.style.width = `${(m.chartererSharePct * 100).toFixed(0)}%`;
          });
        });
      }
    } else if (panelId === 'tab-audit') {
      const finArc = document.getElementById('ringArcFinancial');
      const physArc = document.getElementById('ringArcPhysical');
      if (finArc && physArc) {
        const finTarget = Math.min(240, Math.max(45, 185 - m.financialReductionPct * 2.2));
        const physTarget = Math.min(240, Math.max(35, 160 - m.physicalReductionPct * 2.5));
        finArc.style.transition = 'none';
        physArc.style.transition = 'none';
        finArc.setAttribute('stroke-dasharray', '0 251');
        physArc.setAttribute('stroke-dasharray', '0 251');
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            finArc.style.transition = 'stroke-dasharray 760ms cubic-bezier(0.16, 1, 0.3, 1)';
            physArc.style.transition = 'stroke-dasharray 760ms cubic-bezier(0.16, 1, 0.3, 1)';
            finArc.setAttribute('stroke-dasharray', `${finTarget.toFixed(0)} 251`);
            physArc.setAttribute('stroke-dasharray', `${physTarget.toFixed(0)} 251`);
          });
        });
      }
    } else if (panelId === 'tab-scenarios') {
      const bars = document.querySelectorAll('#tab-scenarios .bar-fill');
      bars.forEach((bar, i) => {
        const targetW = bar.getAttribute('data-target-width') || '85%';
        bar.style.transition = 'none';
        bar.style.width = '0%';
        setTimeout(() => {
          bar.style.transition = 'width 720ms cubic-bezier(0.16, 1, 0.3, 1)';
          bar.style.width = targetW;
        }, 60 + i * 55);
      });
    }
  }

  /**
   * Switch Map Camera View Preset (Eurasia / Europe+UK / Chokepoints)
   */
  function switchMapCamera(camKey) {
    if (!document.getElementById('tab-cockpit').classList.contains('active')) {
      deferredCamera=camKey;
      return;
    }
    deferredCamera=null;
    document.querySelectorAll('.map-cam-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-cam') === camKey);
    });

    const lang = state.lang;
    if (camKey === 'eurasia') {
      setText('mapCursorCoords', 'LAT 31.00°N · LON 48.00°E (EURASIA)');
      setText(
        'mapActiveLegOverlay',
        lang === 'zh'
          ? '🌏 亚欧全航线：上海 (CNSHA) → 新加坡 (SGSIN) → 苏伊士 (EGPSD) → 鹿特丹 (NLRTM)'
          : '🌏 Eurasia Corridor: CNSHA → SGSIN → EGPSD → MAPTM → NLRTM → DEHAM → UK'
      );
      if (leafletMap) {
        leafletMap.invalidateSize();
        leafletMap.flyTo([28.0, 52.0], 3, { duration: 0.85 });
      }
    } else if (camKey === 'europe') {
      setText('mapCursorCoords', 'LAT 52.20°N · LON 3.20°E (EU 100% + UK ETS)');
      setText(
        'mapActiveLegOverlay',
        lang === 'zh'
          ? '🇪🇺 欧英北海核心合规区：鹿特丹→汉堡 (EU 100% €) · 费利克斯托→南安普顿 (UK ETS £)'
          : '🇪🇺 North Sea Core: NLRTM→DEHAM (EU 100% €) · GBFXT→GBSOU (UK ETS £)'
      );
      if (leafletMap) {
        leafletMap.invalidateSize();
        leafletMap.flyTo([52.2, 3.8], 5, { duration: 0.85 });
      }
    } else if (camKey === 'chokepoints') {
      setText('mapCursorCoords', 'LAT 34.00°N · LON 14.00°E (<300nm ANTI-EVASION)');
      setText(
        'mapActiveLegOverlay',
        lang === 'zh'
          ? '⚓ 300海里防碳泄漏转运港：塞得港东港 (EGPSD) 与 丹吉尔地中海港 (MAPTM) 不中断欧盟 50% 起算'
          : '⚓ <300nm Neighboring Transshipment Ports: East Port Said (EGPSD) & Tanger Med (MAPTM)'
      );
      if (leafletMap) {
        leafletMap.invalidateSize();
        leafletMap.flyTo([34.5, 13.5], 4, { duration: 0.85 });
      }
    }
  }

  /**
   * Initialize Keyless Real GIS Maritime Map (Works on file:// without any API key)
   */
  function initRealMaritimeMap() {
    const mapContainer = document.getElementById('realMaritimeMap');
    if (!mapContainer || typeof L === 'undefined') return;
    if (leafletMap) return;

    // Force explicit pixel height on the container before Leaflet initializes
    mapContainer.style.setProperty('height', '330px', 'important');
    mapContainer.style.setProperty('min-height', '330px', 'important');
    mapContainer.style.setProperty('width', '100%', 'important');
    mapContainer.style.setProperty('display', 'block', 'important');

    try {
      leafletMap = L.map('realMaritimeMap', {
        center: [28.0, 52.0],
        zoom: 3,
        minZoom: 2,
        maxZoom: 11,
        zoomControl: true
      });

      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri, HERE, Garmin, OpenStreetMap',
        maxZoom: 16
      }).addTo(leafletMap);

      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 16,
        opacity: 0.85
      }).addTo(leafletMap);

      fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson')
        .then(res => res.ok ? res.json() : null)
        .then(geojson => {
          if (geojson && leafletMap) {
            L.geoJSON(geojson, {
              style: feature => {
                const iso = feature.properties && (feature.properties.ISO_A2 || feature.properties.ADM0_A3);
                const isEU = ['NL', 'DE', 'FR', 'BE', 'ES', 'IT', 'GR', 'PT', 'PL', 'DK', 'SE', 'FI', 'IE', 'NLD', 'DEU', 'FRA', 'BEL', 'ESP', 'ITA', 'GRC', 'DNK'].includes(iso);
                const isUK = ['GB', 'GBR'].includes(iso);
                return {
                  color: isEU ? 'rgba(2, 132, 199, 0.45)' : (isUK ? 'rgba(15, 23, 42, 0.45)' : 'rgba(15, 23, 42, 0.10)'),
                  weight: isEU || isUK ? 1.2 : 0.6,
                  fillColor: isEU ? '#0284c7' : (isUK ? '#0f172a' : '#cbd5e1'),
                  fillOpacity: isEU ? 0.10 : (isUK ? 0.08 : 0.03)
                };
              },
              interactive: false
            }).addTo(leafletMap);
          }
        })
        .catch(() => {});

      const eu100PolygonCoords = [
        [50.85, 1.85],
        [51.40, 3.00],
        [53.80, 4.50],
        [55.05, 8.50],
        [54.20, 10.80],
        [51.50, 6.00]
      ];
      mapLayers.eu100Zone = L.polygon(eu100PolygonCoords, {
        color: '#0284c7',
        weight: 1.6,
        fillColor: '#0284c7',
        fillOpacity: 0.16,
        dashArray: '4 4'
      }).addTo(leafletMap);

      const ukEtsPolygonCoords = [
        [50.00, -5.50],
        [50.40, 1.60],
        [53.50, 1.80],
        [55.80, -2.00],
        [54.50, -5.50]
      ];
      mapLayers.ukZone = L.polygon(ukEtsPolygonCoords, {
        color: '#0f172a',
        weight: 1.5,
        fillColor: '#0f172a',
        fillOpacity: 0.10,
        dashArray: '3 4'
      }).addTo(leafletMap);

      const legE1Coords = [
        [31.23, 121.47],
        [25.00, 120.20],
        [14.00, 114.00],
        [1.26, 103.82],
        [5.80, 95.30],
        [5.90, 80.50],
        [12.60, 43.30],
        [27.80, 33.80],
        [31.26, 32.31],
        [35.20, 24.00],
        [37.30, 10.20],
        [35.89, -5.50],
        [43.10, -9.40],
        [48.80, -4.80],
        [50.90, 1.30],
        [51.95, 4.14]
      ];

      const legE2Coords = [
        [51.95, 4.14],
        [53.20, 4.70],
        [54.00, 7.80],
        [53.88, 8.70],
        [53.54, 9.97]
      ];

      const legU1Coords = [
        [51.95, 1.33],
        [51.40, 1.55],
        [50.70, 0.30],
        [50.65, -1.10],
        [50.89, -1.40]
      ];

      mapLayers.lineE1 = L.polyline(legE1Coords, {
        color: '#0284c7',
        weight: 3.2,
        opacity: 0.92,
        dashArray: '6 5'
      }).addTo(leafletMap);

      mapLayers.lineE2 = L.polyline(legE2Coords, {
        color: '#059669',
        weight: 3.8,
        opacity: 0.96
      }).addTo(leafletMap);

      mapLayers.lineU1 = L.polyline(legU1Coords, {
        color: '#0f172a',
        weight: 3.2,
        opacity: 0.92,
        dashArray: '4 4'
      }).addTo(leafletMap);

      originalE1Coordinates=legE1Coords;
      mapLayers.lineE1.on('click', () => selectLegFilter('E1'));
      mapLayers.lineE2.on('click', () => selectLegFilter('E2'));
      mapLayers.lineU1.on('click', () => selectLegFilter('U1'));

      const ports = [
        {
          code: 'CNSHA',
          nameZh: '上海港 (Shanghai)',
          nameEn: 'Port of Shanghai (CNSHA)',
          coords: [31.23, 121.47],
          legId: 'E1',
          roleZh: '非欧盟始发港 · EU ETS 按 50% 计入进出欧盟航段 (E1)',
          roleEn: 'Non-EU Origin Port · 50% Extra-EU ETS Scope (Leg E1)',
          dotColor: '#56ccf2'
        },
        {
          code: 'SGSIN',
          nameZh: '新加坡港 (Singapore Hub)',
          nameEn: 'Port of Singapore (SGSIN)',
          coords: [1.26, 103.82],
          legId: 'E1',
          roleZh: '亚洲加注与航运枢纽 · 绿色甲醇/生物燃料加注参考点',
          roleEn: 'Asian Bunkering Hub · Biofuel & e-Methanol Supply Reference',
          dotColor: '#56ccf2'
        },
        {
          code: 'EGPSD',
          nameZh: '塞得港东港 / 苏伊士 (East Port Said)',
          nameEn: 'East Port Said / Suez (EGPSD)',
          coords: [31.26, 32.31],
          legId: 'E1',
          roleZh: '欧盟指定 <300nm 邻近集装箱转运港（防碳泄漏规避，不中断 EU 50% 航程起算）',
          roleEn: 'EU-Designated <300nm Neighboring Transshipment Port (Anti-Evasion Rule)',
          dotColor: '#f59e0b'
        },
        {
          code: 'MAPTM',
          nameZh: '丹吉尔地中海港 (Tanger Med)',
          nameEn: 'Tanger Med / Gibraltar (MAPTM)',
          coords: [35.89, -5.50],
          legId: 'E1',
          roleZh: '欧盟指定 <300nm 邻近集装箱转运港（Lecture 3 案例：停靠不免除亚欧全程 50% 义务）',
          roleEn: 'EU-Designated <300nm Neighboring Transshipment Port (Lecture 3 Anti-Evasion)',
          dotColor: '#f59e0b'
        },
        {
          code: 'NLRTM',
          nameZh: '鹿特丹港 (Rotterdam)',
          nameEn: 'Port of Rotterdam (NLRTM)',
          coords: [51.95, 4.14],
          legId: 'E3',
          roleZh: '欧盟首靠港 · 港内停泊 (E3) 100% 计入 EU ETS + FuelEU 岸电 (OPS) 监测',
          roleEn: 'First EU Port of Call · 100% Berth ETS (E3) + FuelEU WtW & OPS',
          dotColor: '#10b981'
        },
        {
          code: 'DEHAM',
          nameZh: '汉堡港 (Hamburg)',
          nameEn: 'Port of Hamburg (DEHAM)',
          coords: [53.54, 9.97],
          legId: 'E2',
          roleZh: '欧盟内部目的港 · 鹿特丹→汉堡 (E2) 按 100% 计入 EU ETS 与 FuelEU',
          roleEn: 'Intra-EU Port · Rotterdam→Hamburg (E2) 100% EU ETS & FuelEU Scope',
          dotColor: '#10b981'
        },
        {
          code: 'GBFXT',
          nameZh: '费利克斯托港 (Felixstowe)',
          nameEn: 'Port of Felixstowe (GBFXT)',
          coords: [51.95, 1.33],
          legId: 'U1',
          roleZh: '英国枢纽港 · 2026年7月1日起国内航段与港内纳入 UK ETS (GBP £ 单列)',
          roleEn: 'UK Hub Port · In UK ETS Scope from 1 Jul 2026 (GBP £ Separate)',
          dotColor: '#0f172a'
        },
        {
          code: 'GBSOU',
          nameZh: '南安普顿港 (Southampton)',
          nameEn: 'Port of Southampton (GBSOU)',
          coords: [50.89, -1.40],
          legId: 'U1',
          roleZh: '英国国内沿海挂靠港 (U1: 200t 国内航段 + U2: 20t 港内 = £13,200)',
          roleEn: 'UK Domestic Call (U1: 200t + U2: 20t Berth = £13,200 UK ETS)',
          dotColor: '#0f172a'
        }
      ];

      mapLayers.portMarkers = ports.map(p => {
        const marker = L.circleMarker(p.coords, {
          radius: 6,
          color: '#ffffff',
          weight: 2,
          fillColor: p.dotColor,
          fillOpacity: 1
        }).addTo(leafletMap);

        marker.bindTooltip(`${p.code}`, {
          permanent: true,
          direction: 'top',
          offset: [0, -6],
          className: 'port-label-tooltip'
        });

        marker.on('click', () => {
          selectLegFilter(p.legId);
        });

        marker.portMeta = p;
        return marker;
      });

      leafletMap.on('mousemove', e => {
        const lat = e.latlng.lat >= 0 ? `${e.latlng.lat.toFixed(2)}°N` : `${Math.abs(e.latlng.lat).toFixed(2)}°S`;
        const lng = e.latlng.lng >= 0 ? `${e.latlng.lng.toFixed(2)}°E` : `${Math.abs(e.latlng.lng).toFixed(2)}°W`;
        setText('mapCursorCoords', `LAT ${lat} · LON ${lng}`);
      });

      updateMapPopups();

      setTimeout(() => { if (leafletMap) leafletMap.invalidateSize(); }, 100);
      setTimeout(() => { if (leafletMap) leafletMap.invalidateSize(); }, 400);
    } catch (err) {
      console.error('Maritime GIS Map Init Error:', err);
    }
  }

  function selectLegFilter(legId) {
    state.selectedLegFilter = legId;
    document.querySelectorAll('.leg-filter-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-leg-filter') === legId);
    });
    renderApp();
  }

  function updateMapPopups() {
    if (!leafletMap || !mapLayers.portMarkers) return;
    const lang = state.lang;
    const m = computeComplianceMetrics();

    mapLayers.portMarkers.forEach(marker => {
      const p = marker.portMeta;
      const legObj = m.computedLegs.find(l => l.id === p.legId) || m.computedLegs[0];
      const costStr = legObj.currency === 'EUR' ? fmtEur(legObj.cost, 0) : fmtGbp(legObj.cost, 0);

      marker.bindPopup(`
        <div style="min-width:210px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <strong style="color:#0f172a; font-size:12.5px;">${lang === 'zh' ? p.nameZh : p.nameEn}</strong>
            <span class="mono" style="font-size:10.5px; color:#0284c7; font-weight:600;">${p.code}</span>
          </div>
          <div class="mono" style="font-size:10.5px; color:#64748b; margin-bottom:6px;">
            LAT ${p.coords[0].toFixed(2)}° · LON ${p.coords[1].toFixed(2)}°
          </div>
          <div style="color:#334155; font-size:11.5px; margin-bottom:6px;">
            ${lang === 'zh' ? p.roleZh : p.roleEn}
          </div>
          <div style="padding-top:6px; border-top:1px solid rgba(15,23,42,0.10); display:flex; justify-content:space-between; font-family:var(--font-mono); font-size:11px;">
            <span style="color:#475569;">${legObj.code} (${(legObj.coveragePct * 100).toFixed(0)}%)</span>
            <strong style="color:#0f172a;">${costStr}</strong>
          </div>
        </div>
      `);
    });
  }

  function updateVesselRoute() {
    const id=state.selectedVesselId;
    const dest={v1:'DEHAM',v2:'BEANR',v3:'DEBRV'}[id];
    const p=modelPorts[dest];
    mapLayers.lineE1.setLatLngs(id==='v3'?originalE1Coordinates.slice(originalE1Coordinates.findIndex(c=>c[0]===35.89)):originalE1Coordinates);
    mapLayers.lineE2.setLatLngs(id==='v1'?[[51.95,4.14],[53.20,4.70],[54.00,7.80],[53.88,8.70],p.coords]:id==='v2'?[[51.95,4.14],[51.88,3.6],[51.45,3.65],p.coords]:[[51.95,4.14],[53.2,4.7],[53.9,7.6],p.coords]);
    const marker=mapLayers.portMarkers.find(marker=>marker.portMeta.legId==='E2');
    Object.assign(marker.portMeta,{code:dest,nameZh:p.zh,nameEn:p.en,coords:p.coords,
      roleZh:'欧盟内示例航段；适用范围预设，非自动法律判断。',roleEn:'Illustrative intra-EU leg; preset scope, not an automatic legal determination.'});
    marker.setLatLng(p.coords);marker.setTooltipContent(dest);
    document.querySelector('[data-leg-filter="E2"]').textContent=`E2 · Intra-EU 100% (NLRTM→${dest})`;
    document.querySelector('[data-leg-filter="E1"]').textContent=`E1 · Extra-EU 50% (${id==='v3'?'MAPTM':'CNSHA'}→NLRTM)`;
  }

  function updateResponsiveNavigation() {
    const mobile=window.matchMedia('(max-width: 680px)').matches;
    document.querySelectorAll('.nav-btn').forEach(button=>{
      const fullName=state.lang==='zh'?button.dataset.zh:button.dataset.en;
      button.textContent=mobile?(state.lang==='zh'?button.dataset.mobileZh:button.dataset.mobileEn):fullName;
      button.setAttribute('aria-label',fullName);
      button.title=fullName;
    });
  }

  function renderApp() {
    const lang = state.lang;
    document.documentElement.lang=lang==='zh'?'zh-CN':'en';
    const dict = state.i18n[lang];
    const m = computeComplianceMetrics();
    const twin = state.twinState;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict && dict[key]) el.textContent = dict[key];
    });

    document.querySelectorAll('[data-zh][data-en]').forEach(el => {
      el.textContent = lang === 'zh' ? el.getAttribute('data-zh') : el.getAttribute('data-en');
    });
    updateResponsiveNavigation();

    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    document.querySelectorAll('.scenario-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.scenario === state.selectedScenario);
    });

    const vesselSelect = document.getElementById('vesselSelect');
    if (vesselSelect) {
      vesselSelect.innerHTML = state.vessels.map(v => `
        <option value="${v.id}" ${v.id === state.selectedVesselId ? 'selected' : ''}>
          ${lang === 'zh' ? v.nameZh : v.nameEn}
        </option>
      `).join('');
    }

    setHTML('vesselMetaPills', `
      <span class="meta-pill">${m.vessel.imo}</span>
      <span class="meta-pill">${fmtNum(m.vessel.gt)} GT</span>
      <span class="meta-pill">${m.vessel.fuelType}</span>
      <span class="badge ${m.vessel.ch4N2oVerified ? 'badge-in-force' : 'badge-pending'}">
        ${m.vessel.ch4N2oVerified
          ? (lang === 'zh' ? 'CH4/N2O 已核验' : 'CH4/N2O Verified')
          : (lang === 'zh' ? '2026 CH4/N2O 缺失 · 仅单列 CO2' : '2026 CH4/N2O Missing · CO2 Only')}
      </span>
    `);

    setText('kpiEuEtsVal', fmtEur(m.euEtsBillEur, 0));
    setHTML('kpiEuEtsSub', `
      <span>${fmtNum(m.euCoveredCo2, 0)} tCO₂ × €${twin.euaPrice}</span>
      <span class="mono">60/100: ${fmtEur(m.euEtsLow60)} / ${fmtEur(m.euEtsHigh100)}</span>
    `);

    setText('kpiFuelEuVal', fmtEur(m.fueleuPenaltyEur, 2));
    setHTML('kpiFuelEuSub', `
      <span>${lang === 'zh' ? '余额' : 'Balance'} ${fmtNum(m.netBalanceTonnes, 3)} t</span>
      <span class="mono">-${twin.fueleuTargetCut.toFixed(0)}% (${m.targetIntensity})</span>
    `);

    setText('kpiUkEtsVal', fmtGbp(m.ukEtsBillGbp, 0));
    setHTML('kpiUkEtsSub', `
      <span>${fmtNum(m.ukCoveredCo2, 0)} tCO₂ × £${twin.ukEtsPrice}</span>
      <span class="mono">${lang === 'zh' ? '英镑单列' : 'GBP Separate'}</span>
    `);

    setText('kpiCharterVal', fmtEur(m.ownerEurExposure, 0));
    setHTML('kpiCharterSub', `
      <span>${lang === 'zh' ? '船东' : 'Owner'} ${(m.ownerSharePct * 100).toFixed(0)}% · ${lang === 'zh' ? '租家' : 'Charterer'} ${(m.chartererSharePct * 100).toFixed(0)}%</span>
      <span class="mono">${fmtEur(m.chartererEurExposure, 0)}</span>
    `);

    document.querySelectorAll('.sync-eua').forEach(el => { el.value = twin.euaPrice; });
    document.querySelectorAll('.readout-eua').forEach(el => { el.textContent = `€${twin.euaPrice} / tCO₂`; });

    document.querySelectorAll('.sync-jit').forEach(el => { el.value = twin.jitSpeedDeltaKn; });
    document.querySelectorAll('.readout-jit').forEach(el => {
      const actualKn = (m.vessel.serviceSpeedKn + twin.jitSpeedDeltaKn).toFixed(1);
      el.textContent = `${twin.jitSpeedDeltaKn.toFixed(1)} kn (${actualKn} kn)`;
    });

    document.querySelectorAll('.sync-bio').forEach(el => { el.value = twin.biofuelBlendPct; });
    document.querySelectorAll('.readout-bio').forEach(el => { el.textContent = `${twin.biofuelBlendPct}%`; });

    document.querySelectorAll('.sync-pool').forEach(el => { el.value = twin.poolingSurplusTonnes; });
    document.querySelectorAll('.readout-pool').forEach(el => { el.textContent = `+${twin.poolingSurplusTonnes} tCO₂e`; });

    document.querySelectorAll('.seg-target-btn').forEach(btn => {
      btn.classList.toggle('active', Number(btn.dataset.target) === twin.fueleuTargetCut);
    });

    document.querySelectorAll('.seg-charter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.charter === twin.charterType);
    });

    const hygieneAlertEl=document.getElementById('cockpitHygieneAlert');
    hygieneAlertEl.className='alert-banner amber';
    hygieneAlertEl.innerHTML=`<div><strong>${lang==='zh'?'教学数据：缺失 CH₄ / N₂O，完整 ETS 总额不可用':'Teaching Data: CH₄ / N₂O Missing; Complete ETS Total Unavailable'}</strong><span>${lang==='zh'?`当前 EU 仅单列 CO₂ ${fmtNum(m.euCoveredCo2,1)} 吨，UK ${fmtNum(m.ukCoveredCo2,1)} 吨；未经外部核验。FuelEU 能源独立给定，未与同一燃料台账物理对账。`:`Current CO₂ subtotals: EU ${fmtNum(m.euCoveredCo2,1)} t, UK ${fmtNum(m.ukCoveredCo2,1)} t; not externally verified. FuelEU energy is independently specified, not physically reconciled to a common ledger.`}</span></div>`;

    const supplyAlertEl = document.getElementById('bunkerSupplyAlert');
    if (supplyAlertEl) {
      if (twin.biofuelBlendPct > 0) {
        supplyAlertEl.style.display = 'flex';
        supplyAlertEl.innerHTML = `
          <div>
            <strong>${lang === 'zh' ? '示例燃料系数与供给待核实' : 'Illustrative Fuel Coefficients & Unverified Supply'}</strong>
            <span>${lang === 'zh'
              ? `当前设定掺烧 ${twin.biofuelBlendPct}%：公式上可降低罚款，但0.26/0.32 为教学系数；认证、发动机兼容性、港口供给及价格均待核实。`
              : `At ${twin.biofuelBlendPct}% blend, penalties drop mathematically, but certification, engine compatibility, port supply and prices remain unverified; 0.26/0.32 are teaching coefficients.`}</span>
          </div>
        `;
      } else {
        supplyAlertEl.style.display = 'none';
      }
    }

    const filteredLegs = state.selectedLegFilter === 'all'
      ? m.computedLegs
      : m.computedLegs.filter(l => l.id === state.selectedLegFilter || (state.selectedLegFilter === 'U1' && l.regime === 'UK ETS'));

    setHTML('cockpitLegTableBody', filteredLegs.map(l => `
      <tr>
        <td class="mono"><strong>${l.code}</strong></td>
        <td>${lang === 'zh' ? l.routeZh : l.routeEn}</td>
        <td><span class="badge ${l.currency === 'EUR' ? 'badge-in-force' : 'badge-gbp'}">${l.regime}</span></td>
        <td class="num">${fmtNum(l.adjRaw, 1)} t</td>
        <td class="num">${(l.coveragePct * 100).toFixed(0)}%</td>
        <td class="num"><strong>${fmtNum(l.adjCovered, 1)} t</strong></td>
        <td class="num"><strong>${l.currency === 'EUR' ? fmtEur(l.cost, 0) : fmtGbp(l.cost, 0)}</strong></td>
      </tr>
    `).join(''));

    // Tab 2: Sandbox & Charterparty Split
    setText(
      'ownerSplitLabel',
      `${lang === 'zh' ? '船东承担' : 'Owner Share'}: ${fmtEur(m.ownerEurExposure, 0)} (${(m.ownerSharePct * 100).toFixed(0)}%)`
    );
    setText(
      'chartererSplitLabel',
      `${lang === 'zh' ? '租家偿付' : 'Charterer Reimbursed'}: ${fmtEur(m.chartererEurExposure, 0)} (${(m.chartererSharePct * 100).toFixed(0)}%)`
    );
    const ownerSplitBar = document.getElementById('ownerSplitBar');
    const chartererSplitBar = document.getElementById('chartererSplitBar');
    if (ownerSplitBar && chartererSplitBar) {
      ownerSplitBar.style.width = `${(m.ownerSharePct * 100).toFixed(0)}%`;
      chartererSplitBar.style.width = `${(m.chartererSharePct * 100).toFixed(0)}%`;
    }
    setText('charterExplainBox', lang === 'zh' ? m.charterNoteZh : m.charterNoteEn);

    const c=m.comparison;
    setHTML('optionCompareBody',[
      [lang==='zh'?'1. 未调整基准':'1. Unmodified baseline',c.baseline,lang==='zh'?'同价格、同目标':'Same prices and target'],
      [lang==='zh'?'2. 当前组合方案':'2. Active option',c.active,lang==='zh'?'教学情景，未验证可行性':'Teaching scenario, feasibility unverified'],
      [lang==='zh'?'3. 假设组池方案':'3. Assumed pooling option',c.pooling,c.pooling.fuelEu>.01?(lang==='zh'?'供给不足，仍有罚款':'Supply limited; residual penalty'):c.baseline.deficitTonnes===0?(lang==='zh'?'已有盈余，无需购买':'Already in surplus; no purchase needed'):(lang==='zh'?'供给与协议待确认':'Supply and agreement unverified')]
    ].map(([title,x,note])=>`<tr><td><strong>${title}</strong></td><td class="num">${fmtEur(x.euEts,2)}</td><td class="num">${fmtEur(x.fuelEu,2)}</td><td class="num">${fmtEur(x.operatingDelta+x.poolCost,2)}</td><td class="num"><strong>${fmtEur(x.totalEur,2)}</strong></td><td>${note}</td></tr>`).join(''));

    const auditRows=m.computedLegs.map(l=>`<tr><td class="mono"><strong>${l.code}</strong></td><td>${lang==='zh'?l.routeZh:l.routeEn}</td><td><span class="formula-code">CO₂ × ${l.coveragePct*100}% × ${l.currency==='EUR'?'EUA':'UKA'}</span></td><td class="num">${fmtNum(l.adjRaw,2)} × ${l.coveragePct*100}% = ${fmtNum(l.adjCovered,2)} t</td><td class="num">${l.currency==='EUR'?fmtEur(l.cost,2):fmtGbp(l.cost,2)}</td><td>CO₂ only</td></tr>`);
    auditRows.push(`<tr><td>FuelEU · Active</td><td>${lang==='zh'?'当前目标与实际组池分配':'Current target and allocated pooling'}</td><td><span class="formula-code">max(−CB,0) / (${fmtNum(m.actualIntensity,4)} × 41,000) × €2,400</span></td><td class="num">${fmtNum(m.netBalanceGrams)} g · ${fmtNum(c.active.allocatedPoolTonnes,4)} tCB pool</td><td class="num">${fmtEur(m.fueleuPenaltyEur,2)}</td><td>${lang==='zh'?'单期简化估算':'Single-period model'}</td></tr>`);
    for(const year of [2026,2030]) {
      const x=computeScenario(m.modelVessel,{...m.settings,year,poolingTonnes:0});
      auditRows.push(`<tr><td>FuelEU · ${year<2030?'2%':'6%'}</td><td>${lang==='zh'?'当前船舶条件比较（无组池）':'Active vessel condition comparison (unpooled)'}</td><td><span class="formula-code">(${fmtNum(x.target,4)} − ${fmtNum(x.actualIntensity,4)}) × ${fmtNum(x.energyMJ)} MJ</span></td><td class="num">${fmtNum(x.rawBalanceGrams/1e6,4)} tCB</td><td class="num">${fmtEur(x.fuelEu,2)}</td><td>Condition</td></tr>`);
    }
    setHTML('a3AuditTableBody',auditRows.join(''));

    const finDeltaStr = new Intl.NumberFormat(lang==='zh'?'zh-CN':'en-GB',{style:'percent',minimumFractionDigits:1,maximumFractionDigits:1,signDisplay:'exceptZero'}).format(-m.financialReductionPct/100);
    const physDeltaStr = new Intl.NumberFormat(lang==='zh'?'zh-CN':'en-GB',{style:'percent',minimumFractionDigits:1,maximumFractionDigits:1,signDisplay:'exceptZero'}).format(-m.physicalReductionPct/100);
    setText('gaugeFinancialVal', finDeltaStr);
    setText('gaugePhysicalVal', physDeltaStr);
    setText('gaugeFinancialSub', `${fmtEur(m.currentFinancialEur, 0)} vs ${fmtEur(m.baselineFinancialEur, 0)}`);
    setText('gaugePhysicalSub', `${fmtNum(m.currentPhysicalWtWTonnes, 0)} t vs ${fmtNum(m.baselinePhysicalWtWTonnes, 0)} t`);

    const finArc = document.getElementById('ringArcFinancial');
    const physArc = document.getElementById('ringArcPhysical');
    if (finArc && physArc) {
      const finDash = Math.min(240, Math.max(45, 185 - m.financialReductionPct * 2.2));
      const physDash = Math.min(240, Math.max(35, 160 - m.physicalReductionPct * 2.5));
      finArc.setAttribute('stroke-dasharray', `${finDash.toFixed(0)} 251`);
      physArc.setAttribute('stroke-dasharray', `${physDash.toFixed(0)} 251`);
    }

    const reflexEl = document.getElementById('reflexiveStatusText');
    if (reflexEl) {
      if (Math.abs(c.physicalDelta)<0.00001 && Math.abs(c.costDelta)>0.005) {
        reflexEl.className = 'alert-banner amber';
        reflexEl.innerHTML = `
          <div>
            <strong>${lang === 'zh' ? '反漂绿预警：纯财务池化抵扣（本船物理排放未降）' : 'Anti-Greenwashing Warning: Financial Pooling Only'}</strong>
            <span>${lang === 'zh'
              ? `当前通过外部组池抵扣了 +${twin.poolingSurplusTonnes} tCO₂e，财务支出下降，但本船物理 WtW 排放仍为 ${fmtNum(m.currentPhysicalWtWTonnes, 0)} 吨（0.0% 物理减排），严禁对外宣传为“本船低碳航次”。`
              : `Financial exposure dropped via +${twin.poolingSurplusTonnes} tCO₂e pooling, but physical shipboard WtW emissions remain unchanged (0.0% physical reduction).`}</span>
          </div>
        `;
      } else {
        reflexEl.className = 'alert-banner cyan';
        reflexEl.innerHTML = `
          <div>
            <strong>${lang === 'zh' ? '财务与物理模型估算分列（未外部核验）' : 'Separate Financial & Physical Estimates (Not Verified)'}</strong>
            <span>${lang === 'zh'
              ? `系统实时并列报告“财务合规账单变动 (${finDeltaStr})”与“物理全生命周期 WtW 排放变动 (${physDeltaStr})”，防止把纯配额/池化套利包装为物理减排。`
              : `Simultaneously reporting Financial Cost Delta (${finDeltaStr}) alongside Physical WtW Emissions Delta (${physDeltaStr}).`}</span>
          </div>
        `;
      }
    }

    // Tab 4: Active IMO Scenario Detail Box
    const sc = m.scenario;
    setHTML('activeScenarioDetailBox', `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
        <strong style="color:var(--text-primary); font-size:14px;">${lang === 'zh' ? sc.titleZh : sc.titleEn}</strong>
        <span class="badge badge-${sc.tagStatus}">${sc.breakEvenClients} Clients Break-Even</span>
      </div>
      <p style="font-size:12.5px; color:var(--text-secondary); margin-top:4px;">
        ${lang === 'zh' ? sc.triggerZh : sc.triggerEn}
      </p>
      <div style="font-size:12px; color:var(--text-muted); padding-top:6px; border-top:1px solid var(--border-hairline);">
        <strong style="color:var(--text-primary);">${lang === 'zh' ? '平台应对策略：' : 'Venture Strategy: '}</strong>
        ${lang === 'zh' ? sc.strategyZh : sc.strategyEn}
      </div>
    `);

    // Tab 5: Guardrailed AI Radar, A1 ROI & A2 Risk Register
    document.querySelectorAll('.prompt-chip').forEach(chip => {
      chip.classList.toggle('active', chip.getAttribute('data-prompt') === activePromptId);
    });

    const promptObj=state.aiPrompts.find(p=>p.id===activePromptId);
    const answers={
      q1:lang==='zh'?`当前 EU ${fmtEur(m.euEtsBillEur)}、UK ${fmtGbp(m.ukEtsBillGbp)} 均仅为 CO₂ 部分预算。缺失 CH₄/N₂O 不等于零，也未发生外部核验。`:`EU ${fmtEur(m.euEtsBillEur)} and UK ${fmtGbp(m.ukEtsBillGbp)} are CO₂ subtotals only. Missing CH₄/N₂O is not zero; no external verification was performed.`,
      q2:lang==='zh'?'不能保证经营存续。区域需求可能继续存在，但三种示例情景均亏损；57 家只是指定成本下的全年等效经营平衡客户数，获客、续订、人工和资金均待验证。':'Survival is not guaranteed. Regional demand may persist, but all three illustrative scenarios lose money. 57 clients is an operating break-even assumption; acquisition, renewals, labour and funding need validation.',
      q3:lang==='zh'?`当前强度 ${fmtNum(m.actualIntensity,4)}，目标 ${fmtNum(m.targetIntensity,4)}；分配 ${fmtNum(c.active.allocatedPoolTonnes,4)} tCB 后罚款 ${fmtEur(m.fueleuPenaltyEur,2)}。供给、燃料认证与合同未验证，不能据此宣称最优或实际减排。`:`Current intensity ${fmtNum(m.actualIntensity,4)}, target ${fmtNum(m.targetIntensity,4)}; allocation ${fmtNum(c.active.allocatedPoolTonnes,4)} tCB leaves ${fmtEur(m.fueleuPenaltyEur,2)} penalty. Supply, fuel certification and contracts are unverified; no optimum or realized reduction is claimed.`
    };
    setHTML('aiAnswerBox',`<strong>${lang==='zh'?promptObj.qZh:promptObj.qEn}</strong><p style="margin-top:8px;">${answers[activePromptId]}</p><span class="badge badge-assumption">${lang==='zh'?'预设解释模板 · 非 RAG':'Preset template · not RAG'}</span>`);

    setHTML('aiFeedContainer', state.aiFeed.map(item => `
      <div class="control-group" style="gap:4px; padding:11px 14px;">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
          <strong style="color:var(--text-primary); font-size:12.5px;">${lang === 'zh' ? item.titleZh : item.titleEn}</strong>
          <span class="badge badge-${item.status}">${lang === 'zh' ? item.badgeZh : item.badgeEn}</span>
        </div>
        <p style="font-size:11.5px; color:var(--text-secondary);">${lang === 'zh' ? item.summaryZh : item.summaryEn}</p>
        <div class="mono" style="font-size:10.5px; color:var(--text-muted);">${item.date} · <a href="${item.url}" target="_blank" rel="noreferrer">${item.source}</a></div>
      </div>
    `).join(''));

    setText('roiHoursReadout', `${twin.hoursSaved} h (${fmtEur(m.laborSavingsEur, 0)})`);
    const roiHoursSlider = document.getElementById('roiHoursSlider');
    if (roiHoursSlider) roiHoursSlider.value = twin.hoursSaved;

    document.querySelectorAll('.roi-advisor-btn').forEach(btn => {
      btn.classList.toggle('active', Number(btn.getAttribute('data-advisor')) === twin.advisorSavingsEur);
    });

    setText('roiGrossVal', fmtEur(m.grossClientValueEur, 0));
    setText('roiRecurringNet', fmtEur(m.recurringNetBenefitEur, 0));
    setText('roiYear1Net', fmtEur(m.year1NetBenefitEur, 0));

    setHTML('a2RiskTableBody', state.riskRegister.map(r => `
      <tr>
        <td><strong>${lang === 'zh' ? r.riskZh : r.riskEn}</strong></td>
        <td class="mono">${r.level}</td>
        <td>${lang === 'zh' ? r.ownerZh : r.ownerEn}</td>
        <td>${lang === 'zh' ? r.controlZh : r.controlEn}</td>
        <td>${lang === 'zh' ? r.residualZh : r.residualEn}</td>
      </tr>
    `).join(''));

    updateMapPopups();
    mobileBudget.update(m,lang);

    requestAnimationFrame(() => {
      const activeNavBtn = document.querySelector('.nav-btn.active');
      if (activeNavBtn) updateSlidingPill(activeNavBtn, false);
    });
  }

  /**
   * Spatial 3D Tilt & Multi-Plane Parallax Engine (v3.2)
   * - Never tilts the panel-card containing the interactive GIS map when hovering inside .map-stage
   */
  function initSpatial3DTiltEngine() {
    const selector = '.kpi-card, .panel-card, .gauge-card, .control-group, .modal-card';
    let isDraggingRange = false;

    document.addEventListener('mousedown', (e) => {
      if (e.target && e.target.matches('input[type="range"]')) {
        isDraggingRange = true;
      }
    });
    document.addEventListener('mouseup', () => {
      isDraggingRange = false;
    });

    function resetCard3D(card) {
      card.classList.remove('is-tilting');
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
      card.style.setProperty('--tz', '0px');
      card.style.setProperty('--lift-y', '0px');
      card.style.setProperty('--px', '0px');
      card.style.setProperty('--py', '0px');
      card.style.setProperty('--sx', '0px');
      card.style.setProperty('--sy', '0px');
    }

    document.addEventListener('mousemove', (e) => {
      const overMapStage = e.target && e.target.closest('.map-stage');
      const cards = document.querySelectorAll(selector);

      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const inside =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom;

        if (!inside) {
          if (card.classList.contains('is-tilting')) {
            resetCard3D(card);
          }
          return;
        }

        // Keep the map and quick-adjuster controls flat while retaining pointer highlights.
        if (card.closest('#quickAdjuster') || card.querySelector('#realMaritimeMap') || overMapStage || isDraggingRange) {
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          card.style.setProperty('--mouse-x', `${x}px`);
          card.style.setProperty('--mouse-y', `${y}px`);
          resetCard3D(card);
          return;
        }

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);

        const nx = (x / rect.width) - 0.5;
        const ny = (y / rect.height) - 0.5;

        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const angleDeg = Math.round(Math.atan2(y - cy, x - cx) * (180 / Math.PI) + 90);
        card.style.setProperty('--specular-angle', `${angleDeg}deg`);

        let maxTiltDeg = 7.5;
        let liftZ = 10;
        let liftY = -4;
        let maxParallaxPx = 7.5;

        if (card.classList.contains('panel-card') || card.classList.contains('modal-card')) {
          maxTiltDeg = 2.2;
          liftZ = 4;
          liftY = -2;
          maxParallaxPx = 4.0;
        } else if (card.classList.contains('control-group')) {
          maxTiltDeg = 4.5;
          liftZ = 6;
          liftY = -2;
          maxParallaxPx = 4.0;
        }

        const rx = (-ny * maxTiltDeg * 2).toFixed(2);
        const ry = (nx * maxTiltDeg * 2).toFixed(2);
        const px = (nx * maxParallaxPx * 2).toFixed(2);
        const py = (ny * maxParallaxPx * 2).toFixed(2);
        const sx = (-nx * 18).toFixed(1);
        const sy = (-ny * 14).toFixed(1);

        card.classList.add('is-tilting');
        card.style.setProperty('--rx', `${rx}deg`);
        card.style.setProperty('--ry', `${ry}deg`);
        card.style.setProperty('--tz', `${liftZ}px`);
        card.style.setProperty('--lift-y', `${liftY}px`);
        card.style.setProperty('--px', `${px}px`);
        card.style.setProperty('--py', `${py}px`);
        card.style.setProperty('--sx', `${sx}px`);
        card.style.setProperty('--sy', `${sy}px`);
      });
    }, { passive: true });
  }

  function bindEvents() {
    const tabButtons = Array.from(document.querySelectorAll('.nav-btn'));

    tabButtons.forEach((btn, newIndex) => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-tab');
        if (newIndex === currentTabIndex && btn.classList.contains('active')) return;

        const directionClass = newIndex >= currentTabIndex ? 'enter-right' : 'enter-left';
        currentTabIndex = newIndex;
        document.body.dataset.activeTab=target;

        tabButtons.forEach(b => b.classList.toggle('active', b === btn));
        updateSlidingPill(btn, true);

        document.querySelectorAll('.tab-panel').forEach(panel => {
          const isTarget = panel.id === target;
          panel.classList.remove('active', 'enter-right', 'enter-left');

          if (isTarget) {
            void panel.offsetWidth;
            panel.classList.add('active', directionClass);
            applyStaggeredCascade(panel);
            triggerLiveChartReplay(target);
          }
        });

        if (target === 'tab-cockpit' && leafletMap) {
          setTimeout(() => leafletMap.invalidateSize(), 60);
          setTimeout(() => { leafletMap.invalidateSize(); if(deferredCamera!==null)switchMapCamera(deferredCamera); }, 420);
        }
        if(window.matchMedia('(max-width: 680px)').matches) {
          requestAnimationFrame(()=>{
            const anchor=document.querySelector(
              target==='tab-cockpit'||target==='tab-scenarios'?'.context-bar':'.page-container'
            );
            const headerHeight=document.querySelector('.topbar').getBoundingClientRect().height;
            window.scrollTo({top:anchor.getBoundingClientRect().top+window.scrollY-headerHeight-20,behavior:'instant'});
            mobileBudget.refresh();
          });
        }
      });
    });

    // Map Camera View Preset Buttons (Eurasia / Europe+UK / Chokepoints)
    document.querySelectorAll('.map-cam-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const cam = btn.getAttribute('data-cam');
        switchMapCamera(cam);
      });
    });

    window.addEventListener('resize', () => {
      updateResponsiveNavigation();
      const activeNavBtn = document.querySelector('.nav-btn.active');
      if (activeNavBtn) updateSlidingPill(activeNavBtn, false);
      if (leafletMap) leafletMap.invalidateSize();
    });

    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.lang = btn.getAttribute('data-lang');
        renderApp();
      });
    });

    const vesselSelect = document.getElementById('vesselSelect');
    if (vesselSelect) {
      vesselSelect.addEventListener('change', (e) => {
        state.selectedVesselId = e.target.value;
        updateVesselRoute();
        renderApp();
      });
    }

    document.querySelectorAll('.scenario-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const sc = btn.getAttribute('data-scenario');
        state.selectedScenario = sc;
        renderApp();
      });
    });

    document.querySelectorAll('.leg-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectLegFilter(btn.getAttribute('data-leg-filter'));
      });
    });

    document.querySelectorAll('.sync-eua').forEach(slider => {
      slider.addEventListener('input', (e) => {
        state.twinState.euaPrice = Number(e.target.value);
        renderApp();
      });
    });

    document.querySelectorAll('.sync-jit').forEach(slider => {
      slider.addEventListener('input', (e) => {
        state.twinState.jitSpeedDeltaKn = Number(e.target.value);
        renderApp();
      });
    });

    document.querySelectorAll('.sync-bio').forEach(slider => {
      slider.addEventListener('input', (e) => {
        state.twinState.biofuelBlendPct = Number(e.target.value);
        renderApp();
      });
    });

    document.querySelectorAll('.sync-pool').forEach(slider => {
      slider.addEventListener('input', (e) => {
        state.twinState.poolingSurplusTonnes = Number(e.target.value);
        renderApp();
      });
    });

    document.querySelectorAll('.seg-target-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.twinState.fueleuTargetCut = Number(btn.getAttribute('data-target'));
        renderApp();
      });
    });

    document.querySelectorAll('.seg-charter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.twinState.charterType = btn.getAttribute('data-charter');
        renderApp();
      });
    });

    document.querySelectorAll('.prompt-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        activePromptId = btn.getAttribute('data-prompt') || 'q1';
        renderApp();
      });
    });

    const roiHoursSlider = document.getElementById('roiHoursSlider');
    if (roiHoursSlider) {
      roiHoursSlider.addEventListener('input', (e) => {
        state.twinState.hoursSaved = Number(e.target.value);
        renderApp();
      });
    }

    document.querySelectorAll('.roi-advisor-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.twinState.advisorSavingsEur = Number(btn.getAttribute('data-advisor'));
        renderApp();
      });
    });

    const resetBtn = document.getElementById('resetTwinBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        state.selectedVesselId = 'v1';
        state.selectedScenario = 'deadlock';
        state.twinState.euaPrice = 80;
        state.twinState.ukEtsPrice = 60;
        state.twinState.fueleuTargetCut = 2.0;
        state.twinState.jitSpeedDeltaKn = 0.0;
        state.twinState.biofuelBlendPct = 0;
        state.twinState.poolingSurplusTonnes = 0;
        state.twinState.charterType = 'voyage_gencon';
        state.selectedLegFilter = 'all';
        state.twinState.hoursSaved=120;state.twinState.advisorSavingsEur=2000;
        updateVesselRoute();
        switchMapCamera('eurasia');
        renderApp();
      });
    }

    const modal = document.getElementById('auditModalBackdrop');
    const openModalBtn = document.getElementById('openAuditModalBtn');
    const closeModalBtn = document.getElementById('closeAuditModalBtn');

    openModalBtn.addEventListener('click',()=>{
      const m=computeComplianceMetrics();
      snapshot={modelVersion:MODEL_VERSION,generatedAt:new Date().toISOString(),vesselId:m.vessel.id,
        evidenceStatus:'teaching-demo-not-verified',etsEmissionYear:2026,ukActivityPeriod:'2026-07/2026-12',
        fuelEUTargetYear:m.settings.year,settings:m.settings,assumptions:ASSUMPTIONS,
        etsComplete:false,externalVerification:'not-performed',humanApproval:'not-performed',
        sources:officialSources.map(({id,url,clause})=>({id,url,clause,checkedAt})),comparison:m.comparison};
      const lang=state.lang;
      document.getElementById('auditSnapshotContent').textContent=[
        `${lang==='zh'?'演示数据，未经核验或人工批准':'Teaching data; no verification or human approval'} · ${MODEL_VERSION}`,
        `${m.vessel.nameEn} · FuelEU target ${m.settings.year}`,
        `EU CO₂ subtotal: ${fmtEur(m.euEtsBillEur,2)} | UK CO₂ subtotal: ${fmtGbp(m.ukEtsBillGbp,2)}`,
        `FuelEU: ${fmtEur(m.fueleuPenaltyEur,2)} | Balance: ${fmtNum(m.netBalanceTonnes,6)} tCB`,
        `EUA: ${m.settings.euaPrice} | Speed Δ: ${m.settings.speedDelta} kn | Blend: ${m.settings.blendPct}%`,
        `Pooling allocated: ${fmtNum(m.comparison.active.allocatedPoolTonnes,4)} tCB | Assumed available: 400 tCB`,
        `CO₂ only; CH₄/N₂O missing. Prices and energy boundaries are assumptions.`,
        `Generated: ${snapshot.generatedAt}`
      ].join('\n');
      modal.classList.add('open');modal.showModal();
    });
    closeModalBtn.addEventListener('click',()=>modal.close());
    modal.addEventListener('close',()=>modal.classList.remove('open'));
    modal.addEventListener('click',e=>{if(e.target===modal)modal.close();});
    document.getElementById('downloadSnapshotBtn').addEventListener('click',()=>{
      const url=URL.createObjectURL(new Blob([JSON.stringify(snapshot,null,2)],{type:'application/json'}));
      const link=document.createElement('a');link.href=url;link.download=`MAREG-${snapshot.vesselId}-snapshot.json`;
      link.click();setTimeout(()=>URL.revokeObjectURL(url),0);
    });

  }

  document.addEventListener('DOMContentLoaded', () => {
    mobileBudget=createMobileBudget();
    initRealMaritimeMap();
    updateVesselRoute();
    bindEvents();
    renderApp();
    initSpatial3DTiltEngine();

    const firstPanel = document.querySelector('.tab-panel.active');
    if (firstPanel) applyStaggeredCascade(firstPanel);
  });
})();
