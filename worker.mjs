import {handleOfficialPolicyRequest} from './server/official-policies.mjs';
import {handleAiRequest} from './server/ai-handler.mjs';
export default {
  fetch(request,env) {
    if(new URL(request.url).pathname==='/api/policies')return handleOfficialPolicyRequest(request,{env,cache:caches.default});
    return handleAiRequest(request,{env,requireAccessCode:true});
  }
};
