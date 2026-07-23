"use client";

import { useState, useCallback } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { FormInput, FormCheckbox } from "@/components/layouts/ui/form-components";
import { ButtonSave } from "@/components/layouts/ui/buttons/button-save/button-save";
import { localSchema, LocalFormData } from "@/app/(private)/cadastros/locais/schema";
import { createLocal, updateLocal, Local, AnexoLocal } from "@/services/locais.service";
import { X, FileText, Image as ImageIcon } from "lucide-react";

interface LocalFormProps {
  initialData?: Local;
  isEditing?: boolean;
}

export function LocalForm({ initialData, isEditing = false }: LocalFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<AnexoLocal[]>(initialData?.AnexoLocal || []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);

      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingAttachment = (index: number) => {
    // visual only for now as requested
    setExistingAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const methods = useForm<LocalFormData>({
    resolver: zodResolver(localSchema),
    defaultValues: {
      nome: initialData?.nome || "",
      codigo: initialData?.codigo || "",
      endereco: initialData?.endereco || "",
      linkMapa: initialData?.linkMapa || "",
      externo: initialData?.externo || false,
    },
  });

  const {
    handleSubmit,
    register,
    formState: { errors, isValid },
  } = methods;

  const onSubmit = async (data: LocalFormData) => {
    const formData = new FormData();
    formData.append("nome", data.nome);
    if (data.codigo) formData.append("codigo", data.codigo);
    if (data.endereco) formData.append("endereco", data.endereco);
    if (data.linkMapa) formData.append("linkMapa", data.linkMapa);
    formData.append("externo", String(data.externo));

    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      if (isEditing && initialData) {
        await updateLocal(initialData.id, formData);
        Swal.fire({
          icon: "success",
          title: "Sucesso!",
          text: "Local atualizado com sucesso.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await createLocal(formData);
        Swal.fire({
          icon: "success",
          title: "Sucesso!",
          text: "Local criado com sucesso.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      router.push("/cadastros/locais");
      router.refresh();
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Ocorreu um erro ao salvar o local.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Nome *"
              placeholder="Nome do local"
              error={errors.nome?.message}
              {...register("nome")}
            />
            <FormInput
              label="Código"
              placeholder="Código identificador"
              error={errors.codigo?.message}
              {...register("codigo")}
            />
            <div className="md:col-span-2">
              <FormInput
                label="Endereço"
                placeholder="Endereço completo"
                error={errors.endereco?.message}
                {...register("endereco")}
              />
            </div>
            <div className="md:col-span-2">
              <FormInput
                label="Link do Mapa (Google Maps Embed URL)"
                placeholder="Cole aqui o HTML do 'Embed a map' ou a URL de incorporação"
                error={errors.linkMapa?.message}
                {...register("linkMapa", {
                  onChange: (e) => {
                    const value = e.target.value;
                    // Regex to extract src from iframe
                    const iframeSrcMatch = value.match(/src="([^"]+)"/);
                    if (iframeSrcMatch && iframeSrcMatch[1]) {
                      // If user pasted the full iframe code, extract just the src
                      methods.setValue("linkMapa", iframeSrcMatch[1], { shouldValidate: true });
                    }
                  }
                })}
              />
              <p className="text-xs text-gray-500 mt-1">
                Dica: No Google Maps, vá em <strong>Compartilhar {">"} Incorporar um mapa</strong> e copie o HTML.
                O sistema extrairá o link automaticamente.
              </p>
            </div>
            <div className="flex items-center">
              <FormCheckbox
                label="Local Externo"
                {...register("externo")}
              />
            </div>

            <div className="md:col-span-2 space-y-4">
              <label className="block text-sm font-medium text-gray-700">Anexos (Imagens/Documentos)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50 transition-colors cursor-pointer relative">
                <div className="space-y-1 text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload de arquivos</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        multiple
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">ou arraste e solte</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, PDF até 10MB</p>
                </div>
              </div>

              {/* Lista de Arquivos Selecionados */}
              {(files.length > 0 || existingAttachments.length > 0) && (
                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
                  {existingAttachments.map((anexo, index) => (
                    <li key={`existing-${anexo.id}`} className="relative rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {anexo.mimetype?.startsWith('image/') ? (
                          <img src={anexo.urlArquivo} alt={anexo.nome || 'Anexo'} className="h-10 w-10 rounded object-cover" />
                        ) : (
                          <FileText className="h-10 w-10 text-gray-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <a href={anexo.urlArquivo} target="_blank" rel="noreferrer" className="text-sm font-medium text-gray-900 truncate hover:underline block">
                          {anexo.nome || 'Documento'}
                        </a>
                      </div>
                      {/* Optional: Add remove button for existing attachments if API supports it */}
                    </li>
                  ))}

                  {files.map((file, index) => (
                    <li key={`new-${index}`} className="relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {file.type.startsWith('image/') ? (
                          <img src={previews[index]} alt="Preview" className="h-10 w-10 rounded object-cover" />
                        ) : (
                          <FileText className="h-10 w-10 text-gray-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
            >
              Cancelar
            </button>
            <ButtonSave
              type="submit"
              loading={isSubmitting}
              disabled={!isValid || isSubmitting}
            >
              {isEditing ? "Atualizar" : "Salvar"}
            </ButtonSave>
          </div>
        </form>
      </div>
    </FormProvider>
  );
}
