import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@cnc-ti/layout-basic";
import { FormInput } from "@/components/layouts/ui/form-components";
import { createTematica, OptionItem } from "@/services/dominios/dominios.service";
import Swal from "sweetalert2";

const schema = z.object({
    nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
});

type FormData = z.infer<typeof schema>;

interface ModalAddTematicaProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (newOption: OptionItem) => void;
}

export function ModalAddTematica({
    open,
    onOpenChange,
    onSuccess,
}: ModalAddTematicaProps) {
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    async function onSubmit(data: FormData, e?: React.BaseSyntheticEvent) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setLoading(true);
        try {
            const newItem = await createTematica(data.nome);
            if (newItem) {
                onSuccess(newItem);
                onOpenChange(false);
                reset();
                Swal.fire({
                    icon: "success",
                    title: "Sucesso",
                    text: "Temática adicionada com sucesso!",
                    timer: 1500,
                    showConfirmButton: false,
                });
            } else {
                Swal.fire("Erro", "Não foi possível salvar a temática.", "error");
            }
        } catch (error) {
            console.error(error);
            Swal.fire("Erro", "Ocorreu um erro ao salvar.", "error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Adicionar Nova Temática</DialogTitle>
                </DialogHeader>

                <form
                    onSubmit={(e) => {
                        e.stopPropagation();
                        handleSubmit(onSubmit)(e);
                    }}
                    className="space-y-4 py-4"
                >
                    <FormInput
                        label="Nome da Temática"
                        placeholder="Digite o nome..."
                        error={errors.nome?.message}
                        {...register("nome")}
                        autoFocus
                    />

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
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
