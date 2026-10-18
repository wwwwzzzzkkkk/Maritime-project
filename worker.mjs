import {handleAiRequest} from './server/ai-handler.mjs';
export default {
  fetch(request,env) {
    return handleAiRequest(request,{env,requireAccessCode:true});
  }
};
