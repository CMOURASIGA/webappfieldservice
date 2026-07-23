"use client";
import React, { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";

export interface IDocsUpload {
  initialFiles?: string[];
  onChange: (files: { file: File; name: string }[]) => void;
}

const ALLOWED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpg",
  "image/jpeg",
];

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

interface UploadItem {
  originalName: string;
  newName: string;
  file?: File;
  isRemote: boolean;
}

const DocsUpload: React.FC<IDocsUpload> = ({ initialFiles = [], onChange }) => {
  const [files, setFiles] = useState<UploadItem[]>([]);
  const [removedRemote, setRemovedRemote] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!initialFiles) return;

    setFiles((prev) => {
      const remoteNames = prev
        .filter((f) => f.isRemote)
        .map((f) => f.originalName);

      const mudou =
        remoteNames.length !== initialFiles.length ||
        !remoteNames.every((name) => initialFiles.includes(name));

      if (!mudou) return prev;

      // 🔥 Remove arquivos remotos que o usuário deletou
      const filteredInitial = initialFiles.filter(
        (name) => !removedRemote.includes(name)
      );

      return [
        ...filteredInitial.map((name) => ({
          originalName: name,
          newName: name,
          file: undefined,
          isRemote: true,
        })),
        ...prev.filter((f) => !f.isRemote),
      ];
    });
  }, [initialFiles, removedRemote]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);
    const validFiles: UploadItem[] = [];

    for (const file of selectedFiles) {
      const originalName = file.name;

      // validando tipo
      if (!ALLOWED_TYPES.includes(file.type)) {
        Swal.fire({
          text: "Formato de arquivo não permitido.",
          icon: "error",
          width: 500,
          showConfirmButton: false,
          timer: 1500,
        });
        continue;
      }

      // validando tamanho
      if (file.size > MAX_SIZE) {
        Swal.fire({
          text: "O arquivo excede o tamanho máximo permitido.",
          icon: "error",
          width: 500,
          showConfirmButton: false,
          timer: 1500,
        });
        continue;
      }

      // checar duplicado pelo nome original
      const isDuplicate = files.some((f) => f.originalName === originalName);
      if (isDuplicate) continue;

      // renomear para upload
      const timestamp = Date.now();
      const ext = originalName.split(".").pop();
      const baseName = originalName.replace(/\.[^/.]+$/, "");
      const newName = `${baseName}_${timestamp}.${ext}`;

      const renamedFile = new File([file], newName, { type: file.type });

      validFiles.push({
        originalName,
        newName,
        file: renamedFile,
        isRemote: false,
      });
    }

    // 🔥 Mantém arquivos anteriores + novos uploads
    const updated = [...files, ...validFiles];

    setFiles(updated);
    // envia apenas arquivos locais
    onChange(
      updated.map((f) => {
        return { file: f.file!, name: f.newName };
      })
    );
  };

  const handleRemove = (index: number) => {
    const item = files[index];

    if (item.isRemote) {
      setRemovedRemote((prev) => [...prev, item.originalName]);
    }

    const updated = files.filter((_, i) => i !== index);

    setFiles(updated);
    onChange(
      updated.map((f) => {
        return { file: f.file!, name: f.newName };
      })
    );
  };

  return (
    <div className="w-full flex flex-col space-y-3">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="px-4 py-2 border-2 border-dashed rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 transition"
      >
        Anexar Documentos
      </button>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.png,.jpg,.jpeg"
        className="hidden"
        onChange={handleFileChange}
      />

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((item, index) => (
            <li
              key={index}
              className="flex items-center justify-between p-2 border rounded-lg bg-gray-50"
            >
              <span className="font-medium text-sm">{item.originalName}</span>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="text-red-500 hover:text-red-700 text-sm font-semibold"
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DocsUpload;
