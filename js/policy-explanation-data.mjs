// Shared projection/validation for the explicitly consented policy explanation boundary.
export const POLICY_EXPLANATION_SCHEMA='mareg-policy-explanation-v1';
export function policyExplanationTotals(rows,hasConditions){
  const sum=key=>rows.reduce((total,row)=>total+row[key],0);
  const beforeEur=sum('beforeEur'),beforeGbp=sum('beforeGbp');
  const afterEur=hasConditions?rows.reduce((s,r)=>s+(r.affected?r.afterEur:r.beforeEur),0):null;
  const afterGbp=hasConditions?rows.reduce((s,r)=>s+(r.affected?r.afterGbp:r.beforeGbp),0):null;
  return {vessels:rows.length,affected:rows.filter(r=>r.affected).length,beforeEur,beforeGbp,afterEur,afterGbp,
    deltaEur:hasConditions?afterEur-beforeEur:null,deltaGbp:hasConditions?afterGbp-beforeGbp:null};
}
export function validatePolicyExplanation(value){
  const fail=()=>{throw new Error('Invalid policy comparison summary');};
  const text=(s,max,blank=false)=>{if(typeof s!=='string'||s.length>max||(!blank&&!s.trim()))fail();return s.trim();};
  const finite=n=>{if(!Number.isFinite(n)||Math.abs(n)>1e15)fail();return n;};
  const date=(s,blank=false)=>{if(blank&&s==='')return '';if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s)||Number.isNaN(Date.parse(s))||new Date(s).toISOString().slice(0,10)!==s)fail();return s;};
  if(!value||value.schema!==POLICY_EXPLANATION_SCHEMA||!value.policy||!Array.isArray(value.vessels)||value.vessels.length<1||value.vessels.length>20)fail();
  const p=value.policy;
  let url;try{url=new URL(p.url);}catch{fail();}
  if(url.protocol!=='https:'||url.username||url.password||url.href.length>2000)fail();
  if(!['eu','uk','fuel','imo'].includes(p.regime)||!['planning','proposal','in-force'].includes(p.status)||!['all','selected'].includes(p.coverage)||typeof p.reviewed!=='boolean'||!Number.isInteger(p.revision)||p.revision<1||p.revision>1e9)fail();
  const limits={euaPrice:[50,120,5],ukPrice:[0,1000,1],targetCut:[2,6,1],poolPrice:[0,10000,1],poolAvailable:[0,10000,25]},assumptions={};
  if(!p.assumptions||typeof p.assumptions!=='object'||Array.isArray(p.assumptions))fail();
  for(const key of Object.keys(p.assumptions)){
    if(!Object.hasOwn(limits,key))fail();const n=finite(p.assumptions[key]),[min,max,step]=limits[key];
    if(n<min||n>max||(key==='targetCut'?![2,6].includes(n):Math.abs((n-min)/step-Math.round((n-min)/step))>1e-7))fail();assumptions[key]=n;
  }
  const hasConditions=Object.keys(assumptions).length>0;
  const policy={title:text(p.title,120),url:url.href,regime:p.regime,status:p.status,revision:p.revision,
    publishedOn:date(p.publishedOn),checkedOn:date(p.checkedOn),effectiveOn:date(p.effectiveOn,p.status!=='in-force'),
    before:text(p.before,1000),after:text(p.after,1000),uncertainty:text(p.uncertainty,1000),coverage:p.coverage,reviewed:p.reviewed,assumptions};
  if(policy.checkedOn<policy.publishedOn)fail();
  const vessels=value.vessels.map((r,i)=>{
    if(!r||typeof r.affected!=='boolean')fail();
    const quantified=hasConditions&&r.affected;
    return {label:'Vessel '+(i+1),affected:r.affected,beforeEur:finite(r.beforeEur),beforeGbp:finite(r.beforeGbp),
      afterEur:quantified?finite(r.afterEur):null,afterGbp:quantified?finite(r.afterGbp):null};
  });
  return {schema:POLICY_EXPLANATION_SCHEMA,modelVersion:text(value.modelVersion,40),policy,vessels,
    totals:policyExplanationTotals(vessels,hasConditions)};
}
