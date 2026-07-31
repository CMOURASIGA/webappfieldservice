const fs = require('fs');
let code = fs.readFileSync('src/pages/Preventivas.tsx', 'utf8');

code = code.replace(/import \{ format, isValid, parseISO, isPast, isToday, differenceInDays \} from "date-fns";/, 'import { format, isValid, parseISO, isPast, isToday, differenceInDays } from "date-fns";\nimport { calculateNextExecution } from "../utils/preventiveCalc";');

// In getStatus, we'll pass the computed next execution instead of raw.
// So let's wrap the map rendering and variables to use `calculateNextExecution`
// Actually, it's easier to just compute `realNextExecution` for each plan inside the component

code = code.replace(/const getStatus = \(nextExecution\?: string\) => \{/, 'const getComputedNextExecution = (plan: PreventivePlan) => {\n    return calculateNextExecution(plan.periodicity as any, plan.lastExecution, plan.startDate) || plan.nextExecution;\n  };\n\n  const getStatus = (nextExecution?: string) => {');

code = code.replace(/getStatus\(p\.nextExecution\)/g, 'getStatus(getComputedNextExecution(p))');

code = code.replace(/const status = getStatus\(plan\.nextExecution\);/, 'const nextExec = getComputedNextExecution(plan);\n          const status = getStatus(nextExec);');

code = code.replace(/plan\.nextExecution \? format\(parseISO\(plan\.nextExecution\), 'dd\/MM\/yyyy'\) : 'N\/A'/g, 'nextExec ? format(parseISO(nextExec), "dd/MM/yyyy") : "N/A"');


fs.writeFileSync('src/pages/Preventivas.tsx', code);
