
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCaracteristicaAction } from '@/app/(private)/espacos/action';
import Swal from 'sweetalert2';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@cnc-ti/layout-basic';
import { FormInput } from '@/components/layouts/ui/form-components';

const schema = z.object({
    nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres.")
});

export type FormNovaCaracteristicaData = z.infer<typeof schema>;

interface ModalAddCaracteristicaProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (data: FormNovaCaracteristicaData & { id?: number }) => void;
}

export function ModalAddCaracteristica({ open, onOpenChange, onSuccess }: ModalAddCaracteristicaProps) {

    const methods = useForm<FormNovaCaracteristicaData>({
        resolver: zodResolver(schema)
    });

    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: createCaracteristicaAction,
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['caracteristicas'] });
            Swal.fire({
                title: 'Sucesso!',
                text: 'Característica adicionada.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
            });
            onSuccess({ nome: response.data.nome, id: response.data.Id || response.data.id });
            onOpenChange(false);
            reset();
        },
        onError: () => {
            Swal.fire('Erro', 'Não foi possível cadastrar a característica.', 'error');
        }
    });

    const { handleSubmit, reset } = methods;

    function onSubmit(data: FormNovaCaracteristicaData) {
        mutation.mutate(data);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Adicionar Nova Característica</DialogTitle>
                </DialogHeader>

                <FormProvider {...methods}>
                    <div className="space-y-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 block mb-1">
                                Característica <span className="text-red-500">*</span>
                            </label>
                            <input
                                {...methods.register("nome")}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Ex: Projetor, Ar Condicionado..."
                                autoFocus
                            />
                            {methods.formState.errors.nome && (
                                <span className="text-xs text-red-500 mt-1 block">
                                    {methods.formState.errors.nome.message}
                                </span>
                            )}
                        </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={(e) => { e.stopPropagation(); onOpenChange(false); }} disabled={mutation.isPending}>
                            Cancelar
                        </Button>
                        <Button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSubmit(onSubmit)(); }} disabled={mutation.isPending}>
                            {mutation.isPending ? 'Salvando...' : 'Adicionar'}
                        </Button>
                    </DialogFooter>
                </div>
                </FormProvider>
            </DialogContent>
        </Dialog>
    );
}
