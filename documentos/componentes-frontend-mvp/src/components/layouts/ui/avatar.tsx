"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

/**
 * Props do componente AvatarRepresentante
 */
export interface AvatarRepresentanteProps {
  /** URL da foto do representante */
  urlFoto?: string | null;
  /** Nome do representante (usado para acessibilidade) */
  textoAlternativo?: string;
  /** Tamanho do avatar */
  tamanho?: "pequeno" | "medio" | "grande";
  /** Classes CSS adicionais */
  className?: string;
  /** Indica se está carregando */
  estaCarregando?: boolean;
}

/**
 * Mapeamento de tamanhos para classes CSS
 */
const tamanhoClasses = {
  pequeno: "w-8 h-8",
  medio: "w-12 h-12",
  grande: "w-32 h-32",
};

/**
 * Mapeamento de tamanhos para ícones
 */
const tamanhoIcone = {
  pequeno: 16,
  medio: 20,
  grande: 64,
};

/**
 * Mapeamento de tamanhos em pixels para o componente Image
 */
const tamanhoPixels = {
  pequeno: 32, // 8 * 4 = 32px (w-8 h-8)
  medio: 48,   // 12 * 4 = 48px (w-12 h-12)
  grande: 128, // 32 * 4 = 128px (w-32 h-32)
};

/**
 * Componente para exibir avatar do representante
 * Exibe a foto quando disponível, caso contrário mostra um ícone de usuário
 */
export function Avatar({
  urlFoto,
  textoAlternativo = "Representante",
  tamanho = "medio",
  className,
  estaCarregando = false,
}: AvatarRepresentanteProps) {
  const classesBase = cn(
    "flex items-center justify-center rounded-full bg-gray-100 border-2 border-gray-200 overflow-hidden",
    tamanhoClasses[tamanho],
    className
  );

  // Estado de carregamento
  if (estaCarregando) {
    return (
      <div
        className={cn(classesBase, "animate-pulse bg-gray-200")}
        aria-label="Carregando foto do representante"
      />
    );
  }

  // Se tem foto, exibe a imagem
  if (urlFoto) {
    return (
      <div className={classesBase}>
        <Image
          src={urlFoto}
          alt={`Foto de ${textoAlternativo}`}
          width={tamanhoPixels[tamanho]}
          height={tamanhoPixels[tamanho]}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Em caso de erro ao carregar a imagem, esconde ela
            const target = e.target as HTMLImageElement;
            target.style.display = "none";

            // Adiciona o ícone de fallback
            const container = target.parentElement;
            if (container && !container.querySelector('.fallback-icon')) {
              const icon = document.createElement('div');
              icon.className = 'fallback-icon flex items-center justify-center w-full h-full text-gray-400';
              icon.innerHTML = `<svg width="${tamanhoIcone[tamanho]}" height="${tamanhoIcone[tamanho]}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
              container.appendChild(icon);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className={cn(classesBase, "text-gray-400")}>
      <svg
        width={tamanhoIcone[tamanho]}
        height={tamanhoIcone[tamanho]}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
      <span className="sr-only">Foto não disponível para {textoAlternativo}</span>
    </div>
  );
}
