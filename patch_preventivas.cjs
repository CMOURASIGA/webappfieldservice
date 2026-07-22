const fs = require('fs');
let content = fs.readFileSync('src/pages/Preventivas.tsx', 'utf8');

// Add "Ações" column to table header
content = content.replace(
  /<th className="px-6 py-4 border-b border-slate-200">Status<\/th>/,
  '<th className="px-6 py-4 border-b border-slate-200">Status</th>\n                  <th className="px-6 py-4 border-b border-slate-200 text-right">Ações</th>'
);

// Add buttons to table row
const rowEndIndex = content.indexOf('<td className="px-6 py-4">{getStatusBadge(plan.nextExecution)}</td>');
if (rowEndIndex !== -1) {
  content = content.replace(
    /<td className="px-6 py-4">\{getStatusBadge\(plan\.nextExecution\)\}<\/td>/g,
    `<td className="px-6 py-4">{getStatusBadge(plan.nextExecution)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); navigate(\`/preventivas/\${plan.id}\`); }} title="Visualizar">
                          <Eye className="w-4 h-4 text-slate-600" />
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); navigate(\`/preventivas/\${plan.id}/editar\`); }} title="Editar">
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); if (window.confirm("Deseja realmente excluir este plano?")) { const newPlans = plans.filter(p => p.id !== plan.id); storageService.set("gsi_preventive_plans", newPlans); setPlans(newPlans); } }} title="Excluir">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </td>`
  );
}

// Adjust colSpan for empty state
content = content.replace(/colSpan={7}/g, 'colSpan={8}');

fs.writeFileSync('src/pages/Preventivas.tsx', content);
