import "@tanstack/table-core";

declare module "@tanstack/solid-table" {
  type ColumnMeta<TData extends RowData, TValue> = {
    cellMeta?:
      | JSX.HTMLAttributes<HTMLTableCellElement>
      | ((ctx: {
          value: TValue;
          ///row: any;
          //column: any;
        }) => JSX.HTMLAttributes<HTMLTableCellElement>);
  };
}
