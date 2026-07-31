"use client";

import { useEffect, useState } from "react";
import {
  Control,
  UseFormSetValue,
  useWatch,
  FieldErrors,
} from "react-hook-form";
import { SelectField } from "@/layouts/ui/fields/select-field/select-field";

interface SelecaoLocalEspacoProps {
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  errors: FieldErrors;
  locais: { label: string; value: string }[];
  espacos: any[];
  readOnly?: boolean;
  name?: string; // padrão 'idEspaco'
  required?: boolean;
  containerClassItem?: string;
  showInactive?: boolean;
}

export function SelecaoLocalEspaco({
  control,
  setValue,
  errors,
  locais,
  espacos,
  readOnly = false,
  name = "idEspaco",
  required = true,
  containerClassItem = "md:col-span-6",
  showInactive = false,
}: SelecaoLocalEspacoProps) {
  // Agora observamos ambos os campos do formulário
  const selectedEspacoId = useWatch({ control, name });
  const selectedLocalId = useWatch({ control, name: "idLocal" });

  const [filteredEspacos, setFilteredEspacos] = useState<any[]>(espacos);

  // 1. Filtra os espaços sempre que o idLocal no formulário mudar
  useEffect(() => {
    const filterActiveOrSelected = (e: any) => {
      if (showInactive) return true;
      const isSelected =
        selectedEspacoId &&
        String(e.Id || e.value || e.id) === String(selectedEspacoId);
      return e.ativo !== false || isSelected;
    };

    if (selectedLocalId) {
      const filtered = espacos.filter((e: any) => {
        const localId = e.idLocal || e.IdLocal || e.localId || e.LocalId;
        return (
          String(localId) === String(selectedLocalId) &&
          filterActiveOrSelected(e)
        );
      });
      setFilteredEspacos(filtered);
    } else {
      setFilteredEspacos(espacos.filter(filterActiveOrSelected));
    }
  }, [selectedLocalId, espacos, selectedEspacoId]);

  // 2. Lógica de "Auto-preenchimento" reverso:
  // Se o idEspaco vier preenchido (ex: edição), setamos o idLocal correspondente
  useEffect(() => {
    if (selectedEspacoId && espacos.length > 0) {
      const currentEspaco = espacos.find(
        (e: any) =>
          String(e.value || e.Id || e.id) === String(selectedEspacoId),
      );

      if (currentEspaco) {
        const localDoEspaco = currentEspaco.idLocal || currentEspaco.IdLocal;
        // Só atualiza se for diferente para evitar loops
        if (
          localDoEspaco &&
          String(localDoEspaco) !== String(selectedLocalId)
        ) {
          setValue("idLocal", String(localDoEspaco), { shouldDirty: true });
        }
      }
    }
  }, [selectedEspacoId, espacos, setValue, selectedLocalId]);

  // Manipula a troca de Local manualmente
  const handleLocalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setValue("idLocal", newValue, { shouldValidate: true, shouldDirty: true });

    // Se mudou o local, o espaço antigo não faz mais sentido, então limpamos
    setValue(name, undefined, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <>
      <div className={containerClassItem}>
        <SelectField
          name="idLocal"
          label="Local"
          options={locais || []}
          value={selectedLocalId || ""} // Garante que o valor venha do form (via useWatch)
          onChange={handleLocalChange}
          disabled={readOnly}
          className="[&_button]:!bg-white [&_div[role=combobox]]:!bg-white"
          error={errors.idLocal?.message as string}
        />
      </div>

      <div className={containerClassItem}>
        <SelectField
          name={name}
          disabled={readOnly || !selectedLocalId}
          options={filteredEspacos.map((e: any) => ({
            label: e.nome || e.label || e.Nome,
            value: String(e.Id || e.value || e.id),
          }))}
          label="Espaço"
          required={required}
          modal={true}
          className="[&_button]:!bg-white [&_div[role=combobox]]:!bg-white"
          error={errors[name]?.message as string}
        />
      </div>
    </>
  );
}
