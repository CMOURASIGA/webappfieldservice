import { cn } from "@/lib/utils";
import TableMobile from "./table-mobile";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type ColumnTableProps = {
  title: string;
  key: string;
  width?: string;
  action?: (row: any) => void;
};

export type DataRow<Columns extends readonly ColumnTableProps[]> = {
  [K in Columns[number]["key"]]: string | number | React.ReactNode;
};

const Table = ({
  data,
  columns,
  onClickColumn,
}: {
  data: DataRow<typeof columns>[];
  columns: ColumnTableProps[];
  onClickColumn?: (key: string) => void;
}) => {
  return (
    <div className="relative">
      <div className="divide-y divide-gray-200 relative hidden lg:block">
        <div className="flex flex-row text-gray-900 text-sm font-semibold bg-gray-50 sticky top-0">
          {columns &&
            columns.length >= 1 &&
            columns?.map((column: ColumnTableProps, index: number) => {
              return (
                <div
                  style={{
                    width: column.width
                      ? String(column.width)
                      : String(100 / columns.length + "%"),
                  }}
                  key={index}
                  className={cn("flex flex-col p-2.5")}
                  onClick={() => {
                    if (onClickColumn) {
                      onClickColumn(column.key);
                    }
                  }}
                >
                  {column.title}
                </div>
              );
            })}
        </div>

        {data?.length > 0 ? (
          data?.map((row, index) => (
            <TableRow key={index} row={row} columns={columns} />
          ))
        ) : (
          <div className="flex justify-center items-center p-4">Sem dados</div>
        )}
      </div>
      <div className="relative">
        <TableMobile
          data={data}
          columns={columns}
          onClickColumn={onClickColumn}
        />
      </div>
    </div>
  );
};

const TableRow = ({
  row,
  columns,
}: {
  row: any;
  columns: ColumnTableProps[];
}) => (
  <div className="flex justify-start align-middle items-center hover:bg-gray-50">
    {columns.map((column) => {
      const value = row[column.key];

      return (
        <div
          style={{
            width: column.width
              ? String(column.width)
              : String(100 / columns.length + "%"),
          }}
          key={column.key}
          className={cn(
            "flex flex-col p-2.5 h-full text-xs font-medium text-left transition-all "
          )}
          onClick={() => {
            if (column?.action) {
              column.action(row.descricao);
            }
          }}
        >
          <span
            className={cn(
              "font-medium",
              column.key == "acoes" && "cursor-pointer"
            )}
          >
            {value}
          </span>
        </div>
      );
    })}
  </div>
);

export default Table;
