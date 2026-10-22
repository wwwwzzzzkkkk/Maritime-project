import {MODEL_VERSION} from './compliance-engine.mjs?v=4.7.2';
import {fleetSummary,hasConditions} from './decision-desk.mjs?v=4.7.2';
import {POLICY_EXPLANATION_SCHEMA,policyExplanationTotals} from './policy-explanation-data.mjs?v=4.7.2';

// Never copies names, customer references, raw ledgers, authors, reviewers or action history.
export function buildPolicyExplanation(desk,policy){
  const s=fleetSummary(desk,policy);
  const vessels=s.rows.map((row,i)=>({label:'Vessel '+(i+1),affected:row.affected,
    beforeEur:row.before.comparison.active.totalEur,beforeGbp:row.before.comparison.active.ukEts,
    afterEur:row.quantified?row.eur:null,afterGbp:row.quantified?row.gbp:null}));
  return {schema:POLICY_EXPLANATION_SCHEMA,modelVersion:MODEL_VERSION,
    policy:{...(policy.retrieval?{retrieval:structuredClone(policy.retrieval)}:{}),title:policy.title,url:policy.url,regime:policy.regime,status:policy.status,revision:policy.revision,
      publishedOn:policy.publishedOn,checkedOn:policy.checkedOn,effectiveOn:policy.effectiveOn,
      before:policy.before,after:policy.after,uncertainty:policy.uncertainty,
      coverage:policy.allShips?'all':'selected',reviewed:policy.review!==null,assumptions:{...policy.assumptions}},
    vessels,totals:policyExplanationTotals(vessels,hasConditions(policy))};
}
