import "@tanstack/solid-table";

declare module "@tanstack/solid-table" {
  //This needs to be an interface
  // oxlint-disable-next-line typescript/consistent-type-definitions
  interface ColumnMeta<TData extends RowData, TValue> {
    foo?: string;
    cellMeta?:
      | JSX.HTMLAttributes<HTMLTableCellElement>
      | ((ctx: {
          value: TValue; // the value returned by the accessor
          row: TData; // the original row data
          column: import("@tanstack/solid-table").Column<TData, TValue>;
        }) => JSX.HTMLAttributes<HTMLTableCellElement>);
  }
}
