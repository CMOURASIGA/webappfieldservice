const fs = require('fs');
let content = fs.readFileSync('src/pages/Ativos.tsx', 'utf8');

const locationTabEnd = `
      ) : (
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4 border-b border-slate-200">Código</th>
                  <th className="px-6 py-4 border-b border-slate-200">Nome / Tipo</th>
                  <th className="px-6 py-4 border-b border-slate-200">Unidade</th>
                  <th className="px-6 py-4 border-b border-slate-200">Estrutura</th>
                  <th className="px-6 py-4 border-b border-slate-200 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {locations.filter(l => l.active !== false).map(loc => (
                  <tr key={loc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{loc.code}</td>
                    <td className="px-6 py-4 text-slate-900 flex flex-col">
                      <span>{loc.name}</span>
                      <span className="text-xs text-slate-400">{loc.type}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{getUnitName(loc.unitId)}</td>
                    <td className="px-6 py-4 text-slate-600 text-xs flex flex-col gap-0.5">
                      {loc.area && <span>Área: {loc.area}</span>}
                      {loc.floor && <span>Pavimento: {loc.floor}</span>}
                      {loc.environment && <span>Ambiente: {loc.environment}</span>}
                      {!loc.area && !loc.floor && !loc.environment && "-"}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link to={\`/locais/\${loc.id}\`} className="text-blue-600 hover:text-blue-700 font-medium text-sm mr-2">Ver</Link>
                      <button 
                        onClick={() => handleOpenEditLocation(loc)}
                        className="text-brand-600 hover:text-brand-700 font-medium text-sm"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDeleteLocation(loc.id)}
                        className="text-red-600 hover:text-red-700 font-medium text-sm"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
                {locations.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      Nenhum local cadastrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      )}
`;

content = content.replace(/<\/Card>\s+<Drawer/, '</Card>\n' + locationTabEnd + '\n      <Drawer');

fs.writeFileSync('src/pages/Ativos.tsx', content);
