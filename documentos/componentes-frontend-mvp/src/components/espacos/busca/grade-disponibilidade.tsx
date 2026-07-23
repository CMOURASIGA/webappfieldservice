import { Espaco } from "@/services/espacos/tipo-espaco";
import { Badge, Button } from "@cnc-ti/layout-basic";
import { Users, LayoutGrid, MapPin } from "lucide-react";
export type GradeDisponibilidadeProps = {
    itens: Espaco[];
    loading: boolean;
    onReservar: any;
}
export function GradeDisponibilidade({ itens, loading, onReservar }: GradeDisponibilidadeProps) {

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {itens && itens.length > 0 && itens.map((espaco, i) => (
                <div key={i} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg text-slate-800">{espaco.nome}</h3>
                            <Badge variant={espaco.ativo ? "success" : "danger"}>
                                {espaco.ativo ? "Disponível" : "Indisponível"}
                            </Badge>
                        </div>

                        <div className="space-y-2 mb-6">
                            <div className="flex items-center text-sm text-slate-600">
                                <MapPin className="w-4 h-4 mr-2" />
                                {espaco.Local?.nome || "Local não informado"}
                            </div>
                            <div className="flex items-center text-sm text-slate-600">
                                <Users className="w-4 h-4 mr-2" />
                                Capacidade: {espaco.capacidade} pessoas
                            </div>
                            <div className="flex items-center text-sm text-slate-600">
                                <LayoutGrid className="w-4 h-4 mr-2" />
                                Status: {espaco.ativo ? "Livre para reserva" : "Ocupado"}
                            </div>
                        </div>

                        <Button
                            className="w-full"
                            disabled={!espaco.ativo}
                            onClick={() => onReservar(espaco)}
                        >
                            Reservar espaço
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}