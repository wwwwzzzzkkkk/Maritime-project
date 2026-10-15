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
    return state.vessels.find(v => v.id === state.selectedVesselId) || state.vessels[0];
  }

  function computeComplianceMetrics() {
    const vessel = getActiveVessel();
    const twin = state.twinState;
    const scenario = state.scenarios[state.selectedScenario] || state.scenarios.deadlock;

    const baseSpeed = vessel.serviceSpeedKn;
    const newSpeed = Math.max(baseSpeed + twin.jitSpeedDeltaKn, baseSpeed - 2.5);
    const speedFuelFactor = twin.jitSpeedDeltaKn === 0 ? 1.0 : Math.pow(newSpeed / baseSpeed, 2) * 0.88 + 0.12;

    const blendRatio = twin.biofuelBlendPct / 100;
    const ttwBlendReduction = blendRatio * 0.26;
    const effectiveFuelFactor = speedFuelFactor * (1 - ttwBlendReduction);

    let euRawCo2 = 0;
    let euCoveredCo2 = 0;
    let ukRawCo2 = 0;
    let ukCoveredCo2 = 0;

    const computedLegs = vessel.legs.map(leg => {
      const isBerth = leg.id === 'E3' || leg.id === 'U2';
      const legFactor = isBerth ? (1 - ttwBlendReduction) : effectiveFuelFactor;
      const adjRaw = leg.co2Tonnes * legFactor;
      const adjCovered = adjRaw * leg.coveragePct;

      if (leg.regime === 'EU ETS') {
        euRawCo2 += adjRaw;
        euCoveredCo2 += adjCovered;
      } else if (leg.regime === 'UK ETS') {
        ukRawCo2 += adjRaw;
        ukCoveredCo2 += adjCovered;
      }

      const unitPrice = leg.currency === 'EUR' ? twin.euaPrice : twin.ukEtsPrice;
      const cost = adjCovered * unitPrice;

      return { ...leg, adjRaw, adjCovered, unitPrice, cost };
    });

    const euEtsBillEur = euCoveredCo2 * twin.euaPrice;
    const euEtsLow60 = euCoveredCo2 * 60;
    const euEtsHigh100 = euCoveredCo2 * 100;
    const ukEtsBillGbp = ukCoveredCo2 * twin.ukEtsPrice;

    const refIntensity = 91.16;
    const targetCutRatio = twin.fueleuTargetCut / 100;
    const targetIntensity = Number((refIntensity * (1 - targetCutRatio)).toFixed(4));

    const actualIntensity = Number((vessel.actualWtWIntensity * (1 - blendRatio * 0.32)).toFixed(4));
    const adjustedEnergyMJ = vessel.euEnergyMJ * speedFuelFactor;

    const rawBalanceGrams = (targetIntensity - actualIntensity) * adjustedEnergyMJ;
    const poolOffsetGrams = twin.poolingSurplusTonnes * 1000000;
    const netBalanceGrams = rawBalanceGrams + poolOffsetGrams;
    const netBalanceTonnes = netBalanceGrams / 1000000;

    let fueleuPenaltyEur = 0;
    let nonCompliantEnergyMJ = 0;
    let vlsfoEqTonnes = 0;

    if (netBalanceGrams < 0) {
      const deficitAbsGrams = Math.abs(netBalanceGrams);
      nonCompliantEnergyMJ = deficitAbsGrams / actualIntensity;
      vlsfoEqTonnes = nonCompliantEnergyMJ / 41000;
      fueleuPenaltyEur = (deficitAbsGrams / (actualIntensity * 41000)) * 2400;
    }

    const a3Target2 = 89.3368;
    const a3Deficit2Grams = (a3Target2 - vessel.actualWtWIntensity) * vessel.euEnergyMJ;
    const a3Penalty2Eur = Math.max(0, (Math.abs(a3Deficit2Grams) / (vessel.actualWtWIntensity * 41000)) * 2400);

    const baseFuelTonnes = vessel.euEnergyMJ / 41000;
    const fuelSavedByJitTonnes = baseFuelTonnes * (1 - speedFuelFactor);
    const jitFuelSavingsEur = fuelSavedByJitTonnes * 550;
    const biofuelTonnes = (baseFuelTonnes * speedFuelFactor) * blendRatio;
    const biofuelPremiumCostEur = biofuelTonnes * 260;
    const poolingCostEur = twin.poolingSurplusTonnes * 180;

    const totalRegionalEur = euEtsBillEur + fueleuPenaltyEur;

    let ownerSharePct = 0.85;
    let chartererSharePct = 0.15;
    let charterNoteZh = '';
    let charterNoteEn = '';

    if (twin.charterType === 'voyage_gencon') {
      ownerSharePct = 0.85;
      chartererSharePct = 0.15;
      charterNoteZh = 'GENCON 航次租船：船东默认承担燃油与 85% 碳合规成本；若无附加条款，慢航省油可能损失滞期费。';
      charterNoteEn = 'GENCON Voyage Charter: Owner bears fuel & 85% compliance exposure unless a custom rider is agreed.';
    } else if (twin.charterType === 'time_nype_bimco') {
      ownerSharePct = 0.18;
      chartererSharePct = 0.82;
      charterNoteZh = 'NYPE 期租 + BIMCO 条款：法定履约主体仍为船东/管理公司，但 82% 配额与燃料强度缺口由控制航速与燃油的租家偿付。';
      charterNoteEn = 'NYPE + BIMCO Clauses: Statutory duty stays with Owner/ISM, while 82% of cost is reimbursed by Charterer.';
    } else {
      ownerSharePct = 0.50;
      chartererSharePct = 0.50;
      charterNoteZh = 'Blue GA 50:50 共享条款（参考课件 Week 8）：船东与租家对半共担合规成本并平分 JIT 省油收益。';
      charterNoteEn = 'Blue GA 50:50 Rider (Week 8): Splits compliance exposure and JIT fuel savings 50:50 between Owner and Charterer.';
    }

    const ownerEurExposure = totalRegionalEur * ownerSharePct;
    const chartererEurExposure = totalRegionalEur * chartererSharePct;

    const baselinePhysicalWtWTonnes = (vessel.actualWtWIntensity * vessel.euEnergyMJ) / 1000000;
    const currentPhysicalWtWTonnes = (actualIntensity * adjustedEnergyMJ) / 1000000;
    const physicalReductionPct = ((baselinePhysicalWtWTonnes - currentPhysicalWtWTonnes) / baselinePhysicalWtWTonnes) * 100;

    const baselineFinancialEur = (vessel.legs.filter(l => l.regime === 'EU ETS').reduce((s, l) => s + l.coveredTonnes, 0) * 80) + a3Penalty2Eur;
    const currentFinancialEur = totalRegionalEur + poolingCostEur;
    const financialReductionPct = ((baselineFinancialEur - currentFinancialEur) / baselineFinancialEur) * 100;

    const hourlyValueEur = 40;
    const laborSavingsEur = twin.hoursSaved * hourlyValueEur;
    const grossClientValueEur = laborSavingsEur + twin.advisorSavingsEur;
    const recurringNetBenefitEur = grossClientValueEur - 4800;
    const year1NetBenefitEur = recurringNetBenefitEur - 600;

    return {
      vessel,
      scenario,
      computedLegs,
      euCoveredCo2,
      ukCoveredCo2,
      euEtsBillEur,
      euEtsLow60,
      euEtsHigh100,
      ukEtsBillGbp,
      targetIntensity,
      actualIntensity,
      netBalanceGrams,
      netBalanceTonnes,
      vlsfoEqTonnes,
      fueleuPenaltyEur,
      a3Penalty2Eur,
      jitFuelSavingsEur,
      biofuelPremiumCostEur,
      poolingCostEur,
      totalRegionalEur,
      ownerSharePct,
      chartererSharePct,
      ownerEurExposure,
      chartererEurExposure,
      charterNoteZh,
      charterNoteEn,
      baselinePhysicalWtWTonnes,
      currentPhysicalWtWTonnes,
      physicalReductionPct,
      baselineFinancialEur,
      currentFinancialEur,
      financialReductionPct,
      laborSavingsEur,
      grossClientValueEur,
      recurringNetBenefitEur,
      year1NetBenefitEur
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

  function renderApp() {
    const lang = state.lang;
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

    const hygieneAlertEl = document.getElementById('cockpitHygieneAlert');
    if (hygieneAlertEl) {
      if (!m.vessel.ch4N2oVerified) {
        hygieneAlertEl.className = 'alert-banner amber';
        hygieneAlertEl.innerHTML = `
          <div>
            <strong>${lang === 'zh' ? '数据完整性门禁：2026 CH4 / N2O 缺失' : 'Data Hygiene Gate: 2026 CH4 / N2O Missing'}</strong>
            <span>${lang === 'zh'
              ? '缺失气体不能默认归零。当前仅单列已核验的 CO₂ 部分（1,100 吨），待补充滑失系数后解锁完整 ETS 总额。'
              : 'Missing gases cannot be defaulted to zero. Showing verified CO₂ portion (1,100 t) only.'}</span>
          </div>
        `;
      } else {
        hygieneAlertEl.className = 'alert-banner cyan';
        hygieneAlertEl.innerHTML = `
          <div>
            <strong>${lang === 'zh' ? '数据核验通过 (THETIS-MRV 对齐)' : 'Data Completeness Verified'}</strong>
            <span>${lang === 'zh'
              ? 'CO₂、CH₄ 与 N₂O 记录完整，单位与航段边界已通过检查。'
              : 'CO₂, CH₄, and N₂O records verified with zero unit or scope duplication.'}</span>
          </div>
        `;
      }
    }

    const supplyAlertEl = document.getElementById('bunkerSupplyAlert');
    if (supplyAlertEl) {
      if (twin.biofuelBlendPct > 20) {
        supplyAlertEl.style.display = 'flex';
        supplyAlertEl.innerHTML = `
          <div>
            <strong>${lang === 'zh' ? '绿色燃料供给瓶颈提示' : 'Green Fuel Supply Bottleneck'}</strong>
            <span>${lang === 'zh'
              ? `当前设定掺烧 ${twin.biofuelBlendPct}%：公式上可降低罚款，但中小船东需核实港口加注可得性与长约锁价。`
              : `At ${twin.biofuelBlendPct}% blend, penalties drop mathematically, but SMEs face physical port bunker scarcity.`}</span>
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

    const opt1Total = m.baselineFinancialEur;
    const opt2NetOps = m.biofuelPremiumCostEur - m.jitFuelSavingsEur;
    const opt2Total = m.euEtsBillEur + m.fueleuPenaltyEur + opt2NetOps;
    const opt3PoolCost = 371.165 * 180;
    const opt3Total = (m.vessel.legs.filter(l => l.regime === 'EU ETS').reduce((s, l) => s + l.coveredTonnes, 0) * twin.euaPrice) + opt3PoolCost;

    setHTML('optionCompareBody', `
      <tr>
        <td><strong>${lang === 'zh' ? '1. 维持现状直接交罚款' : '1. Pay Penalty As-Is'}</strong></td>
        <td class="num">${fmtEur(m.vessel.legs.filter(l => l.regime === 'EU ETS').reduce((s, l) => s + l.coveredTonnes, 0) * twin.euaPrice, 0)}</td>
        <td class="num">${fmtEur(m.a3Penalty2Eur, 0)}</td>
        <td class="num">€0</td>
        <td class="num"><strong>${fmtEur(opt1Total, 0)}</strong></td>
        <td><span class="badge badge-deficit">${lang === 'zh' ? '零改造 · 高罚款' : 'Zero Capex · High Penalty'}</span></td>
      </tr>
      <tr>
        <td><strong>${lang === 'zh' ? '2. 当前数字孪生组合方案' : '2. Active Digital Twin Mix'}</strong></td>
        <td class="num">${fmtEur(m.euEtsBillEur, 0)}</td>
        <td class="num">${fmtEur(m.fueleuPenaltyEur, 0)}</td>
        <td class="num">${fmtEur(opt2NetOps + m.poolingCostEur, 0)}</td>
        <td class="num"><strong>${fmtEur(opt2Total + m.poolingCostEur, 0)}</strong></td>
        <td><span class="badge badge-assumption">${lang === 'zh' ? '动态推演方案' : 'Simulated Mix'}</span></td>
      </tr>
      <tr>
        <td><strong>${lang === 'zh' ? '3. 授权组池 (Pooling) 抵消赤字' : '3. Verified FuelEU Pooling'}</strong></td>
        <td class="num">${fmtEur(m.vessel.legs.filter(l => l.regime === 'EU ETS').reduce((s, l) => s + l.coveredTonnes, 0) * twin.euaPrice, 0)}</td>
        <td class="num">€0</td>
        <td class="num">${fmtEur(opt3PoolCost, 0)}</td>
        <td class="num"><strong>${fmtEur(opt3Total, 0)}</strong></td>
        <td><span class="badge badge-in-force">${lang === 'zh' ? '最优短期现金流' : 'Lowest Cash Outflow'}</span></td>
      </tr>
    `);

    // Tab 3: Appendix A3 Audit Table & Dual Gauges
    setHTML('a3AuditTableBody', `
      <tr>
        <td class="mono"><strong>EU-E1</strong></td>
        <td>${lang === 'zh' ? '欧盟与非欧盟航次 (Extra-EU)' : 'EU ↔ Non-EU Voyage Leg'}</td>
        <td><span class="formula-code">CO₂ × 50% × Phase(100%) × EUA</span></td>
        <td class="num">${fmtNum(m.computedLegs[0].adjRaw, 1)} t × 50% = ${fmtNum(m.computedLegs[0].adjCovered, 1)} t</td>
        <td class="num"><strong>${fmtEur(m.computedLegs[0].cost, 0)}</strong></td>
        <td><span class="badge badge-in-force">In-Force</span></td>
      </tr>
      <tr>
        <td class="mono"><strong>EU-E2</strong></td>
        <td>${lang === 'zh' ? '欧盟内航次 (Intra-EU)' : 'Intra-EU Voyage Leg'}</td>
        <td><span class="formula-code">CO₂ × 100% × Phase(100%) × EUA</span></td>
        <td class="num">${fmtNum(m.computedLegs[1].adjRaw, 1)} t × 100% = ${fmtNum(m.computedLegs[1].adjCovered, 1)} t</td>
        <td class="num"><strong>${fmtEur(m.computedLegs[1].cost, 0)}</strong></td>
        <td><span class="badge badge-in-force">In-Force</span></td>
      </tr>
      <tr>
        <td class="mono"><strong>EU-E3</strong></td>
        <td>${lang === 'zh' ? '欧盟港内停泊 (EU Berth)' : 'EU Port at Berth'}</td>
        <td><span class="formula-code">CO₂_berth × 100% × EUA</span></td>
        <td class="num">${fmtNum(m.computedLegs[2].adjRaw, 1)} t × 100% = ${fmtNum(m.computedLegs[2].adjCovered, 1)} t</td>
        <td class="num"><strong>${fmtEur(m.computedLegs[2].cost, 0)}</strong></td>
        <td><span class="badge badge-in-force">In-Force</span></td>
      </tr>
      <tr>
        <td class="mono"><strong>UK-U1/U2</strong></td>
        <td>${lang === 'zh' ? '英国国内航次 + 港内 (2026.07起)' : 'UK Domestic + Berth (Jul 2026)'}</td>
        <td><span class="formula-code">(U1 + U2) × 100% × UKA (£)</span></td>
        <td class="num">${fmtNum(m.ukCoveredCo2, 1)} t × £${twin.ukEtsPrice}</td>
        <td class="num"><strong>${fmtGbp(m.ukEtsBillGbp, 0)}</strong></td>
        <td><span class="badge badge-gbp">GBP Only</span></td>
      </tr>
      <tr>
        <td class="mono"><strong>FuelEU-2%</strong></td>
        <td>${lang === 'zh' ? '2025-2029 强度目标 (-2%)' : '2025-2029 WtW Target (-2%)'}</td>
        <td><span class="formula-code">|(${m.targetIntensity} - ${m.actualIntensity}) × E| / (${m.actualIntensity} × 41k) × €2,400</span></td>
        <td class="num">${fmtNum(m.netBalanceGrams, 0)} g (${fmtNum(m.vlsfoEqTonnes, 2)} t VLSFO-eq)</td>
        <td class="num"><strong>${fmtEur(m.fueleuPenaltyEur, 2)}</strong></td>
        <td><span class="badge badge-deficit">In-Force</span></td>
      </tr>
      <tr>
        <td class="mono"><strong>FuelEU-6%</strong></td>
        <td>${lang === 'zh' ? '2030 强度目标条件比较 (-6%)' : '2030 Condition Compare (-6%)'}</td>
        <td><span class="formula-code">|(85.6904 - 91.6) × 164M| / (91.6 × 41k) × €2,400</span></td>
        <td class="num">-969,174,400 g (258.06 t VLSFO-eq)</td>
        <td class="num"><strong>€619,346.72</strong></td>
        <td><span class="badge badge-assumption">Condition</span></td>
      </tr>
    `);

    const finDeltaStr = (m.financialReductionPct >= 0 ? '-' : '+') + Math.abs(m.financialReductionPct).toFixed(1) + '%';
    const physDeltaStr = (m.physicalReductionPct >= 0 ? '-' : '+') + Math.abs(m.physicalReductionPct).toFixed(1) + '%';
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
      if (twin.poolingSurplusTonnes > 0 && twin.biofuelBlendPct === 0 && twin.jitSpeedDeltaKn === 0) {
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
            <strong>${lang === 'zh' ? '双轨一致性核验正常' : 'Dual-Track Alignment Active'}</strong>
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

    const promptObj = state.aiPrompts.find(p => p.id === activePromptId) || state.aiPrompts[0];
    if (promptObj) {
      setHTML('aiAnswerBox', `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <strong style="color:var(--text-primary); font-size:12.5px;">${lang === 'zh' ? promptObj.qZh : promptObj.qEn}</strong>
          <span class="badge badge-${promptObj.statusTag}">${promptObj.expertFlag ? (lang === 'zh' ? '需专家复核' : 'Expert Review') : 'Deterministic RAG'}</span>
        </div>
        <div>${lang === 'zh' ? promptObj.aZh : promptObj.aEn}</div>
      `);
    }

    setHTML('aiFeedContainer', state.aiFeed.map(item => `
      <div class="control-group" style="gap:4px; padding:11px 14px;">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
          <strong style="color:var(--text-primary); font-size:12.5px;">${lang === 'zh' ? item.titleZh : item.titleEn}</strong>
          <span class="badge badge-${item.status}">${lang === 'zh' ? item.badgeZh : item.badgeEn}</span>
        </div>
        <p style="font-size:11.5px; color:var(--text-secondary);">${lang === 'zh' ? item.summaryZh : item.summaryEn}</p>
        <div class="mono" style="font-size:10.5px; color:var(--text-muted);">${item.date} · ${item.source}</div>
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

        // Keep the map panel-card 100% flat so Leaflet tiles, markers & camera buttons never shift
        if (card.querySelector('#realMaritimeMap') || overMapStage || isDraggingRange) {
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
          setTimeout(() => leafletMap.invalidateSize(), 420);
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
        renderApp();
      });
    }

    document.querySelectorAll('.scenario-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const sc = btn.getAttribute('data-scenario');
        state.selectedScenario = sc;
        if (sc === 'as_is') {
          state.twinState.euaPrice = 100;
          state.twinState.fueleuTargetCut = 6.0;
        } else if (sc === 'amended') {
          state.twinState.euaPrice = 80;
          state.twinState.fueleuTargetCut = 2.0;
        } else if (sc === 'deadlock') {
          state.twinState.euaPrice = 80;
          state.twinState.fueleuTargetCut = 2.0;
        }
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
        switchMapCamera('eurasia');
        renderApp();
      });
    }

    const modal = document.getElementById('auditModalBackdrop');
    const openModalBtn = document.getElementById('openAuditModalBtn');
    const closeModalBtn = document.getElementById('closeAuditModalBtn');

    if (openModalBtn && modal) {
      openModalBtn.addEventListener('click', () => modal.classList.add('open'));
    }
    if (closeModalBtn && modal) {
      closeModalBtn.addEventListener('click', () => modal.classList.remove('open'));
    }
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('open');
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    initRealMaritimeMap();
    bindEvents();
    renderApp();
    initSpatial3DTiltEngine();

    const firstPanel = document.querySelector('.tab-panel.active');
    if (firstPanel) applyStaggeredCascade(firstPanel);
  });
})();
