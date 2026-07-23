"use client";

import { useEffect, useState } from "react";
import { useQueryString } from "@/hooks/use-query-params";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@cnc-ti/layout-basic";

type TabItem = {
  value: string;
  title: string;
  label?: React.ReactNode;
  children: React.ReactNode;
  disabled?: boolean;
};

type TabsComponentProps = {
  items: TabItem[];
};

export const TabsComponent: React.FC<TabsComponentProps> = ({ items }) => {
  const { updateQueryParams, getAllQueryStrings } = useQueryString();
  const firstEnabledTab =
    items.find((item) => !item.disabled)?.value ?? items[0].value;

  const [activeTab, setActiveTab] = useState<string>(firstEnabledTab);

  useEffect(() => {
    const { tab } = getAllQueryStrings();
    const tabFromQuery = items.find((item) => item.value === tab);
    if (tabFromQuery && !tabFromQuery.disabled) {
      setActiveTab(tabFromQuery.value);
    } else {
      setActiveTab(firstEnabledTab);
      updateQueryParams({ tab: firstEnabledTab }, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTabChange = (value: string) => {
    const selected = items.find((item) => item.value === value);
    if (selected?.disabled) return;
    setActiveTab(value);
    updateQueryParams({ tab: value }, true);
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList className="overflow-scroll lg:overflow-hidden">
        {items.map((item) => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            className={item.disabled ? "cursor-not-allowed opacity-60" : ""}
          >
            {item.label ?? item.title}
          </TabsTrigger>
        ))}
      </TabsList>

      {items.map((item) => (
        <TabsContent
          key={item.value}
          value={item.value}
          forceMount
          className="[&[data-state='inactive']]:hidden"
        >
          {item.children}
        </TabsContent>
      ))}
    </Tabs>
  );
};
