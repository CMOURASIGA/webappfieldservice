"use client";
import React, { useEffect, useRef, useState } from "react";
import { Avatar } from "../../avatar";

export interface IImgUpload {
  urlfoto?: string;
  onChange?: (file: File | null) => void;
}

const ImgUpload: React.FC<IImgUpload> = ({ urlfoto, onChange }) => {
  const [preview, setPreview] = useState<string | null>(urlfoto || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(urlfoto || null);
  }, [urlfoto]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onChange && onChange(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onChange && onChange(null);
  };

  return (
    <div className="flex flex-col">
      {preview ? (
        <div className="relative w-fit">
          <Avatar
            tamanho="grande"
            textoAlternativo={"Imagem do Representante"}
            urlFoto={preview}
          />

          <button
            onClick={handleRemove}
            type="button"
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center shadow hover:bg-red-600"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-40 h-40 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors"
        >
          Enviar Foto
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ImgUpload;
