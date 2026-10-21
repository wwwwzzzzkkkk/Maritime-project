import {createDecisionUi} from './decision-ui.mjs?v=4.6.0';
import { createWorkspaceUi } from './workspace-ui.mjs?v=4.6.0';
import { compileLedger } from './ledger.mjs?v=4.6.0';
import { validateAnalysis, evaluateAnalysis } from './analysis-state.mjs?v=4.6.0';
import { createAiExplain } from './ai-explain.mjs?v=4.6.0';
import { escapeHtml } from './decision-report.mjs?v=4.6.0';
import { createPlanningUi } from './planning-ui.mjs?v=4.6.0';
import { MODEL_VERSION, ASSUMPTIONS, defaultSettings, computeScenario, compareOptions } from './compliance-engine.mjs?v=4.6.0';
import { createMobileBudget } from './mobile-budget.mjs?v=4.6.0';
import { vessels as modelVessels, ports as modelPorts, sources as officialSources, scenarios as ventureScenarios, checkedAt } from './light-data.mjs?v=4.6.0';
/* MAREG light UI v4.6.0 — presentation fixes; calculation engine outputs remain frozen. */

(function () {
  const state = window.MAREG_DATA;
  // Independent per-page state; the shared v3 source file is not edited.
  state.vessels = state.vessels.map(v => ({...v, imo:`DEMO-${v.id.toUpperCase()}`, ch4N2oVerified:false}));
  for(const scenario of ventureScenarios) {
    Object.assign(state.scenarios[scenario.id],{
      triggerZh:scenario.triggerZh,triggerEn:scenario.triggerEn,
      tagStatus:'assumption'
    });
  }
  for (const lang of ['zh','en']) {
    Object.assign(state.i18n[lang], lang==='zh'?{
      kpi1Label:'EU ETS · CO₂ 部分预算（欧元）',kpi2Label:'FuelEU 简化罚款估算（欧元）',
      kpi3Label:'UK ETS · CO₂ 部分预算（英镑）',kpi4Label:'船东承担金额估算（欧元合规部分）',
      cockpitMapTitle:'亚欧—英国示例航线与预设活动范围',
      cockpitLeftTitle:'船舶快速调节器',cockpitLeftSub:'调整参数，比较预算与范围内生命周期排放估算；系数为示例假设'
    }:{
      kpi1Label:'EU ETS CO₂ Subtotal (EUR)',kpi2Label:'FuelEU Model Penalty (EUR)',
      kpi3Label:'UK ETS CO₂ Subtotal (GBP)',kpi4Label:'Estimated Owner Allocation (EUR Compliance)',
      cockpitMapTitle:'Asia–Europe–UK Illustrative Route & Preset Activities',
      cockpitLeftTitle:'Vessel Quick Controls',cockpitLeftSub:'Adjust inputs to compare budgets and in-scope lifecycle estimates; illustrative coefficients'
    });
  }
  state.vessels[0].nameZh='MV DEMO-01（示例货船）';
  state.vessels[0].nameEn='MV DEMO-01 (Demo cargo vessel)';
  state.vessels[1].nameEn='MV PACIFIC HORIZON (Demo Panamax bulker)';
  const customerQuestions={
    q1:{zh:'为什么没有完整 ETS 总额？',en:'Why are ETS totals incomplete?'},
    q2:{zh:'未来情景会改变当前预算吗？',en:'Do future scenarios change this budget?'},
    q3:{zh:'如何比较燃料与组池方案？',en:'How can I compare fuel and pooling?'}
  };
  const customerScenarioActions={
    as_is:{zh:'确认适用范围与实施日期，准备新增字段；在正式规则明确前不估算全球收费。',en:'Confirm applicability and implementation dates, and prepare new fields. Do not estimate global charges before official rules are confirmed.'},
    amended:{zh:'保存当前结果，对照正式修订核对数据和方法，再更新预算。',en:'Save current results, review data and methods against adopted amendments, then update budgets.'},
    deadlock:{zh:'优先补全区域制度所需数据，核对合同偿付条款，继续跟踪官方谈判。',en:'Prioritize regional data completeness and contract reimbursement terms, and follow official negotiations.'}
  };
  state.aiFeed = officialSources.map(s=>({
    status:s.status==='proposal'?'pending':s.status==='contract'?'assumption':'in-force',
    badgeZh:s.status==='proposal'?'待采纳草案':s.status==='contract'?'合同参考':'现行规则参考',
    badgeEn:s.status==='proposal'?'DRAFT':s.status==='contract'?'CONTRACT REFERENCE':'RULE REFERENCE',date:checkedAt,source:s.clause,url:s.url,
    titleZh:s.zh,titleEn:s.en,summaryZh:s.summaryZh,summaryEn:s.summaryEn
  }));
  let deferredCamera = null;
  let originalE1Coordinates;
  let snapshot;
  let mobileBudget;
  let planningUi;
  let planningSettings=defaultSettings();
  const vesselInputs={};
  let currentPlan;
  let workspaceUi,liveAi,decisionUi;
  let vesselProfile;
  const ledgerDocuments={},ledgerModels={};
  let renderFrame=0;
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');

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

  function captureAnalysis() {
    const twin=state.twinState;
    return structuredClone({selectedVesselId:state.selectedVesselId,selectedScenario:state.selectedScenario,language:state.lang,
      twin:{euaPrice:twin.euaPrice,fueleuTargetCut:twin.fueleuTargetCut,jitSpeedDeltaKn:twin.jitSpeedDeltaKn,biofuelBlendPct:twin.biofuelBlendPct,poolingSurplusTonnes:twin.poolingSurplusTonnes,charterType:twin.charterType},
      settings:planningSettings,vesselInputs,ledgerDocuments,...(vesselProfile?{vesselProfile}:{})});
  }
  function restoreAnalysis(input) {
    const a=validateAnalysis(input);
    planningSettings=a.settings;vesselProfile=a.vesselProfile;
    for(const key of Object.keys(vesselInputs))delete vesselInputs[key];
    Object.assign(vesselInputs,a.vesselInputs);
    for(const key of Object.keys(ledgerDocuments)){delete ledgerDocuments[key];delete ledgerModels[key];}
    for(const [id,doc] of Object.entries(a.ledgerDocuments)){ledgerDocuments[id]=doc;ledgerModels[id]=compileLedger(doc,id);}
    state.selectedVesselId=a.selectedVesselId;state.selectedScenario=a.selectedScenario;state.lang=a.language;
    Object.assign(state.twinState,a.twin);state.selectedLegFilter='all';planningUi.reset();
    updateVesselRoute();renderApp();workspaceUi.loadLedgerEditor(ledgerDocuments[state.selectedVesselId]);
  }
  function clearConfirmations() {
    planningSettings.operationsConfirmed=false;planningSettings.fuelConfirmed=false;planningSettings.poolConfirmed=false;
  }
  function computeComplianceMetrics() {
    const originalVessel=getActiveVessel(), twin=state.twinState,compiled=ledgerModels[originalVessel.id];
    let vessel=compiled?{...originalVessel,gt:compiled.vessel.gt,nameZh:compiled.vessel.name,nameEn:compiled.vessel.name,imo:`USER-${originalVessel.id.toUpperCase()}`,fuelType:'User ledger / 未核验台账'}:originalVessel;
    const modelVessel=compiled?{...compiled.vessel}:{...modelVessels.find(v=>v.id===vessel.id),...vesselInputs[vessel.id]};
    if(vesselProfile){Object.assign(modelVessel,vesselProfile);vessel={...vessel,gt:vesselProfile.gt,nameZh:vesselProfile.name,nameEn:vesselProfile.name,imo:vesselProfile.reference};}
    const ownerSharePct={voyage_gencon:.85,time_nype_bimco:.18,split_blue_ga:.5}[twin.charterType];
    const settings={...defaultSettings(),...planningSettings,year:twin.fueleuTargetCut===6?2030:2026,
      euaPrice:twin.euaPrice,ukPrice:planningSettings.ukPrice,speedDelta:twin.jitSpeedDeltaKn,
      blendPct:twin.biofuelBlendPct,poolingTonnes:twin.poolingSurplusTonnes,
      etsOwnerPct:ownerSharePct*100,fuelOwnerPct:ownerSharePct*100,poolOwnerPct:ownerSharePct*100,operatingOwnerPct:ownerSharePct*100};
    const c=compareOptions(modelVessel,settings), a=c.active, b=c.baseline;
    const computedLegs=modelVessel.legs.map((leg,i)=>({id:leg.id,code:leg.id,routeZh:leg.zh,routeEn:leg.en,
      regime:leg.currency==='EUR'?'EU ETS':'UK ETS',currency:leg.currency,coveragePct:leg.coverage,adjRaw:a.legs[i].co2Tonnes,
      adjCovered:a.legs[i].coveredTonnes,unitPrice:a.legs[i].unitPrice,cost:a.legs[i].cost}));
    const aux=a.legs.find(leg=>leg.id==='AUX');
    if(aux)computedLegs.push({id:'AUX',code:'AUX',routeZh:'新增航时辅助燃油（模型）',routeEn:'Extra-time auxiliary fuel (model)',
      regime:'EU ETS',currency:'EUR',coveragePct:aux.coverage,adjRaw:aux.co2Tonnes,adjCovered:aux.coveredTonnes,cost:aux.cost});

    return {
      vessel,modelVessel,settings,comparison:c,scenario:state.scenarios[state.selectedScenario],computedLegs,
      euCoveredCo2:a.euCoveredCo2,ukCoveredCo2:a.ukCoveredCo2,euEtsBillEur:a.euEts,
      euEtsLow60:a.euCoveredCo2*60,euEtsHigh100:a.euCoveredCo2*100,ukEtsBillGbp:a.ukEts,
      targetIntensity:a.target,actualIntensity:a.actualIntensity,netBalanceGrams:a.netBalanceGrams,
      netBalanceTonnes:a.netBalanceGrams/1e6,vlsfoEqTonnes:Math.max(-a.netBalanceGrams,0)/(a.actualIntensity*41000),
      fueleuPenaltyEur:a.fuelEu,a3Penalty2Eur:b.fuelEu,jitFuelSavingsEur:a.fuelSaving,
      biofuelPremiumCostEur:a.blendCost,poolingCostEur:a.poolCost,totalRegionalEur:a.complianceEur,
      ownerSharePct,chartererSharePct:1-ownerSharePct,ownerEurExposure:a.ownerEur,chartererEurExposure:a.chartererEur,
      charterNoteZh:`演示分摊：船东 ${(ownerSharePct*100).toFixed(0)}% / 合同偿付方 ${((1-ownerSharePct)*100).toFixed(0)}%。不是 GENCON、NYPE 或 BIMCO 的默认比例；首页只分配欧元合规部分（含组池）；下表另外按同一示例比例分摊营运增量，英国费用均另列。`,
      charterNoteEn:`Illustrative allocation: Owner ${(ownerSharePct*100).toFixed(0)}% / reimbursing party ${((1-ownerSharePct)*100).toFixed(0)}%. Not GENCON/NYPE/BIMCO defaults. The headline allocates EUR compliance only (including pool fees); the table also allocates operating deltas at the same illustrative share. UK costs remain separate.`,
      baselinePhysicalWtWTonnes:b.physicalWtWTonnes,currentPhysicalWtWTonnes:a.physicalWtWTonnes,
      physicalReductionPct:-c.physicalDeltaPct,baselineFinancialEur:b.totalEur,currentFinancialEur:a.totalEur,
      financialReductionPct:-c.costDeltaPct
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

    indicator.style.setProperty('--w', `${width}px`);
    indicator.style.setProperty('--nav-x', `${offsetLeft}px`);

    if (animateStretch && !reducedMotion.matches) {
      indicator.classList.add('is-moving');
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
    if (!panelEl || reducedMotion.matches) return;
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

  function updateChangeRings(m, replay=false) {
    const lang=state.lang;
    const scale=lang==='zh'
      ? '满环 = ±30%，超过按满环显示，中心为真实百分比；非零最小弧长为满环的 3%，0% 无圆弧。'
      : 'Full ring = ±30%; larger changes are capped at a full ring; the centre shows the true percentage. Non-zero changes use at least 3% of the ring; zero has no arc.';
    for(const [id,pct,zh,en] of [
      ['ringArcFinancial',-m.financialReductionPct,'欧元费用变化','EUR cost change'],
      ['ringArcPhysical',-m.physicalReductionPct,'范围内 WtW 模型变化','Scoped WtW model change']
    ]) {
      const ring=document.getElementById(id);
      const length=pct===0?0:Math.min(251,Math.max(251*.03,Math.abs(pct)/30*251));
      ring.classList.toggle('is-zero',pct===0);
      ring.classList.toggle('is-increase',pct>0);
      ring.closest('svg').setAttribute('aria-label',`${lang==='zh'?zh:en}: ${pct.toFixed(4)}%. ${scale}`);
      const draw=()=>ring.setAttribute('stroke-dasharray',`${length} 251`);
      if(replay && !reducedMotion.matches) {
        ring.classList.add('is-resetting');ring.setAttribute('stroke-dasharray','0 251');
        requestAnimationFrame(()=>requestAnimationFrame(()=>{
          ring.classList.remove('is-resetting');ring.classList.add('is-live-replay');draw();
        }));
      } else draw();
    }
  }

  function fullRouteBounds() {
    return L.latLngBounds([...mapLayers.lineE1.getLatLngs(),...mapLayers.lineE2.getLatLngs(),...mapLayers.lineU1.getLatLngs()]);
  }

  function fitFullRoute(animate=false) {
    leafletMap.invalidateSize();
    const options={padding:[24,24]};
    if(animate && !reducedMotion.matches)leafletMap.flyToBounds(fullRouteBounds(),{...options,duration:.85});
    else leafletMap.fitBounds(fullRouteBounds(),options);
  }

  function openExternalLinksSeparately() {
    document.querySelectorAll('a[href^="https://"],a[href^="http://"]').forEach(link=>{
      link.target='_blank';link.rel='noopener noreferrer';
    });
  }

  /**
   * Effect #6: Live Telemetry & Chart Replay on Tab Entry
   */
  function triggerLiveChartReplay(panelId) {
    const m = computeComplianceMetrics();

    if(reducedMotion.matches)return;
    if (panelId === 'tab-sandbox') {
      const ownerBar = document.getElementById('ownerSplitBar');
      const chartBar = document.getElementById('chartererSplitBar');
      if (ownerBar && chartBar) {
        ownerBar.classList.add('is-resetting');
        chartBar.classList.add('is-resetting');
        ownerBar.style.setProperty('--w','0%');
        chartBar.style.setProperty('--w','0%');
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            ownerBar.classList.remove('is-resetting');ownerBar.classList.add('is-live-replay');
            chartBar.classList.remove('is-resetting');chartBar.classList.add('is-live-replay');
            ownerBar.style.setProperty('--w', `${(m.ownerSharePct * 100).toFixed(0)}%`);
            chartBar.style.setProperty('--w', `${(m.chartererSharePct * 100).toFixed(0)}%`);
          });
        });
      }
    } else if (panelId === 'tab-audit') {
      updateChangeRings(m,true);
    } else if (panelId === 'tab-scenarios') {
      const bars = document.querySelectorAll('#tab-scenarios .bar-fill');
      bars.forEach((bar, i) => {
        const targetW = bar.getAttribute('data-target-width') || '85%';
        bar.classList.add('is-resetting');
        bar.style.setProperty('--w','0%');
        setTimeout(() => {
          bar.classList.remove('is-resetting');bar.classList.add('is-scenario-replay');
          bar.style.setProperty('--w',targetW);
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
        fitFullRoute(true);
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
        leafletMap.flyTo([52.2, 3.8], 5, { duration: 0.85, animate:!reducedMotion.matches });
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
        leafletMap.flyTo([34.5, 13.5], 4, { duration: 0.85, animate:!reducedMotion.matches });
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

    try {
      leafletMap = L.map('realMaritimeMap', {
        minZoom: 1,
        zoomSnap: .25,
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

      fetch('vendor/geo/ne_50m_admin_0_countries.geojson')
        .then(res => res.ok ? res.json() : null)
        .then(geojson => {
          if (geojson && leafletMap) {
            mapLayers.countries=L.geoJSON(geojson, {
              style: feature => {
                const iso=feature.properties.ADM0_A3;
                const isEU=new Set(['AUT','BEL','BGR','HRV','CYP','CZE','DNK','EST','FIN','FRA','DEU','GRC','HUN','IRL','ITA','LVA','LTU','LUX','MLT','NLD','POL','PRT','ROU','SVK','SVN','ESP','SWE']).has(iso);
                const isUK=iso==='GBR';
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
      fitFullRoute();
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
          roleZh: '欧盟指定 <300nm 邻近集装箱转运港（是否适用须按船型、挂靠性质与官方名单核对）',
          roleEn: 'EU-Designated <300nm Neighboring Transshipment Port (Applicability Requires Review)',
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
        marker.bindPopup(()=>buildMapPopup(marker));
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
    if(ledgerModels[state.selectedVesselId])legId='all';
    state.selectedLegFilter = legId;
    document.querySelectorAll('.leg-filter-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-leg-filter') === legId);
    });
    renderApp();
  }

  function buildMapPopup(marker) {
    const lang=state.lang,m=computeComplianceMetrics(),p=marker.portMeta;
    if(ledgerModels[state.selectedVesselId])return `<div class="port-popup"><strong>${lang==='zh'?p.nameZh:p.nameEn}</strong><p>${lang==='zh'?'演示地图港口，不关联当前导入台账的费用或航线。':'Illustrative map port; not linked to the imported ledger costs or routes.'}</p></div>`;
    const legObj=m.computedLegs.find(l=>l.id===p.legId)||m.computedLegs[0];
    const costStr=legObj.currency==='EUR'?fmtEur(legObj.cost,0):fmtGbp(legObj.cost,0);
    return `
        <div class="port-popup">
          <div class="port-popup-heading">
            <strong class="port-popup-title">${lang === 'zh' ? p.nameZh : p.nameEn}</strong>
            <span class="mono port-popup-code">${p.code}</span>
          </div>
          <div class="mono port-popup-coordinates">
            LAT ${p.coords[0].toFixed(2)}° · LON ${p.coords[1].toFixed(2)}°
          </div>
          <div class="port-popup-description">
            ${lang === 'zh' ? p.roleZh : p.roleEn}
          </div>
          <div class="port-popup-cost">
            <span class="text-muted-copy">${legObj.code} (${(legObj.coveragePct * 100).toFixed(0)}%)</span>
            <strong class="text-primary">${costStr}</strong>
          </div>
        </div>
      `;
  }

  function updateMapPopups() {
    mapLayers.portMarkers.forEach(marker=>{if(marker.isPopupOpen())marker.getPopup().update();});
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
    if(document.getElementById('tab-cockpit').classList.contains('active') && document.querySelector('.map-cam-btn.active').dataset.cam==='eurasia')fitFullRoute();
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

  function scheduleRender() {
    if(renderFrame)return;
    renderFrame=requestAnimationFrame(()=>{renderFrame=0;renderApp();});
  }

  function renderApp() {
    if(renderFrame){cancelAnimationFrame(renderFrame);renderFrame=0;}
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
    setText('dataModeNotice',ledgerModels[state.selectedVesselId]?(lang==='zh'?'使用本机导入台账，尚未经外部核验；不是船载实时数据。':'Using a locally imported ledger, not externally verified or live shipboard data.'):(vesselProfile?(lang==='zh'?'船队模板范围推演，数据及年度完整性未核验。':'Fleet template-scope what-if; data and annual completeness unverified.'):(lang==='zh'?'使用预设示例船舶与价格；可按需载入本机台账。':'Preset demo vessels/prices; local ledgers can be loaded explicitly.')));
    for(const button of document.querySelectorAll('.leg-filter-btn'))button.disabled=Boolean(ledgerModels[state.selectedVesselId])&&button.dataset.legFilter!=='all';
    const destination={v1:'DEHAM',v2:'BEANR',v3:'DEBRV'}[state.selectedVesselId];
    document.querySelector('[data-leg-filter="E1"]').textContent=`E1 · ${lang==='zh'?'欧盟外航段':'Extra-EU'} 50% (${state.selectedVesselId==='v3'?'MAPTM':'CNSHA'}→NLRTM)`;
    document.querySelector('[data-leg-filter="E2"]').textContent=`E2 · ${lang==='zh'?'欧盟内航段':'Intra-EU'} 100% (NLRTM→${destination})`;
    document.querySelector('[data-leg-filter="E3"]').textContent=lang==='zh'?'E3 · 欧盟港内 100%':'E3 · EU Berth 100%';
    document.querySelector('[data-leg-filter="U1"]').textContent=lang==='zh'?'U1/U2 · 英国 ETS（£ · GBFXT→GBSOU）':'U1/U2 · UK ETS (£ · GBFXT→GBSOU)';

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
          ${escapeHtml(vesselProfile&&v.id===state.selectedVesselId?vesselProfile.name+' · '+(lang==='zh'?'船队载入':'Fleet loaded'):ledgerDocuments[v.id]?.profile.name||(lang === 'zh' ? v.nameZh : v.nameEn))}
        </option>
      `).join('');
    }

    setHTML('vesselMetaPills', `
      <span class="meta-pill">${escapeHtml(m.vessel.imo)}</span>
      <span class="meta-pill">${fmtNum(m.vessel.gt)} GT</span>
      <span class="meta-pill">${escapeHtml(m.vessel.fuelType)}</span>
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
      <span class="mono">-${twin.fueleuTargetCut.toFixed(0)}% (${m.targetIntensity.toFixed(4)})</span>
    `);

    setText('kpiUkEtsVal', fmtGbp(m.ukEtsBillGbp, 0));
    setHTML('kpiUkEtsSub', `
      <span>${fmtNum(m.ukCoveredCo2, 0)} tCO₂ × £${m.settings.ukPrice}</span>
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

    document.querySelectorAll('.sync-pool').forEach(el => { el.max=m.settings.poolAvailable;el.value = twin.poolingSurplusTonnes; });
    document.querySelectorAll('.readout-pool').forEach(el => { el.textContent = `+${fmtNum(twin.poolingSurplusTonnes,0)} tCB`; });

    document.querySelectorAll('.seg-target-btn').forEach(btn => {
      btn.classList.toggle('active', Number(btn.dataset.target) === twin.fueleuTargetCut);
    });

    document.querySelectorAll('.seg-charter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.charter === twin.charterType);
    });

    const hygieneAlertEl=document.getElementById('cockpitHygieneAlert');
    hygieneAlertEl.className='alert-banner amber';
    hygieneAlertEl.innerHTML=`<div><strong>${lang==='zh'?'演示数据：缺失 CH₄ / N₂O，完整 ETS 总额不可用':'Demo Data: CH₄ / N₂O Missing; Complete ETS Total Unavailable'}</strong><span>${lang==='zh'?`当前 EU 仅单列 CO₂ ${fmtNum(m.euCoveredCo2,1)} 吨，UK ${fmtNum(m.ukCoveredCo2,1)} 吨；未经外部核验。FuelEU 能源独立给定，未与同一燃料台账物理对账。`:`Current CO₂ subtotals: EU ${fmtNum(m.euCoveredCo2,1)} t, UK ${fmtNum(m.ukCoveredCo2,1)} t; not externally verified. FuelEU energy is independently specified, not physically reconciled to a common ledger.`}</span></div>`;

    const supplyAlertEl = document.getElementById('bunkerSupplyAlert');
    if (supplyAlertEl) {
      if (twin.biofuelBlendPct > 0) {
        supplyAlertEl.hidden=false;
        supplyAlertEl.innerHTML = `
          <div>
            <strong>${lang === 'zh' ? '示例燃料系数与供给待核实' : 'Illustrative Fuel Coefficients & Unverified Supply'}</strong>
            <span>${lang === 'zh'
              ? `当前设定掺烧 ${twin.biofuelBlendPct}%：公式上可降低罚款，但0.26/0.32 为示例系数；认证、发动机兼容性、港口供给及价格均待核实。`
              : `At ${twin.biofuelBlendPct}% blend, penalties drop mathematically, but certification, engine compatibility, port supply and prices remain unverified; 0.26/0.32 are teaching coefficients.`}</span>
          </div>
        `;
      } else {
        supplyAlertEl.hidden=true;
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
      ownerSplitBar.style.setProperty('--w', `${(m.ownerSharePct * 100).toFixed(0)}%`);
      chartererSplitBar.style.setProperty('--w', `${(m.chartererSharePct * 100).toFixed(0)}%`);
    }
    setText('charterExplainBox', lang === 'zh' ? m.charterNoteZh : m.charterNoteEn);

    const c=m.comparison;
    setHTML('optionDeltaSummary', `<div><strong>${lang==='zh'?'当前方案与同条件基准':'Active Option vs. Same-Condition Baseline'}</strong><span>${lang==='zh'?'范围内欧元净支出变化（含航时费）':'Scoped EUR net expenditure change'}: ${fmtEur(c.costDelta,2)} · ${lang==='zh'?'负值表示节省；不含英国费用，也不是完整航次成本。':'Negative means savings; excludes UK costs and is not the full voyage cost.'}</span></div>`);
    currentPlan=planningUi.render(m,lang,{...defaultSettings(),...(ledgerModels[m.vessel.id]?{distanceNm:ledgerModels[m.vessel.id].screened.distanceNm}:{}),euEnergyMJ:ledgerModels[m.vessel.id]?.vessel.euEnergyMJ??modelVessels.find(v=>v.id===m.vessel.id).euEnergyMJ,actualWtWIntensity:ledgerModels[m.vessel.id]?.vessel.actualWtWIntensity??modelVessels.find(v=>v.id===m.vessel.id).actualWtWIntensity});
    workspaceUi.render(m,lang);liveAi.render(lang);decisionUi.render(m,lang);

    const auditRows=m.computedLegs.map(l=>`<tr><td class="mono"><strong>${l.code}</strong></td><td>${lang==='zh'?l.routeZh:l.routeEn}</td><td><span class="formula-code">CO₂ × ${l.coveragePct*100}% × ${l.currency==='EUR'?'EUA':'UKA'}</span></td><td class="num">${fmtNum(l.adjRaw,2)} × ${l.coveragePct*100}% = ${fmtNum(l.adjCovered,2)} t</td><td class="num">${l.currency==='EUR'?fmtEur(l.cost,2):fmtGbp(l.cost,2)}</td><td>CO₂ only</td></tr>`);
    auditRows.push(`<tr><td>FuelEU · Active</td><td>${lang==='zh'?'当前目标与实际组池分配':'Current target and allocated pooling'}</td><td><span class="formula-code">max(−CB,0) / (${fmtNum(m.actualIntensity,4)} × 41,000) × €2,400</span></td><td class="num">${fmtNum(m.netBalanceGrams)} g · ${fmtNum(c.active.allocatedPoolTonnes,4)} tCB pool</td><td class="num">${fmtEur(m.fueleuPenaltyEur,2)}</td><td>${lang==='zh'?'单期简化估算':'Single-period model'}</td></tr>`);
    auditRows.push(`<tr><td>Time / Aux</td><td>${lang==='zh'?'同一比较范围的新增航时':'Extra time in the same comparison scope'}</td><td>${lang==='zh'?'距离/新航速 − 距离/基准航速；时间费与辅助燃油按天计':'Distance/new speed − distance/base speed; daily time and auxiliary fuel'}</td><td>${fmtNum(c.active.extraHours,2)} h · ${fmtNum(c.active.extraAuxFuelTonnes,4)} t VLSFO-eq</td><td>${fmtEur(c.active.timeCost,2)}</td><td>${lang==='zh'?'用户输入/示例假设':'User/demo assumptions'}</td></tr>`);
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

    updateChangeRings(m);

    const reflexEl = document.getElementById('reflexiveStatusText');
    if (reflexEl) {
      if (Math.abs(c.physicalDelta)<0.00001 && Math.abs(c.costDelta)>0.005) {
        reflexEl.className = 'alert-banner amber';
        reflexEl.innerHTML = `
          <div>
            <strong>${lang === 'zh' ? '反漂绿预警：纯财务池化抵扣（本船物理排放未降）' : 'Anti-Greenwashing Warning: Financial Pooling Only'}</strong>
            <span>${lang === 'zh'
              ? `当前模拟组池实际分配 ${fmtNum(c.active.allocatedPoolTonnes,4)} tCB，财务支出下降，但本船物理 WtW 排放仍为 ${fmtNum(m.currentPhysicalWtWTonnes, 0)} 吨（0.0% 物理减排），严禁对外宣传为“本船低碳航次”。`
              : `Financial exposure dropped via ${fmtNum(c.active.allocatedPoolTonnes,4)} tCB of simulated pooling, but physical shipboard WtW emissions remain unchanged (0.0% physical reduction).`}</span>
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
      <div class="row-between-wrap">
        <strong class="scenario-heading">${lang === 'zh' ? sc.titleZh : sc.titleEn}</strong>
        <span class="badge badge-${sc.tagStatus}">${lang==='zh'?'假设情景 · 非生效规则':'Hypothetical · not in force'}</span>
      </div>
      <p class="scenario-description">
        ${lang === 'zh' ? sc.triggerZh : sc.triggerEn}
      </p>
      <div class="scenario-review">
        <strong class="text-primary">${lang === 'zh' ? '需要核对：' : 'Review next: '}</strong>
        ${customerScenarioActions[state.selectedScenario][lang]}
      </div>
    `);

    // Customer help: preset explanations of current results.
    document.querySelectorAll('.prompt-chip').forEach(chip => {
      chip.classList.toggle('active', chip.getAttribute('data-prompt') === activePromptId);
    });

    const question=customerQuestions[activePromptId][lang];
    const answers={
      q1:lang==='zh'?`当前 EU ${fmtEur(m.euEtsBillEur)}、UK ${fmtGbp(m.ukEtsBillGbp)} 均仅为 CO₂ 部分预算。缺失 CH₄/N₂O 不等于零，也未发生外部核验。`:`EU ${fmtEur(m.euEtsBillEur)} and UK ${fmtGbp(m.ukEtsBillGbp)} are CO₂ subtotals only. Missing CH₄/N₂O is not zero; no external verification was performed.`,
      q2:lang==='zh'?'不会。三种监管路径选择只改变说明；显式保存并载入规划条件后，预算才重新计算。全球收费不在当前计算中，须核对正式规则与生效日期。':'No. Policy paths change the explanation only; budgets recalculate when explicit planning conditions are loaded. Global charges are excluded; confirm adopted rules and effective dates.',
      q3:lang==='zh'?`当前强度 ${fmtNum(m.actualIntensity,4)}，目标 ${fmtNum(m.targetIntensity,4)}；分配 ${fmtNum(c.active.allocatedPoolTonnes,4)} tCB 后罚款 ${fmtEur(m.fueleuPenaltyEur,2)}。供给、燃料认证与合同未验证，不能据此宣称最优或实际减排。`:`Current intensity ${fmtNum(m.actualIntensity,4)}, target ${fmtNum(m.targetIntensity,4)}; allocation ${fmtNum(c.active.allocatedPoolTonnes,4)} tCB leaves ${fmtEur(m.fueleuPenaltyEur,2)} penalty. Supply, fuel certification and contracts are unverified; no optimum or realized reduction is claimed.`
    };
    setHTML('aiAnswerBox',`<strong>${question}</strong><p class="answer-copy">${answers[activePromptId]}</p><span class="badge badge-assumption">${lang==='zh'?'预设解释 · 非 AI 服务':'Preset explanation · no AI service'}</span>`);

    setHTML('aiFeedContainer', state.aiFeed.map(item => `
      <div class="control-group reference-entry">
        <div class="row-between">
          <strong class="strong-caption">${lang === 'zh' ? item.titleZh : item.titleEn}</strong>
          <span class="badge badge-${item.status}">${lang === 'zh' ? item.badgeZh : item.badgeEn}</span>
        </div>
        <p class="reference-summary">${lang === 'zh' ? item.summaryZh : item.summaryEn}</p>
        <div class="mono reference-citation">${item.date} · <a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.source}</a></div>
      </div>
    `).join(''));

    updateMapPopups();
    mobileBudget.update(m,lang);
    openExternalLinksSeparately();

    requestAnimationFrame(() => {
      const activeNavBtn = document.querySelector('.nav-btn.active');
      if (activeNavBtn) updateSlidingPill(activeNavBtn, false);
    });
  }

  /**
   * Delegated Spatial 3D Tilt & Multi-Plane Parallax (v4.6.0)
   * - Never tilts the panel-card containing the interactive GIS map when hovering inside .map-stage
   */
  function initSpatial3DTiltEngine() {
    const selector='.kpi-card, .panel-card, .gauge-card, .control-group, .modal-card';
    let active=new Set(),frame=0,pending=null,dragging=false;
    function reset(card) {
      card.classList.remove('is-tilting');
      for(const [key,value] of Object.entries({'--rx':'0deg','--ry':'0deg','--tz':'0px','--lift-y':'0px','--px':'0px','--py':'0px','--sx':'0px','--sy':'0px'}))card.style.setProperty(key,value);
    }
    function clear() {active.forEach(reset);active.clear();if(frame)cancelAnimationFrame(frame);frame=0;pending=null;}
    document.addEventListener('mousedown',e=>{if(e.target.matches('input[type="range"]'))dragging=true;});
    document.addEventListener('mouseup',()=>{dragging=false;});
    document.addEventListener('mouseleave',clear);window.addEventListener('blur',clear);
    reducedMotion.addEventListener('change',clear);
    document.addEventListener('mousemove',event=>{
      if(reducedMotion.matches){clear();return;}
      pending={target:event.target,x:event.clientX,y:event.clientY};
      if(frame)return;
      frame=requestAnimationFrame(()=>{
        frame=0;const e=pending,next=new Set();
        for(let c=e.target.closest(selector);c;c=c.parentElement.closest(selector))next.add(c);
        active.forEach(card=>{if(!next.has(card))reset(card);});
        const reading=e.target.closest('.table-wrap, .reference-list');
        next.forEach(card=>{
          const rect=card.getBoundingClientRect(),x=e.x-rect.left,y=e.y-rect.top;
          card.style.setProperty('--mouse-x',`${x}px`);card.style.setProperty('--mouse-y',`${y}px`);
          // Intentional local exception: only the reading region is flat (sticky drift was ~2px).
          // Other titles retain tilt. Input/simulation and the four requested work/read panels stay flat, including nested controls.
          if(dragging||card.closest('#quickAdjuster, #planningInputsPanel, #voyageSimulation, #liveAiPanel, #charterAllocationPanel, #officialSourcesPanel, #policyPlanningPanel, [data-flat-panel]')||card.querySelector('#realMaritimeMap')||(reading&&(card.contains(reading)||reading.contains(card)))){reset(card);return;}
          const nx=x/rect.width-.5,ny=y/rect.height-.5;
          card.style.setProperty('--specular-angle',`${Math.round(Math.atan2(y-rect.height/2,x-rect.width/2)*180/Math.PI+90)}deg`);
          const panel=card.matches('.panel-card,.modal-card'),control=card.matches('.control-group');
          const tilt=panel?2.2:control?4.5:7.5,parallax=panel||control?4:7.5;
          card.classList.add('is-tilting');
          for(const [key,value] of Object.entries({'--rx':`${(-ny*tilt*2).toFixed(2)}deg`,'--ry':`${(nx*tilt*2).toFixed(2)}deg`,'--tz':`${panel?4:control?6:10}px`,'--lift-y':`${panel||control?-2:-4}px`,'--px':`${(nx*parallax*2).toFixed(2)}px`,'--py':`${(ny*parallax*2).toFixed(2)}px`,'--sx':`${(-nx*18).toFixed(1)}px`,'--sy':`${(-ny*14).toFixed(1)}px`}))card.style.setProperty(key,value);
        });active=next;
      });
    },{passive:true});
  }

  function bindEvents() {
    const indicator=document.getElementById('navPillIndicator');
    indicator.addEventListener('transitionend',e=>{if(e.propertyName==='transform')indicator.classList.remove('is-moving');});
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
              target==='tab-cockpit'?'.context-bar':'.page-container'
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
      if (leafletMap) {
        leafletMap.invalidateSize();
        if(document.getElementById('tab-cockpit').classList.contains('active') && document.querySelector('.map-cam-btn.active').dataset.cam==='eurasia')fitFullRoute();
      }
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
        state.selectedVesselId = e.target.value;vesselProfile=undefined;
        planningUi.reset();
        planningSettings.operationsConfirmed=false;planningSettings.fuelConfirmed=false;planningSettings.poolConfirmed=false;
        updateVesselRoute();
        renderApp();workspaceUi.loadLedgerEditor(ledgerDocuments[state.selectedVesselId]);
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
        scheduleRender();
      });
    });

    document.querySelectorAll('.sync-jit').forEach(slider => {
      slider.addEventListener('input', (e) => {
        state.twinState.jitSpeedDeltaKn = Number(e.target.value);
        scheduleRender();
      });
    });

    document.querySelectorAll('.sync-bio').forEach(slider => {
      slider.addEventListener('input', (e) => {
        state.twinState.biofuelBlendPct = Number(e.target.value);
        scheduleRender();
      });
    });

    document.querySelectorAll('.sync-pool').forEach(slider => {
      slider.addEventListener('input', (e) => {
        state.twinState.poolingSurplusTonnes = Number(e.target.value);
        scheduleRender();
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

    const resetBtn = document.getElementById('resetTwinBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        planningSettings=defaultSettings();vesselProfile=undefined;
        for(const key of Object.keys(ledgerDocuments)){delete ledgerDocuments[key];delete ledgerModels[key];}
        workspaceUi.reset();
        for(const key of Object.keys(vesselInputs))delete vesselInputs[key];
        planningUi.reset();
        state.selectedVesselId = 'v1';
        state.selectedScenario = 'deadlock';
        state.twinState.euaPrice = 80;
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
      snapshot={uiVersion:'4.6.0',modelVersion:MODEL_VERSION,generatedAt:new Date().toISOString(),vesselId:m.vessel.id,
        evidenceStatus:'teaching-demo-not-verified',etsEmissionYear:2026,ukActivityPeriod:'2026-07/2026-12',
        fuelEUTargetYear:m.settings.year,settings:m.settings,assumptions:ASSUMPTIONS,
        etsComplete:false,externalVerification:'not-performed',humanApproval:'not-performed',
        sources:officialSources.map(({id,url,clause})=>({id,url,clause,checkedAt})),modelInputs:m.modelVessel,planner:currentPlan,comparison:m.comparison};
      if(ledgerDocuments[state.selectedVesselId])Object.assign(snapshot,{evidenceStatus:'user-input-not-verified',ledger:structuredClone(ledgerDocuments[state.selectedVesselId]),scopeScreening:ledgerModels[state.selectedVesselId].screened});
      const lang=state.lang;
      document.getElementById('auditSnapshotContent').textContent=[
        `${lang==='zh'?'演示或用户输入，未经核验或人工批准':'Demo/user inputs; no verification or human approval'} · ${MODEL_VERSION}`,
        `${m.vessel.nameEn} · FuelEU target ${m.settings.year}`,
        `EU CO₂ subtotal: ${fmtEur(m.euEtsBillEur,2)} | UK CO₂ subtotal: ${fmtGbp(m.ukEtsBillGbp,2)}`,
        `FuelEU: ${fmtEur(m.fueleuPenaltyEur,2)} | Balance: ${fmtNum(m.netBalanceTonnes,6)} tCB`,
        `EUA: ${m.settings.euaPrice} | Speed Δ: ${m.settings.speedDelta} kn | Blend: ${m.settings.blendPct}%`,
        `Pooling allocated: ${fmtNum(m.comparison.active.allocatedPoolTonnes,4)} tCB | Assumed available: ${fmtNum(m.settings.poolAvailable,0)} tCB`,
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
    planningUi=createPlanningUi({
      onApplyInputs(values) {
        const {euEnergyMJ,actualWtWIntensity,...settings}=values;
        if(ledgerModels[state.selectedVesselId])settings.distanceNm=ledgerModels[state.selectedVesselId].screened.distanceNm;
        else vesselInputs[state.selectedVesselId]={euEnergyMJ,actualWtWIntensity};
        Object.assign(planningSettings,settings);
        state.twinState.poolingSurplusTonnes=Math.min(state.twinState.poolingSurplusTonnes,settings.poolAvailable);
        renderApp();
      },
      onPreset(id) {
        const presets={baseline:{bio:0,jit:0,pool:0},speed:{jit:-1},fuel:{bio:20},pool:{pool:200}};
        for(const [control,value] of Object.entries(presets[id])) {
          const slider=document.querySelector(`.sync-${control}`);
          slider.value=value;slider.dispatchEvent(new Event('input',{bubbles:true}));
        }
      },
      onApplyOption(option) {
        state.twinState.jitSpeedDeltaKn=option.speedDelta;
        state.twinState.biofuelBlendPct=option.blendPct;
        state.twinState.poolingSurplusTonnes=option.allocatedPoolTonnes>0?planningSettings.poolAvailable:0;
        renderApp();
      }
    });
    workspaceUi=createWorkspaceUi({capture:captureAnalysis,restore:restoreAnalysis,getDesk:()=>decisionUi.getState(),setDesk:data=>decisionUi.replaceState(data),markDeskSaved:()=>decisionUi.markSaved(),
      applyLedger(document) {
        const id=state.selectedVesselId,compiled=compileLedger(document,id);
        ledgerDocuments[id]=structuredClone(document);ledgerModels[id]=compiled;
        if(vesselProfile)vesselProfile={...vesselProfile,name:document.profile.name,gt:document.profile.gt,serviceSpeedKn:document.profile.serviceSpeedKn};
        planningSettings.distanceNm=compiled.screened.distanceNm;clearConfirmations();planningUi.reset();state.selectedLegFilter='all';renderApp();
      },
      clearLedger(){delete ledgerDocuments[state.selectedVesselId];delete ledgerModels[state.selectedVesselId];planningSettings.distanceNm=defaultSettings().distanceNm;clearConfirmations();planningUi.reset();state.selectedLegFilter='all';renderApp();}
    });
    decisionUi=createDecisionUi({capture:captureAnalysis,restore:restoreAnalysis,navigate:id=>document.querySelector('[data-tab="'+id+'"]').click(),openWorkspace:()=>document.getElementById('openAuditModalBtn').click()});
    liveAi=createAiExplain({capture:captureAnalysis,evaluate:evaluateAnalysis,getCases:()=>workspaceUi.getCases()});
    initRealMaritimeMap();
    updateVesselRoute();
    bindEvents();
    renderApp();
    initSpatial3DTiltEngine();

    const firstPanel = document.querySelector('.tab-panel.active');
    if (firstPanel) applyStaggeredCascade(firstPanel);
  });
})();
