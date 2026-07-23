"use client";

import { useEffect, useState } from "react";
import { LocalForm } from "@/components/cadastros/locais/local-form";
import { getLocalById, Local } from "@/services/locais.service";
import Swal from "sweetalert2";

interface EditLocalWrapperProps {
    id: string;
}

export function EditLocalWrapper({ id }: EditLocalWrapperProps) {
  const [local, setLocal] = useState<Local | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLocal = async () => {
      try {
        const data = await getLocalById(+id);
        setLocal(data);
      } catch (error) {
        console.error("Erro ao buscar local:", error);
        Swal.fire("Erro", "Não foi possível carregar o local.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
        fetchLocal();
    } else {
        setIsLoading(false); 
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="w-full p-8 text-center text-gray-500">Carregando...</div>
    );
  }

  if (!local) {
    return (
      <div className="w-full p-8 text-center text-red-500">Local não encontrado.</div>
    );
  }

  return (
    <div className="mt-6">
        <LocalForm initialData={local} isEditing />
    </div>
  );
}
