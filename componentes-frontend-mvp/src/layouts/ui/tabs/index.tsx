import { Tabs, TabsContent, TabsList, TabsTrigger } from "@cnc-ti/layout-basic";
type TabItem = {
  value: string;
  title: string;
  label: React.ReactNode;
  children: React.ReactNode;
};

type TabsComponentProps = {
  items: TabItem[];
  defaultValue?: string;
};

export const TabsComponent: React.FC<TabsComponentProps> = ({
  items,
  defaultValue,
}) => {
  return (
    <Tabs defaultValue={defaultValue ?? items[0].value}>
      <TabsList>
        {items.map((item, index) => {
          return (
            <TabsTrigger value={item.value} key={index}>
              {item.label ? item.label : item.title}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {items.map((item, index) => {
        return (
          <TabsContent value={item.value} key={index}>
            {item.children}
          </TabsContent>
        );
      })}
    </Tabs>
  );
};
