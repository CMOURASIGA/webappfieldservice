const fs = require('fs');
let content = fs.readFileSync('src/pages/DetalheOrdem.tsx', 'utf8');

const materialsJSX = `
              {/* Materials Section */}
              <div className="pt-4 border-t border-slate-200 mt-6">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm font-semibold text-slate-900">Materiais Necessários</p>
                  {order.status === "Em execução" || order.status === "Planejada" || order.status === "Atribuída" ? (
                    <Button variant="secondary" size="sm" onClick={() => setAddingMaterial(!addingMaterial)}>
                      {addingMaterial ? "Cancelar" : "+ Adicionar Material"}
                    </Button>
                  ) : null}
                </div>
                
                {addingMaterial && (
                  <div className="mb-4 bg-slate-50 p-4 rounded-md border border-slate-200 space-y-4">
                    <div className="flex gap-4 border-b border-slate-200 pb-2">
                      <label className="flex items-center gap-2 cursor-pointer text-sm">
                        <input type="radio" checked={matMode === "base"} onChange={() => setMatMode("base")} className="text-brand-600" />
                        <span className={matMode === "base" ? "font-medium text-slate-900" : "text-slate-500"}>Material Cadastrado</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-sm">
                        <input type="radio" checked={matMode === "unregistered"} onChange={() => setMatMode("unregistered")} className="text-brand-600" />
                        <span className={matMode === "unregistered" ? "font-medium text-slate-900" : "text-slate-500"}>Não Cadastrado</span>
                      </label>
                    </div>
                    
                    {matMode === "base" ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Select label="Buscar Material" value={selectedStockMatId} onChange={e => setSelectedStockMatId(e.target.value)}>
                          <option value="">Selecione um material...</option>
                          {stockMaterials.filter(sm => sm.active !== false).map(sm => (
                            <option key={sm.id} value={sm.id}>{sm.code} - {sm.name} (Disp: {sm.availableBalance} {sm.unit})</option>
                          ))}
                        </Select>
                        <Select label="Classificação" value={matClass} onChange={e => setMatClass(e.target.value)}>
                          <option value="Obrigatório">Obrigatório</option>
                          <option value="Recomendado">Recomendado</option>
                          <option value="Contingencial">Contingencial</option>
                          <option value="Terceiro">Fornecido por terceiro</option>
                          <option value="Eventual">Eventual</option>
                        </Select>
                        <Input type="number" label="Quantidade" value={matQuantity} onChange={e => setMatQuantity(Number(e.target.value))} min={1} />
                        <div className="flex items-end">
                          <Button onClick={handleAddMaterialNew} className="w-full" disabled={!selectedStockMatId || matQuantity < 1}>Adicionar Material</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Input label="Descrição Sugerida" value={matDescUnreg} onChange={e => setMatDescUnreg(e.target.value)} placeholder="Descreva o material" required />
                          <Input type="number" label="Quantidade Estimada" value={matQuantity} onChange={e => setMatQuantity(Number(e.target.value))} min={1} required />
                          <div className="sm:col-span-2">
                            <Input label="Justificativa da Necessidade" value={matJustification} onChange={e => setMatJustification(e.target.value)} placeholder="Por que este material é necessário?" required />
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button onClick={handleAddMaterialNew} disabled={!matDescUnreg || !matJustification || matQuantity < 1}>Solicitar Material</Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {order.materials && order.materials.length > 0 ? (
                  <div className="space-y-2">
                    {order.materials.map(m => (
                      <div key={m.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-white border border-slate-200 rounded-md shadow-sm gap-2">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800 text-sm">{m.description}</span>
                            {m.isUnregistered && <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-700">Não cadastrado</span>}
                          </div>
                          <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span>Qtd: <strong className="text-slate-700">{m.quantity} {m.type || ""}</strong></span>
                            <span>Classe: {m.classification || "N/A"}</span>
                            <span className={\`px-1.5 py-0.5 rounded-sm font-medium \${m.availability === 'Disponível' ? 'bg-green-100 text-green-700' : m.availability === 'Parcialmente disponível' ? 'bg-yellow-100 text-yellow-700' : m.availability === 'Aguardando validação' ? 'bg-slate-100 text-slate-700' : 'bg-red-100 text-red-700'}\`}>
                              {m.availability || "Desconhecido"}
                            </span>
                          </div>
                          {m.justification && <p className="text-xs text-slate-500 mt-1 italic line-clamp-1">"{m.justification}"</p>}
                        </div>
                        {(order.status === "Em execução" || order.status === "Planejada") && (
                          <div className="flex justify-end">
                            <button onClick={() => handleRemoveMaterial(m.id)} className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic py-2">Nenhum material adicionado à OS.</p>
                )}
              </div>
`;

content = content.replace(/\{\/\* Materials Section \*\/\}[\s\S]*?\{\/\* Attachments Section \*\/\}/, materialsJSX + '\n              {/* Attachments Section */}');

fs.writeFileSync('src/pages/DetalheOrdem.tsx', content);
