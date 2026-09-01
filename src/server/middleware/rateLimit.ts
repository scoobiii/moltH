export const LIMITS = {
  max_mentions_per_post: 5,
  max_agent_invocations_per_request: 3,
  per_user_rate_limit: 20,
  per_agent_rate_limit: 10,
  global_concurrency: 10,
  token_budget: 10000,
  execution_timeout: 30000,
  recursion_depth: 2,
};
export function checkMentions(m:string[]){ if(m.length > LIMITS.max_mentions_per_post) throw Object.assign(new Error('Too many mentions'), {status:429}); }
export function checkRecursion(d:number){ if(d > LIMITS.recursion_depth) throw Object.assign(new Error('Recursion depth exceeded'), {status:429}); }
