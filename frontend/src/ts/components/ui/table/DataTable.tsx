import {
  ColumnDef,
  createSolidTable,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
} from "@tanstack/solid-table";
import { createSignal, For, JSXElement, Show } from "solid-js";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./Table";

type DataTableProps<TData> = {
  // oxlint-disable-next-line typescript/no-explicit-any
  columns: ColumnDef<TData, any>[];
  data: TData[];
};

export function DataTable<TData>(props: DataTableProps<TData>): JSXElement {
  const [sorting, setSorting] = createSignal<SortingState>([]);
  const table = createSolidTable({
    get data() {
      return props.data;
    },
    get columns() {
      return props.columns;
    },
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      get sorting() {
        return sorting();
      },
    },
  });

  return (
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <For each={table.getHeaderGroups()}>
            {(headerGroup) => (
              <TableRow>
                <For each={headerGroup.headers}>
                  {(header) => (
                    <TableHead
                      colSpan={header.colSpan}
                      aria-sort={
                        header.column.getIsSorted() === "asc"
                          ? "ascending"
                          : header.column.getIsSorted() === "desc"
                            ? "descending"
                            : "none"
                      }
                    >
                      <Show when={!header.isPlaceholder}>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </Show>
                    </TableHead>
                  )}
                </For>
              </TableRow>
            )}
          </For>
        </TableHeader>
        <TableBody>
          <Show
            when={table.getRowModel().rows?.length}
            fallback={
              <TableRow>
                <TableCell
                  colSpan={props.columns.length}
                  class="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            }
          >
            <For each={table.getRowModel().rows}>
              {(row) => (
                <TableRow data-state={row.getIsSelected() && "selected"}>
                  <For each={row.getVisibleCells()}>
                    {(cell) => {
                      // oxlint-disable-next-line typescript/no-unsafe-assignment
                      const cellMeta =
                        cell.column.columnDef.meta?.cellMeta === undefined
                          ? {}
                          : typeof cell.column.columnDef.meta?.cellMeta ===
                              "function"
                            ? // oxlint-disable-next-line typescript/no-unsafe-call
                              cell.column.columnDef.meta.cellMeta({
                                value: cell.getValue(),
                                row: cell.row,
                                column: cell.column,
                              })
                            : cell.column.columnDef.meta?.cellMeta;

                      return (
                        <TableCell {...cellMeta}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      );
                    }}
                  </For>
                </TableRow>
              )}
            </For>
          </Show>
        </TableBody>
      </Table>
    </div>
  );
}
