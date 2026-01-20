import "@tanstack/solid-table"; //or vue, svelte, solid, qwik, etc.

declare module "@tanstack/solid-table" {
  type ColumnMeta<TData extends RowData, TValue> = {
    foo?: string;
    cellMeta?:
      | JSX.HTMLAttributes<HTMLTableCellElement>
      | ((ctx: {
          value: TValue; // the value returned by the accessor
          row: TData; // the original row data
          column: import("@tanstack/solid-table").Column<TData, TValue>;
        }) => JSX.HTMLAttributes<HTMLTableCellElement>);
  };
}
