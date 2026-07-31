import cn from "classnames";
import TableMobile from "./table-mobile";

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
  yearBaseSelected,
  onClickColumn,
}: {
  data: DataRow<typeof columns>[];
  columns: ColumnTableProps[];
  yearBaseSelected: string;
  onClickColumn: (key: string) => void;
}) => {
  return (
    <div className="relative">
      <div className="divide-y divide-gray-200 relative hidden lg:block">
        <div className="flex flex-row text-gray-900 text-sm font-semibold bg-gray-50 sticky top-0">
          {columns &&
            columns.length >= 1 &&
            columns?.map((column: ColumnTableProps, index: number) => {
              const isBase = column.key === yearBaseSelected;
              const isInteractive = column.key !== "subGroup";
              return (
                <div
                  style={{
                    width: column.width
                      ? String(column.width)
                      : String(100 / columns.length + "%"),
                  }}
                  key={index}
                  className={cn(
                    "flex flex-col py-2.5",
                    isBase && "bg-blue-100",
                    isInteractive &&
                    "items-center cursor-pointer hover:bg-blue-50"
                  )}
                  onClick={() => {
                    if (isInteractive) {
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
            <TableRow
              key={index}
              row={row}
              columns={columns}
              base={yearBaseSelected}
            />
          ))
        ) : (
          <div className="flex justify-center items-center p-4">Sem dados</div>
        )}
      </div>
      <div className="relative">
        <TableMobile
          data={data}
          columns={columns}
          yearBaseSelected={yearBaseSelected}
          onClickColumn={onClickColumn}
        />
      </div>
    </div>
  );
};

const TableRow = ({
  row,
  columns,
  base,
}: {
  row: any;
  columns: ColumnTableProps[];
  base: string;
}) => (
  <div className="flex justify-start align-middle items-center hover:bg-gray-50">
    {columns.map((column) => {
      const isBase = column.key === base;
      const isInteractive = column.key !== "subGroup";
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
            "flex flex-col py-2.5 h-full text-xs font-medium text-left transition-all ",
            isBase && "bg-blue-100 items-center",
            isInteractive &&
            !isBase &&
            "items-center cursor-pointer hover:bg-gray-100",

          )}
          onClick={() => {
            if (isInteractive && column?.action && !isBase && value !== "0") {
              column.action({ year: column.key, rowId: row.rowId });
            }
          }}
        >
          <span
            className={cn(
              "text-blue-800",
              {
                "text-green-600 font-medium":
                  typeof value === "string" && value.startsWith("+"),
                "text-red-600 font-medium":
                  typeof value === "string" && value.startsWith("-"),
              },
              isBase && "font-bold"
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
