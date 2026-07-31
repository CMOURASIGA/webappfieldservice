import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@cnc-ti/layout-basic";
import { cn } from "../../utils/cn";
import { Button } from "./Button";
import { Card, CardFooter } from "./Card";

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

export const TabbedFormCard = ({ tabs, submitLabel, defaultTab, className }: TabbedFormCardProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.value || "");

  return (
    <Card className={cn("overflow-hidden", className)}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
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
        <Button type="submit" className="save-action-button ml-auto">
          {submitLabel}
        </Button>
      </CardFooter>
    </Card>
  );
};
