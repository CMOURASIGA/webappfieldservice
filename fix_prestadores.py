import re

with open('src/pages/Prestadores.tsx', 'r') as f:
    content = f.read()

start_str = '<div className="pt-4 mt-4 border-t border-slate-100 flex justify-end gap-2">'
end_str = '</Button>\n                      )}\n                    </div>'
start_idx = content.find(start_str)
end_idx = content.find(end_str, start_idx) + len(end_str)

if start_idx != -1 and end_idx != -1:
    replacement = """<CardFooter className="pt-0 pb-5 px-5">
                      <CardFooterActions
                        viewLink={`/prestadores/${provider.id}`}
                        viewLabel="Ver detalhes"
                        editLink={canEdit ? `/prestadores/${provider.id}/editar` : undefined}
                        editLabel="Editar prestador"
                        onDelete={canToggle ? () => toggleStatus(provider.id, provider.status) : undefined}
                        deleteLabel={provider.status === "Ativo" ? "Inativar prestador" : "Reativar prestador"}
                        isDeactivate={true}
                      />
                    </CardFooter>"""
    new_content = content[:start_idx] + replacement + content[end_idx:]
    with open('src/pages/Prestadores.tsx', 'w') as f:
        f.write(new_content)
