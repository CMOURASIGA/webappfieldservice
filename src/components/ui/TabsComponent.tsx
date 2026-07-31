import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@cnc-ti/layout-basic";

export type TabItem = {
  value: string;
  title: string;
  label?: React.ReactNode;
  children: React.ReactNode;
  disabled?: boolean;
};

type TabsComponentProps = {
  items: TabItem[];
  defaultValue?: string;
};

/**
 * Composição de abas usada nos formulários de cadastro.
 * A aparência é fornecida diretamente pelo kit CNC.
 */
export const TabsComponent = ({ items, defaultValue }: TabsComponentProps) => (
  <TabsWithUrl items={items} defaultValue={defaultValue} />
);

/**
 * Implementação equivalente à POC CNC: a aba ativa fica explícita na URL,
 * permitindo voltar, compartilhar e recarregar a ficha na mesma seção.
 */
const TabsWithUrl = ({ items, defaultValue }: TabsComponentProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const firstTab = defaultValue ?? items.find((item) => !item.disabled)?.value ?? items[0]?.value ?? "";
  const initialTab = searchParams.get("tab");
  const validInitialTab = items.some((item) => item.value === initialTab && !item.disabled) ? initialTab! : firstTab;
  const [activeTab, setActiveTab] = useState(validInitialTab);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (items.some((item) => item.value === tab && !item.disabled)) {
      setActiveTab(tab!);
    }
  }, [items, searchParams]);

  const handleChange = (value: string) => {
    const tab = items.find((item) => item.value === value);
    if (!tab || tab.disabled) return;
    setActiveTab(value);
    const next = new URLSearchParams(searchParams);
    next.set("tab", value);
    setSearchParams(next, { replace: true });
  };

  return (
    <Tabs value={activeTab} onValueChange={handleChange}>
      <TabsList className="overflow-x-auto lg:overflow-hidden">
        {items.map((item) => (
          <TabsTrigger key={item.value} value={item.value} disabled={item.disabled} className={item.disabled ? "cursor-not-allowed opacity-60" : ""}>
            {item.label ?? item.title}
          </TabsTrigger>
        ))}
      </TabsList>
      {items.map((item) => (
        <TabsContent key={item.value} value={item.value} forceMount className="[&[data-state='inactive']]:hidden">
          {item.children}
        </TabsContent>
      ))}
    </Tabs>
  );
};
