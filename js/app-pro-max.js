/* ==========================================================================
   MAREG Pro Max — Split-Pane Command Workbench & Live Telemetry Engine (v1.0)
   Built strictly per user:ui-ux-pro-max Skill Guidelines (Priorities 1-10):
   - Persistent Left Digital Twin Telemetry Dock updates all 5 views in real time
   - Inspectable Slide-Over White-Box Formula Audit Drawer (#liveFormulaTraceSteps)
   - Keyboard Navigation (Keys 1-5 switch views, Esc closes drawer)
   - Locked 350px GIS Maritime Map with 300nm Anti-Evasion Transshipment Rings
   ========================================================================== */

(function () {
  const state = window.MAREG_DATA;
  let leafletMap = null;
  let mapLayers = {};
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
      adjustedEnergyMJ,
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

  function switchMapCamera(camKey) {
    document.querySelectorAll('.cam-btn[data-cam]').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-cam') === camKey);
    });

    const lang = state.lang;
    if (camKey === 'eurasia') {
      setText('mapCursorCoords', 'LAT 28.00°N · LON 52.00°E (EURASIA)');
      setText(
        'mapActiveLegOverlay',
        lang === 'zh'
          ? '亚欧全航线：上海 (CNSHA) → 新加坡 (SGSIN) → 苏伊士 (EGPSD) → 鹿特丹 (NLRTM)'
          : 'Eurasia Corridor: CNSHA → SGSIN → EGPSD → MAPTM → NLRTM → DEHAM → UK'
      );
      if (leafletMap) {
        leafletMap.invalidateSize();
        leafletMap.flyTo([28.0, 52.0], 3, { duration: 0.8 });
      }
    } else if (camKey === 'europe') {
      setText('mapCursorCoords', 'LAT 52.20°N · LON 3.80°E (EU 100% + UK ETS)');
      setText(
        'mapActiveLegOverlay',
        lang === 'zh'
          ? '欧英北海核心合规区：鹿特丹→汉堡 (EU 100% €) · 费利克斯托→南安普顿 (UK ETS £)'
          : 'North Sea Core: NLRTM→DEHAM (EU 100% €) · GBFXT→GBSOU (UK ETS £)'
      );
      if (leafletMap) {
        leafletMap.invalidateSize();
        leafletMap.flyTo([52.2, 3.8], 5, { duration: 0.8 });
      }
    } else if (camKey === 'chokepoints') {
      setText('mapCursorCoords', 'LAT 34.50°N · LON 13.50°E (<300nm ANTI-EVASION)');
      setText(
        'mapActiveLegOverlay',
        lang === 'zh'
          ? '300海里防规避转运港：塞得港东港 (EGPSD) 与 丹吉尔地中海港 (MAPTM) 不中断欧盟 50% 起算'
          : '<300nm Anti-Evasion Transshipment Hubs: East Port Said (EGPSD) & Tanger Med (MAPTM)'
      );
      if (leafletMap) {
        leafletMap.invalidateSize();
        leafletMap.flyTo([34.5, 13.5], 4, { duration: 0.8 });
      }
    }
  }

  function initRealMaritimeMap() {
    const mapContainer = document.getElementById('proMaxMaritimeMap');
    if (!mapContainer || typeof L === 'undefined') return;
    if (leafletMap) return;

    mapContainer.style.setProperty('height', '350px', 'important');
    mapContainer.style.setProperty('min-height', '350px', 'important');
    mapContainer.style.setProperty('width', '100%', 'important');
    mapContainer.style.setProperty('display', 'block', 'important');

    try {
      leafletMap = L.map('proMaxMaritimeMap', {
        center: [28.0, 52.0],
        zoom: 3,
        minZoom: 2,
        maxZoom: 11,
        zoomControl: true
      });

      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri, HERE, Garmin, OpenStreetMap',
        maxZoom: 16
      }).addTo(leafletMap);

      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 16,
        opacity: 0.75
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
                  color: isEU ? 'rgba(56, 189, 248, 0.38)' : (isUK ? 'rgba(16, 185, 129, 0.42)' : 'rgba(255, 255, 255, 0.08)'),
                  weight: isEU || isUK ? 1.2 : 0.6,
                  fillColor: isEU ? '#38bdf8' : (isUK ? '#10b981' : '#182030'),
                  fillOpacity: isEU ? 0.08 : (isUK ? 0.09 : 0.02)
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
      L.polygon(eu100PolygonCoords, {
        color: '#38bdf8',
        weight: 1.5,
        fillColor: '#38bdf8',
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
      L.polygon(ukEtsPolygonCoords, {
        color: '#10b981',
        weight: 1.4,
        fillColor: '#10b981',
        fillOpacity: 0.14,
        dashArray: '3 4'
      }).addTo(leafletMap);

      // 300nm Anti-Evasion Transshipment Radius Rings around East Port Said & Tanger Med
      L.circle([31.26, 32.31], {
        radius: 555600,
        color: '#f59e0b',
        weight: 1.2,
        fillColor: '#f59e0b',
        fillOpacity: 0.08,
        dashArray: '3 4'
      }).addTo(leafletMap);

      L.circle([35.89, -5.50], {
        radius: 555600,
        color: '#f59e0b',
        weight: 1.2,
        fillColor: '#f59e0b',
        fillOpacity: 0.08,
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
        color: '#38bdf8',
        weight: 3,
        opacity: 0.92,
        dashArray: '6 5'
      }).addTo(leafletMap);

      mapLayers.lineE2 = L.polyline(legE2Coords, {
        color: '#f8fafc',
        weight: 3.5,
        opacity: 0.96
      }).addTo(leafletMap);

      mapLayers.lineU1 = L.polyline(legU1Coords, {
        color: '#10b981',
        weight: 3,
        opacity: 0.92,
        dashArray: '4 4'
      }).addTo(leafletMap);

      mapLayers.lineE1.on('click', () => selectLegFilter('E1'));
      mapLayers.lineE2.on('click', () => selectLegFilter('E2'));
      mapLayers.lineU1.on('click', () => selectLegFilter('U1'));

      const ports = [
        { code: 'CNSHA', nameZh: '上海港 (Shanghai)', nameEn: 'Port of Shanghai (CNSHA)', coords: [31.23, 121.47], legId: 'E1', roleZh: '非欧盟始发港 · EU ETS 50% 覆盖 (E1)', roleEn: 'Non-EU Origin Port · 50% Extra-EU ETS (E1)', dotColor: '#38bdf8' },
        { code: 'SGSIN', nameZh: '新加坡港 (Singapore Hub)', nameEn: 'Port of Singapore (SGSIN)', coords: [1.26, 103.82], legId: 'E1', roleZh: '亚洲加注枢纽 · 生物燃料与绿甲醇参考港', roleEn: 'Asian Bunkering Hub · Biofuel Reference', dotColor: '#38bdf8' },
        { code: 'EGPSD', nameZh: '塞得港东港 (East Port Said)', nameEn: 'East Port Said / Suez (EGPSD)', coords: [31.26, 32.31], legId: 'E1', roleZh: '欧盟指定 <300nm 防规避集装箱转运港', roleEn: 'EU-Designated <300nm Anti-Evasion Transshipment Port', dotColor: '#f59e0b' },
        { code: 'MAPTM', nameZh: '丹吉尔地中海港 (Tanger Med)', nameEn: 'Tanger Med / Gibraltar (MAPTM)', coords: [35.89, -5.50], legId: 'E1', roleZh: '欧盟指定 <300nm 防规避集装箱转运港 (Lecture 3)', roleEn: 'EU-Designated <300nm Anti-Evasion Transshipment Port', dotColor: '#f59e0b' },
        { code: 'NLRTM', nameZh: '鹿特丹港 (Rotterdam)', nameEn: 'Port of Rotterdam (NLRTM)', coords: [51.95, 4.14], legId: 'E3', roleZh: '欧盟首靠港 · 港内停泊 (E3) 100% 计入 EU ETS', roleEn: 'First EU Port of Call · 100% Berth ETS (E3)', dotColor: '#10b981' },
        { code: 'DEHAM', nameZh: '汉堡港 (Hamburg)', nameEn: 'Port of Hamburg (DEHAM)', coords: [53.54, 9.97], legId: 'E2', roleZh: '欧盟内部目的港 · 鹿特丹→汉堡 (E2) 100% 覆盖', roleEn: 'Intra-EU Destination · 100% EU ETS & FuelEU (E2)', dotColor: '#10b981' },
        { code: 'GBFXT', nameZh: '费利克斯托港 (Felixstowe)', nameEn: 'Port of Felixstowe (GBFXT)', coords: [51.95, 1.33], legId: 'U1', roleZh: '英国枢纽港 · 2026.07 起国内海事纳入 UK ETS (£)', roleEn: 'UK Hub Port · UK ETS Scope from Jul 2026 (£)', dotColor: '#f8fafc' },
        { code: 'GBSOU', nameZh: '南安普顿港 (Southampton)', nameEn: 'Port of Southampton (GBSOU)', coords: [50.89, -1.40], legId: 'U1', roleZh: '英国国内挂靠港 (U1: 200t + U2: 20t = £13,200)', roleEn: 'UK Domestic Call (U1: 200t + U2: 20t = £13,200)', dotColor: '#f8fafc' }
      ];

      mapLayers.portMarkers = ports.map(p => {
        const marker = L.circleMarker(p.coords, {
          radius: 6,
          color: '#06080d',
          weight: 1.5,
          fillColor: p.dotColor,
          fillOpacity: 1
        }).addTo(leafletMap);

        marker.bindTooltip(`${p.code}`, {
          permanent: true,
          direction: 'top',
          offset: [0, -6],
          className: 'port-label-tooltip'
        });

        marker.on('click', () => selectLegFilter(p.legId));
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
      console.error('Pro Max GIS Init Error:', err);
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
        <div style="min-width:210px; color:#0f172a;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <strong style="font-size:12.5px;">${lang === 'zh' ? p.nameZh : p.nameEn}</strong>
            <span class="mono" style="font-size:10.5px; color:#0284c7;">${p.code}</span>
          </div>
          <div style="font-size:11.5px; margin-bottom:6px;">
            ${lang === 'zh' ? p.roleZh : p.roleEn}
          </div>
          <div style="padding-top:6px; border-top:1px solid rgba(0,0,0,0.1); display:flex; justify-content:space-between; font-family:var(--font-mono); font-size:11px;">
            <span>${legObj.code} (${(legObj.coveragePct * 100).toFixed(0)}%)</span>
            <strong>${costStr}</strong>
          </div>
        </div>
      `);
    });
  }

  function renderApp() {
    const lang = state.lang;
    const m = computeComplianceMetrics();
    const twin = state.twinState;

    document.querySelectorAll('[data-zh][data-en]').forEach(el => {
      el.textContent = lang === 'zh' ? el.getAttribute('data-zh') : el.getAttribute('data-en');
    });

    document.querySelectorAll('.lang-pill').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    document.querySelectorAll('.scenario-pill-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-scenario') === state.selectedScenario);
    });

    const vesselSelect = document.getElementById('vesselSelect');
    if (vesselSelect) {
      vesselSelect.innerHTML = state.vessels.map(v => `
        <option value="${v.id}" ${v.id === state.selectedVesselId ? 'selected' : ''}>
          ${lang === 'zh' ? v.nameZh : v.nameEn}
        </option>
      `).join('');
    }

    setHTML('vesselSpecsStrip', `
      <span class="spec-chip">${m.vessel.imo}</span>
      <span class="spec-chip">${fmtNum(m.vessel.gt)} GT</span>
      <span class="spec-chip">${m.vessel.fuelType}</span>
      <span class="status-badge ${m.vessel.ch4N2oVerified ? 'status-verified' : 'status-warning'}">
        ${m.vessel.ch4N2oVerified
          ? (lang === 'zh' ? 'CH4/N2O 已核验' : 'CH4/N2O Verified')
          : (lang === 'zh' ? '2026 CH4/N2O 缺失 · 仅单列 CO2' : '2026 CH4/N2O Missing · CO2 Only')}
      </span>
    `);

    // Top 4 KPIs + Micro Spark-Bars
    setText('kpiEuEtsVal', fmtEur(m.euEtsBillEur, 0));
    setHTML('kpiEuEtsSub', `
      <span>${fmtNum(m.euCoveredCo2, 0)} tCO₂ × €${twin.euaPrice}</span>
      <span class="mono">60/100: ${fmtEur(m.euEtsLow60)} / ${fmtEur(m.euEtsHigh100)}</span>
    `);
    const sparkEu = document.getElementById('sparkEuEts');
    if (sparkEu) sparkEu.style.width = `${Math.min(100, Math.max(15, (m.euEtsBillEur / 140000) * 100)).toFixed(0)}%`;

    setText('kpiFuelEuVal', fmtEur(m.fueleuPenaltyEur, 2));
    setHTML('kpiFuelEuSub', `
      <span>${lang === 'zh' ? '合规余额' : 'Balance'} ${fmtNum(m.netBalanceTonnes, 3)} t</span>
      <span class="mono">-${twin.fueleuTargetCut.toFixed(0)}% (${m.targetIntensity})</span>
    `);
    const sparkFuel = document.getElementById('sparkFuelEu');
    if (sparkFuel) {
      sparkFuel.style.width = m.fueleuPenaltyEur === 0 ? '100%' : `${Math.min(100, Math.max(12, (m.fueleuPenaltyEur / 620000) * 100)).toFixed(0)}%`;
      sparkFuel.className = m.fueleuPenaltyEur === 0 ? 'kpi-spark-fill verified' : 'kpi-spark-fill danger';
    }

    setText('kpiUkEtsVal', fmtGbp(m.ukEtsBillGbp, 0));
    setHTML('kpiUkEtsSub', `
      <span>${fmtNum(m.ukCoveredCo2, 0)} tCO₂ × £${twin.ukEtsPrice}</span>
      <span class="mono">${lang === 'zh' ? '英镑独立核算' : 'GBP Isolated'}</span>
    `);

    setText('kpiCharterVal', fmtEur(m.ownerEurExposure, 0));
    setHTML('kpiCharterSub', `
      <span>${lang === 'zh' ? '船东' : 'Owner'} ${(m.ownerSharePct * 100).toFixed(0)}% · ${lang === 'zh' ? '租家' : 'Charterer'} ${(m.chartererSharePct * 100).toFixed(0)}%</span>
      <span class="mono">${fmtEur(m.chartererEurExposure, 0)}</span>
    `);
    const sparkCharter = document.getElementById('sparkCharter');
    if (sparkCharter) sparkCharter.style.width = `${(m.ownerSharePct * 100).toFixed(0)}%`;

    // Sync Left Persistent Dock Readouts
    document.querySelectorAll('.sync-eua').forEach(el => { el.value = twin.euaPrice; });
    document.querySelectorAll('.sync-readout-eua').forEach(el => { el.textContent = `€${twin.euaPrice} / tCO₂`; });

    document.querySelectorAll('.sync-jit').forEach(el => { el.value = twin.jitSpeedDeltaKn; });
    document.querySelectorAll('.sync-readout-jit').forEach(el => {
      const actualKn = (m.vessel.serviceSpeedKn + twin.jitSpeedDeltaKn).toFixed(1);
      el.textContent = `${twin.jitSpeedDeltaKn.toFixed(1)} kn (${actualKn} kn)`;
    });

    document.querySelectorAll('.sync-bio').forEach(el => { el.value = twin.biofuelBlendPct; });
    document.querySelectorAll('.sync-readout-bio').forEach(el => { el.textContent = `${twin.biofuelBlendPct}%`; });

    document.querySelectorAll('.sync-pool').forEach(el => { el.value = twin.poolingSurplusTonnes; });
    document.querySelectorAll('.sync-readout-pool').forEach(el => { el.textContent = `+${twin.poolingSurplusTonnes} tCO₂e`; });

    document.querySelectorAll('.seg-target-btn').forEach(btn => {
      btn.classList.toggle('active', Number(btn.getAttribute('data-target')) === twin.fueleuTargetCut);
    });

    document.querySelectorAll('.seg-charter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-charter') === twin.charterType);
    });

    // View 1 Hygiene Callouts & Leg Ledger
    const hygieneEl = document.getElementById('cockpitHygieneAlert');
    if (hygieneEl) {
      if (!m.vessel.ch4N2oVerified) {
        hygieneEl.className = 'callout-box warn';
        hygieneEl.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <div>
            <strong>${lang === 'zh' ? '数据完整性门禁：2026 CH₄ / N₂O 缺失' : 'Data Hygiene Gate: 2026 CH₄ / N₂O Missing'}</strong>
            <span>${lang === 'zh'
              ? '严禁将缺失气体默认归零。当前仅单列已核验的 CO₂ 部分（1,100 吨），待补充滑失系数后解锁完整总额。'
              : 'Missing gases cannot be defaulted to zero. Showing verified CO₂ portion (1,100 t) only.'}</span>
          </div>
        `;
      } else {
        hygieneEl.className = 'callout-box verified';
        hygieneEl.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          <div>
            <strong>${lang === 'zh' ? '数据完整性核验通过 (THETIS-MRV 对齐)' : 'Data Completeness Verified'}</strong>
            <span>${lang === 'zh'
              ? 'CO₂、CH₄ 与 N₂O 记录完整，航段覆盖比例与币种边界已通过核验。'
              : 'CO₂, CH₄, and N₂O records verified with zero unit or scope duplication.'}</span>
          </div>
        `;
      }
    }

    const supplyEl = document.getElementById('bunkerSupplyAlert');
    if (supplyEl) {
      if (twin.biofuelBlendPct > 20) {
        supplyEl.style.display = 'flex';
        supplyEl.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <div>
            <strong>${lang === 'zh' ? '绿色燃料加注瓶颈预警' : 'Green Fuel Supply Bottleneck'}</strong>
            <span>${lang === 'zh'
              ? `当前设定掺烧 ${twin.biofuelBlendPct}%：中小船东需核实港口现货可得性与长约溢价。`
              : `At ${twin.biofuelBlendPct}% blend, SMEs face physical port bunker scarcity and price premiums.`}</span>
          </div>
        `;
      } else {
        supplyEl.style.display = 'none';
      }
    }

    const filteredLegs = state.selectedLegFilter === 'all'
      ? m.computedLegs
      : m.computedLegs.filter(l => l.id === state.selectedLegFilter || (state.selectedLegFilter === 'U1' && l.regime === 'UK ETS'));

    setHTML('cockpitLegTableBody', filteredLegs.map(l => `
      <tr>
        <td class="mono"><strong>${l.code}</strong></td>
        <td>${lang === 'zh' ? l.routeZh : l.routeEn}</td>
        <td><span class="status-badge ${l.currency === 'EUR' ? 'status-verified' : 'status-info'}">${l.regime}</span></td>
        <td class="num">${fmtNum(l.adjRaw, 1)} t</td>
        <td class="num">${(l.coveragePct * 100).toFixed(0)}%</td>
        <td class="num"><strong>${fmtNum(l.adjCovered, 1)} t</strong></td>
        <td class="num"><strong>${l.currency === 'EUR' ? fmtEur(l.cost, 0) : fmtGbp(l.cost, 0)}</strong></td>
      </tr>
    `).join(''));

    // View 2: Charter Split & Pathway Table
    setText('ownerSplitLabel', `${lang === 'zh' ? '船东承担' : 'Owner Share'}: ${fmtEur(m.ownerEurExposure, 0)} (${(m.ownerSharePct * 100).toFixed(0)}%)`);
    setText('chartererSplitLabel', `${lang === 'zh' ? '租家偿付' : 'Charterer Reimbursed'}: ${fmtEur(m.chartererEurExposure, 0)} (${(m.chartererSharePct * 100).toFixed(0)}%)`);
    const ownerBar = document.getElementById('ownerSplitBar');
    const chartBar = document.getElementById('chartererSplitBar');
    if (ownerBar && chartBar) {
      ownerBar.style.width = `${(m.ownerSharePct * 100).toFixed(0)}%`;
      chartBar.style.width = `${(m.chartererSharePct * 100).toFixed(0)}%`;
    }
    setText('charterExplainBox', lang === 'zh' ? m.charterNoteZh : m.charterNoteEn);
    setText('jitSavingReadout', `+${fmtEur(m.jitFuelSavingsEur, 0)}`);
    setText('bioPremiumReadout', `-${fmtEur(m.biofuelPremiumCostEur, 0)}`);
    setText('poolCostReadout', `-${fmtEur(m.poolingCostEur, 0)}`);

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
        <td><span class="status-badge status-danger">${lang === 'zh' ? '高罚款敞口' : 'High Penalty'}</span></td>
      </tr>
      <tr>
        <td><strong>${lang === 'zh' ? '2. 当前左侧数字孪生方案' : '2. Active Digital Twin Mix'}</strong></td>
        <td class="num">${fmtEur(m.euEtsBillEur, 0)}</td>
        <td class="num">${fmtEur(m.fueleuPenaltyEur, 0)}</td>
        <td class="num">${fmtEur(opt2NetOps + m.poolingCostEur, 0)}</td>
        <td class="num"><strong>${fmtEur(opt2Total + m.poolingCostEur, 0)}</strong></td>
        <td><span class="status-badge status-info">${lang === 'zh' ? '实时推演组合' : 'Active Simulation'}</span></td>
      </tr>
      <tr>
        <td><strong>${lang === 'zh' ? '3. 授权组池 (Pooling) 抵消赤字' : '3. Verified FuelEU Pooling'}</strong></td>
        <td class="num">${fmtEur(m.vessel.legs.filter(l => l.regime === 'EU ETS').reduce((s, l) => s + l.coveredTonnes, 0) * twin.euaPrice, 0)}</td>
        <td class="num">€0</td>
        <td class="num">${fmtEur(opt3PoolCost, 0)}</td>
        <td class="num"><strong>${fmtEur(opt3Total, 0)}</strong></td>
        <td><span class="status-badge status-verified">${lang === 'zh' ? '最优现金流' : 'Lowest Outflow'}</span></td>
      </tr>
    `);

    // View 3: A3 White-Box Audit Table & Dual Gauges
    setHTML('a3AuditTableBody', `
      <tr>
        <td class="mono"><strong>EU-E1</strong></td>
        <td>${lang === 'zh' ? '欧盟与非欧盟航段 (Extra-EU)' : 'EU ↔ Non-EU Voyage Leg'}</td>
        <td><span class="code-pill">CO₂ × 50% × Phase(100%) × EUA</span></td>
        <td class="num">${fmtNum(m.computedLegs[0].adjRaw, 1)} t × 50% = ${fmtNum(m.computedLegs[0].adjCovered, 1)} t</td>
        <td class="num"><strong>${fmtEur(m.computedLegs[0].cost, 0)}</strong></td>
        <td><span class="status-badge status-verified">In-Force</span></td>
      </tr>
      <tr>
        <td class="mono"><strong>EU-E2</strong></td>
        <td>${lang === 'zh' ? '欧盟内航段 (Intra-EU)' : 'Intra-EU Voyage Leg'}</td>
        <td><span class="code-pill">CO₂ × 100% × Phase(100%) × EUA</span></td>
        <td class="num">${fmtNum(m.computedLegs[1].adjRaw, 1)} t × 100% = ${fmtNum(m.computedLegs[1].adjCovered, 1)} t</td>
        <td class="num"><strong>${fmtEur(m.computedLegs[1].cost, 0)}</strong></td>
        <td><span class="status-badge status-verified">In-Force</span></td>
      </tr>
      <tr>
        <td class="mono"><strong>EU-E3</strong></td>
        <td>${lang === 'zh' ? '欧盟港内停泊 (EU Berth)' : 'EU Port at Berth'}</td>
        <td><span class="code-pill">CO₂_berth × 100% × EUA</span></td>
        <td class="num">${fmtNum(m.computedLegs[2].adjRaw, 1)} t × 100% = ${fmtNum(m.computedLegs[2].adjCovered, 1)} t</td>
        <td class="num"><strong>${fmtEur(m.computedLegs[2].cost, 0)}</strong></td>
        <td><span class="status-badge status-verified">In-Force</span></td>
      </tr>
      <tr>
        <td class="mono"><strong>UK-U1/U2</strong></td>
        <td>${lang === 'zh' ? '英国国内航段 + 港内 (2026.07)' : 'UK Domestic + Berth (Jul 2026)'}</td>
        <td><span class="code-pill">(U1 + U2) × 100% × UKA (£)</span></td>
        <td class="num">${fmtNum(m.ukCoveredCo2, 1)} t × £${twin.ukEtsPrice}</td>
        <td class="num"><strong>${fmtGbp(m.ukEtsBillGbp, 0)}</strong></td>
        <td><span class="status-badge status-info">GBP Only</span></td>
      </tr>
      <tr>
        <td class="mono"><strong>FuelEU-Cur</strong></td>
        <td>${lang === 'zh' ? `当前目标档位 (-${twin.fueleuTargetCut.toFixed(0)}%)` : `Active Target (-${twin.fueleuTargetCut.toFixed(0)}%)`}</td>
        <td><span class="code-pill">|(${m.targetIntensity} - ${m.actualIntensity}) × E| / (${m.actualIntensity} × 41k) × €2,400</span></td>
        <td class="num">${fmtNum(m.netBalanceGrams, 0)} g (${fmtNum(m.vlsfoEqTonnes, 2)} t VLSFO-eq)</td>
        <td class="num"><strong>${fmtEur(m.fueleuPenaltyEur, 2)}</strong></td>
        <td><span class="status-badge status-danger">In-Force</span></td>
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
        reflexEl.className = 'callout-box warn';
        reflexEl.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
          <div>
            <strong>${lang === 'zh' ? '反漂绿预警：纯财务池化抵扣（物理排放未降）' : 'Anti-Greenwashing Alert: Financial Pooling Only'}</strong>
            <span>${lang === 'zh'
              ? `当前通过外部组池抵扣了 +${twin.poolingSurplusTonnes} tCO₂e，财务支出下降，但本船物理 WtW 排放仍为 ${fmtNum(m.currentPhysicalWtWTonnes, 0)} 吨（0.0% 物理减排）。`
              : `Financial cost dropped via pooling, but physical shipboard WtW emissions remain unchanged (0.0% physical reduction).`}</span>
          </div>
        `;
      } else {
        reflexEl.className = 'callout-box verified';
        reflexEl.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          <div>
            <strong>${lang === 'zh' ? '双轨一致性核验正常' : 'Dual-Track Alignment Verified'}</strong>
            <span>${lang === 'zh'
              ? `并列披露财务合规支出变动 (${finDeltaStr}) 与物理全生命周期 WtW 排放变动 (${physDeltaStr})。`
              : `Reporting Financial Cost Delta (${finDeltaStr}) alongside Physical WtW Emissions Delta (${physDeltaStr}).`}</span>
          </div>
        `;
      }
    }

    // View 4: IMO Scenario Detail Box
    const sc = m.scenario;
    setHTML('activeScenarioDetailBox', `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
        <strong style="color:var(--text-primary); font-size:14px;">${lang === 'zh' ? sc.titleZh : sc.titleEn}</strong>
        <span class="status-badge status-info">${sc.breakEvenClients} Clients Break-Even</span>
      </div>
      <p style="font-size:12.5px; color:var(--text-secondary); margin-top:6px;">${lang === 'zh' ? sc.triggerZh : sc.triggerEn}</p>
      <div style="font-size:12px; color:var(--text-muted); padding-top:8px; margin-top:6px; border-top:1px solid var(--border-subtle);">
        <strong style="color:var(--text-primary);">${lang === 'zh' ? '应对策略：' : 'Venture Strategy: '}</strong>
        ${lang === 'zh' ? sc.strategyZh : sc.strategyEn}
      </div>
    `);

    // View 5: AI Radar, A1 ROI & A2 Risk Register
    document.querySelectorAll('.prompt-chip').forEach(chip => {
      chip.classList.toggle('active', chip.getAttribute('data-prompt') === activePromptId);
    });

    const promptObj = state.aiPrompts.find(p => p.id === activePromptId) || state.aiPrompts[0];
    if (promptObj) {
      setHTML('aiAnswerBox', `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <strong style="color:var(--text-primary); font-size:12.5px;">${lang === 'zh' ? promptObj.qZh : promptObj.qEn}</strong>
          <span class="status-badge ${promptObj.expertFlag ? 'status-warning' : 'status-verified'}">${promptObj.expertFlag ? (lang === 'zh' ? '需专家复核' : 'Expert Review') : 'Deterministic RAG'}</span>
        </div>
        <div style="font-size:12.5px; color:var(--text-secondary);">${lang === 'zh' ? promptObj.aZh : promptObj.aEn}</div>
      `);
    }

    setHTML('aiFeedContainer', state.aiFeed.map(item => `
      <div class="dock-pod" style="padding:12px 14px;">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
          <strong style="color:var(--text-primary); font-size:12.5px;">${lang === 'zh' ? item.titleZh : item.titleEn}</strong>
          <span class="status-badge ${item.status === 'in-force' ? 'status-verified' : 'status-warning'}">${lang === 'zh' ? item.badgeZh : item.badgeEn}</span>
        </div>
        <p style="font-size:12px; color:var(--text-secondary);">${lang === 'zh' ? item.summaryZh : item.summaryEn}</p>
        <div class="mono" style="font-size:10.5px; color:var(--text-muted);">${item.date} · ${item.source}</div>
      </div>
    `).join(''));

    setText('roiHoursReadout', `${twin.hoursSaved} h (${fmtEur(m.laborSavingsEur, 0)})`);
    const roiSlider = document.getElementById('roiHoursSlider');
    if (roiSlider) roiSlider.value = twin.hoursSaved;

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

    // Populate Step 3 Live White-Box Formula Audit Drawer
    setHTML('liveFormulaTraceSteps', `
      <div class="trace-step">
        <div class="trace-step-head">
          <span>Step 1 · EU ETS Scoped Allowance Liability (EUR €)</span>
          <span class="status-badge status-verified">Dir. 2003/87/EC</span>
        </div>
        <div class="code-pill">Covered_CO₂ = (E1 × 50%) + (E2 × 100%) + (E3_Berth × 100%)</div>
        <div class="mono" style="font-size:12px; color:var(--text-secondary);">
          = (${fmtNum(m.computedLegs[0].adjRaw, 1)} × 0.5) + (${fmtNum(m.computedLegs[1].adjRaw, 1)} × 1.0) + (${fmtNum(m.computedLegs[2].adjRaw, 1)} × 1.0) = <strong>${fmtNum(m.euCoveredCo2, 1)} tCO₂</strong>
        </div>
        <div class="mono" style="font-size:12.5px; color:var(--text-primary);">
          EU_ETS_Cost = ${fmtNum(m.euCoveredCo2, 1)} tCO₂ × €${twin.euaPrice} = <strong>${fmtEur(m.euEtsBillEur, 0)}</strong>
        </div>
      </div>

      <div class="trace-step">
        <div class="trace-step-head">
          <span>Step 2 · FuelEU Maritime WtW Intensity Balance & Penalty (EUR €)</span>
          <span class="status-badge status-danger">Reg (EU) 2023/1805</span>
        </div>
        <div class="code-pill">Balance (gCO₂e) = (GHG_Target - GHG_Actual) × Energy_MJ + Pool_Offset</div>
        <div class="mono" style="font-size:12px; color:var(--text-secondary);">
          = (${m.targetIntensity} - ${m.actualIntensity}) × ${fmtNum(m.adjustedEnergyMJ, 0)} MJ + ${fmtNum(twin.poolingSurplusTonnes * 1000000, 0)} g = <strong>${fmtNum(m.netBalanceGrams, 0)} gCO₂e</strong>
        </div>
        <div class="code-pill">Penalty (€) = |Deficit_g| / (GHG_Actual × 41,000 MJ/t) × €2,400</div>
        <div class="mono" style="font-size:12.5px; color:var(--text-primary);">
          = ${fmtNum(m.vlsfoEqTonnes, 2)} t VLSFO-eq × €2,400 = <strong>${fmtEur(m.fueleuPenaltyEur, 2)}</strong>
        </div>
      </div>

      <div class="trace-step">
        <div class="trace-step-head">
          <span>Step 3 · UK ETS Domestic Maritime & Berth Liability (GBP £ Separate)</span>
          <span class="status-badge status-info">UK ETS Jul 2026</span>
        </div>
        <div class="code-pill">UK_ETS_Bill (£) = (U1_Domestic + U2_Berth) × 100% × UKA_Price</div>
        <div class="mono" style="font-size:12.5px; color:var(--text-primary);">
          = ${fmtNum(m.ukCoveredCo2, 1)} tCO₂ × £${twin.ukEtsPrice} = <strong>${fmtGbp(m.ukEtsBillGbp, 0)}</strong> (Never mixed with EUR)
        </div>
      </div>

      <div class="trace-step">
        <div class="trace-step-head">
          <span>Step 4 · Charterparty Contractual Reimbursement Split</span>
          <span class="status-badge status-warning">${twin.charterType.toUpperCase()}</span>
        </div>
        <div class="mono" style="font-size:12px; color:var(--text-secondary);">
          Total Regional EUR = ${fmtEur(m.totalRegionalEur, 0)} → Owner ${(m.ownerSharePct * 100).toFixed(0)}% (<strong>${fmtEur(m.ownerEurExposure, 0)}</strong>) · Charterer ${(m.chartererSharePct * 100).toFixed(0)}% (<strong>${fmtEur(m.chartererEurExposure, 0)}</strong>)
        </div>
      </div>
    `);

    updateMapPopups();
  }

  function switchView(viewId) {
    const navButtons = document.querySelectorAll('.rail-nav-btn');
    navButtons.forEach(btn => {
      const isMatch = btn.getAttribute('data-view') === viewId;
      btn.classList.toggle('active', isMatch);
      if (isMatch) {
        const labelSpan = btn.querySelector('[data-zh]');
        if (labelSpan) {
          setText('activeBreadcrumbTitle', state.lang === 'zh' ? labelSpan.getAttribute('data-zh') : labelSpan.getAttribute('data-en'));
        }
      }
    });

    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.toggle('active', sec.id === viewId);
    });

    if (viewId === 'view-gis' && leafletMap) {
      setTimeout(() => leafletMap.invalidateSize(), 60);
      setTimeout(() => leafletMap.invalidateSize(), 300);
    }
  }

  function bindEvents() {
    document.querySelectorAll('.rail-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        switchView(btn.getAttribute('data-view'));
      });
    });

    // Keyboard Shortcuts 1-5 & Escape (Priority #1 Accessibility)
    document.addEventListener('keydown', (e) => {
      if (e.target && ['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;
      const viewMap = {
        '1': 'view-gis',
        '2': 'view-charter',
        '3': 'view-audit',
        '4': 'view-scenarios',
        '5': 'view-ai-roi'
      };
      if (viewMap[e.key]) {
        switchView(viewMap[e.key]);
      } else if (e.key === 'Escape') {
        const drawer = document.getElementById('auditDrawerBackdrop');
        if (drawer) drawer.classList.remove('open');
      }
    });

    document.querySelectorAll('.cam-btn[data-cam]').forEach(btn => {
      btn.addEventListener('click', () => {
        switchMapCamera(btn.getAttribute('data-cam'));
      });
    });

    document.querySelectorAll('.leg-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectLegFilter(btn.getAttribute('data-leg-filter'));
      });
    });

    document.querySelectorAll('.lang-pill').forEach(btn => {
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

    document.querySelectorAll('.scenario-pill-btn').forEach(btn => {
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

    const roiSlider = document.getElementById('roiHoursSlider');
    if (roiSlider) {
      roiSlider.addEventListener('input', (e) => {
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

    const drawer = document.getElementById('auditDrawerBackdrop');
    const openDrawerBtn = document.getElementById('openAuditDrawerBtn');
    const closeDrawerBtn = document.getElementById('closeAuditDrawerBtn');

    if (openDrawerBtn && drawer) {
      openDrawerBtn.addEventListener('click', () => drawer.classList.add('open'));
    }
    document.querySelectorAll('.open-trace-trigger').forEach(btn => {
      btn.addEventListener('click', () => {
        if (drawer) drawer.classList.add('open');
      });
    });
    if (closeDrawerBtn && drawer) {
      closeDrawerBtn.addEventListener('click', () => drawer.classList.remove('open'));
    }
    if (drawer) {
      drawer.addEventListener('click', (e) => {
        if (e.target === drawer) drawer.classList.remove('open');
      });
    }

    window.addEventListener('resize', () => {
      if (leafletMap) leafletMap.invalidateSize();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initRealMaritimeMap();
    bindEvents();
    renderApp();
  });
})();
