import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@cnc-ti/layout-basic";

export type TabItem = {
  value: string;
  title: string;
  children: React.ReactNode;
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
  <Tabs defaultValue={defaultValue ?? items[0]?.value}>
    <TabsList>
      {items.map((item) => (
        <TabsTrigger value={item.value} key={item.value}>
          {item.title}
        </TabsTrigger>
      ))}
    </TabsList>
    {items.map((item) => (
      <TabsContent value={item.value} key={item.value}>
        {item.children}
      </TabsContent>
    ))}
  </Tabs>
);
