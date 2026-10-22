// Curated official pages, not a complete regulatory/news feed. No user-supplied fetch URLs.
export const OFFICIAL_POLICY_SOURCES=[
 {id:'eu-ets',regime:'eu',zh:'EU ETS 海运指引',en:'EU ETS maritime guidance',url:'https://climate.ec.europa.eu/areas-action/transport-decarbonisation/reducing-emissions-shipping-sector_en',fetchUrl:'https://climate.ec.europa.eu/areas-action/transport-decarbonisation/reducing-emissions-shipping-sector_en',format:'html',publisher:'European Commission',reuse:'https://commission.europa.eu/legal-notice_en'},
 {id:'fueleu',regime:'fuel',zh:'FuelEU Maritime 官方资料',en:'FuelEU Maritime official guidance',url:'https://transport.ec.europa.eu/transport-modes/maritime/decarbonising-maritime-transport-fueleu-maritime_en',fetchUrl:'https://transport.ec.europa.eu/transport-modes/maritime/decarbonising-maritime-transport-fueleu-maritime_en',format:'html',publisher:'European Commission',reuse:'https://commission.europa.eu/legal-notice_en'},
 {id:'uk-ets',regime:'uk',zh:'UK ETS 海运合规指引',en:'UK ETS maritime compliance guidance',url:'https://www.gov.uk/guidance/uk-emissions-trading-scheme-for-maritime-how-to-comply',fetchUrl:'https://www.gov.uk/api/content/guidance/uk-emissions-trading-scheme-for-maritime-how-to-comply',format:'govuk',publisher:'GOV.UK / Environment Agency',reuse:'https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/'},
 {id:'imo-iswg22',regime:'imo',zh:'IMO ISWG-GHG 22 会议资料',en:'IMO ISWG-GHG 22 meeting summary',url:'https://www.imo.org/en/mediacentre/meetingsummaries/pages/iswg-ghg-22.aspx',fetchUrl:'https://www.imo.org/en/mediacentre/meetingsummaries/pages/iswg-ghg-22.aspx',format:'html',publisher:'International Maritime Organization',reuse:'https://www.imo.org/en/About/Pages/Disclaimer.aspx'}
];
export function validateOfficialSnapshot(value){
 const fail=()=>{throw new Error('官方获取记录无效 / Invalid official retrieval record');};
 if(!value||typeof value!=='object')fail();
 const source=OFFICIAL_POLICY_SOURCES.find(s=>s.id===value.sourceId);
 if(!source||value.url!==source.url)fail();
 const text=(x,max)=>{if(typeof x!=='string'||!x.trim()||x.length>max)fail();return x.trim();};
 const instant=(x,nullable)=>{if(nullable&&x===null)return null;if(typeof x!=='string'||Number.isNaN(Date.parse(x)))fail();return new Date(x).toISOString();};
 let publishedOn=null;
 if(value.publishedOn!==null){const d=value.publishedOn;if(typeof d!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(d)||Number.isNaN(Date.parse(d))||new Date(d).toISOString().slice(0,10)!==d)fail();publishedOn=d;}
 return {sourceId:source.id,url:source.url,title:text(value.title,500),retrievedAt:instant(value.retrievedAt,false),publishedOn,updatedAt:instant(value.updatedAt,true),excerpt:text(value.excerpt,1200)};
}
