/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from "@/lib/utils";
import { ColumnTableProps, DataRow } from "./table";

export default function TableMobile({
  data,
  columns,
  onClickColumn,
}: {
  data: DataRow<typeof columns>[];
  columns: ColumnTableProps[];
  onClickColumn?: (key: string) => void;
}) {
  return (
    <div className="lg:hidden relative mb-10">
      <Header columns={columns} onClickColumn={onClickColumn} />

      {data?.length > 0 ? (
        data?.map((row: any, index: any) => {
          return (
            <div key={index}>
              <div className="flex flex-row w-full text-md font-semibold bg-gray-100 items-center justify-center py-4 sticky top-16 shadow-sm">
                {row.subGroup}
              </div>

              <div className="flex flex-row justify-between text-gray-900 text-sm font-semibold">
                {columns
                  .filter((column) => column.key !== "subGroup")
                  .map((column, colIndex) => {
                    const value = row[column.key];
                    return (
                      <div
                        key={colIndex}
                        onClick={() => {
                          if (column?.action) {
                            column.action({
                              year: column.key,
                              rowId: row.rowId,
                            });
                          }
                        }}
                        className={cn(
                          "flex w-full flex-col py-6 items-center cursor-pointer hover:bg-blue-50"
                        )}
                      >
                        <span className={cn("font-medium")}>{value}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })
      ) : (
        <div className="flex justify-center items-center p-4">Sem dados</div>
      )}
    </div>
  );
}

const Header = ({ columns, yearBaseSelected, onClickColumn }: any) => {
  return (
    <div className="flex flex-row justify-between text-gray-900 text-sm font-semibold shadow-md sticky top-0 z-20 bg-white">
      {columns
        ?.filter((column: ColumnTableProps) => column.key !== "subGroup")
        .map((column: ColumnTableProps, index: number) => {
          const isBase = column.key === yearBaseSelected;

          return (
            <div
              key={index}
              className={cn(
                "flex w-full flex-col py-6 items-center cursor-pointer hover:bg-blue-50",
                isBase && "bg-blue-100"
              )}
              onClick={() => {
                onClickColumn(column.key);
              }}
            >
              <span>{column.title}</span>
            </div>
          );
        })}
    </div>
  );
};
