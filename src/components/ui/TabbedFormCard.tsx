import React, { useState } from "react";
import { Save } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@cnc-ti/layout-basic";
import { cn } from "../../utils/cn";
import { Button } from "./Button";
import { Card, CardContent, CardFooter } from "./Card";

export type FormTab = {
  value: string;
  label: string;
  content: React.ReactNode;
};

interface TabbedFormCardProps {
  tabs: FormTab[];
  submitLabel: string;
  defaultTab?: string;
  className?: string;
}

/**
 * Estrutura oficial de cadastro CNC: um Card, Tabs reais e uma única ação primária.
 * A página que a usa deve fornecer o PageHeader e o elemento form.
 */
export const TabbedFormCard = ({ tabs, submitLabel, defaultTab, className }: TabbedFormCardProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.value || "");

  return (
    <Card className={cn("overflow-hidden", className)}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* Mantém a apresentação nativa do kit CNC, igual à demonstração. */}
        <TabsList>
          {tabs.map((tab) => <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>)}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
      <CardFooter className="operational-form-actions">
        <Button type="submit" className="ml-auto gap-2">
          <Save className="h-4 w-4" /> {submitLabel}
        </Button>
      </CardFooter>
    </Card>
  );
};
