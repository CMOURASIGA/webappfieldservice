import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@cnc-ti/layout-basic';
import { FormInput } from '@/components/layouts/ui/form-components';
import { createDemandante, OptionItem } from '@/services/dominios/dominios.service';
import Swal from 'sweetalert2';

const schema = z.object({
    nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres.")
});

type FormData = z.infer<typeof schema>;

interface ModalAddDemandanteProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (newOption: OptionItem) => void;
}

export function ModalAddDemandante({ open, onOpenChange, onSuccess }: ModalAddDemandanteProps) {
    const [loading, setLoading] = useState(false);
    
    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
        resolver: zodResolver(schema)
    });

    async function onSubmit(data: FormData, e?: React.BaseSyntheticEvent) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setLoading(true);
        try {
            const newItem = await createDemandante(data.nome);
            if (newItem) {
                onSuccess(newItem);
                onOpenChange(false);
                reset();
                Swal.fire({
                    icon: 'success',
                    title: 'Sucesso',
                    text: 'Demandante adicionado com sucesso!',
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
                Swal.fire('Erro', 'Não foi possível salvar o demandante.', 'error');
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Erro', 'Ocorreu um erro ao salvar.', 'error');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Adicionar Novo Demandante</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <FormInput 
                        label="Nome do Demandante" 
                        placeholder="Digite o nome..." 
                        error={errors.nome?.message}
                        {...register('nome')} 
                        autoFocus
                    />
                    
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="submit" isLoading={loading}>
                            Salvar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
