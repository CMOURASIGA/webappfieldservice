'use client';

import { readNavigateToEventFromAgenda } from '@/lib/navigation/event-from-agenda';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export type UseSmartBackOptions = {
    /**
     * Se true, `canGoBack` só é true quando o utilizador chegou a esta rota pelo link da agenda
     * (sessionStorage definido no clique). Evita mostrar voltar em link direto / nova aba.
     */
    gateFromAgenda?: boolean;
};

/**
 * Hook customizado para navegação inteligente que ignora mudanças de query params
 * e volta para a página anterior real (origem da navegação)
 */
export function useSmartBack(options?: UseSmartBackOptions) {
    const gateFromAgenda = options?.gateFromAgenda ?? false;
    const router = useRouter();
    const entryUrlRef = useRef<string | null>(null);
    const isInitializedRef = useRef(false);
    const [canGoBack, setCanGoBack] = useState(false);

    useEffect(() => {
        if (!isInitializedRef.current) {
            isInitializedRef.current = true;

            if (typeof window !== 'undefined') {
                entryUrlRef.current = window.location.pathname;
                if (gateFromAgenda) {
                    const target = readNavigateToEventFromAgenda();
                    const path = window.location.pathname;
                    setCanGoBack(!!target && target === path);
                } else {
                    setCanGoBack(window.history.length > 1);
                }
            }
        }
    }, [gateFromAgenda]);

    const goBackSafe = () => {
        if (typeof window === 'undefined') return;

        const currentPath = window.location.pathname;
        const intervalId = setInterval(() => {
            if (window.location.pathname !== currentPath) {
                clearInterval(intervalId);
            } else if (window.history.length > 1) {
                window.history.back();
            } else {
                clearInterval(intervalId);
                router.push('/');
            }
        }, 100);

        setTimeout(() => {
            clearInterval(intervalId);
        }, 3000);
    };

    return { goBackSafe, canGoBack };
}