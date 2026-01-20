import "@tanstack/solid-table";
import type { JSX } from "solid-js";

declare module "@tanstack/solid-table" {
  //This needs to be an interface
  // oxlint-disable-next-line typescript/consistent-type-definitions
  interface ColumnMeta<TData extends RowData, TValue> {
    cellMeta?:
      | JSX.HTMLAttributes<HTMLTableCellElement>
      | ((ctx: {
          value: TValue;
          row: TData;
        }) => JSX.HTMLAttributes<HTMLTableCellElement>);
  }
}
