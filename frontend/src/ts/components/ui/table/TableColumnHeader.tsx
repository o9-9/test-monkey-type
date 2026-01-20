import { Column } from "@tanstack/solid-table";
import {
  ComponentProps,
  JSXElement,
  Match,
  Show,
  splitProps,
  Switch,
} from "solid-js";

import { cn } from "../../../utils/cn";

type TableColumnHeaderProps<TData, TValue> = ComponentProps<"button"> & {
  column: Column<TData, TValue>;
  title: string;
};

export function TableColumnHeader<TData, TValue>(
  props: TableColumnHeaderProps<TData, TValue>,
): JSXElement {
  const [local, others] = splitProps(props, ["column", "title", "class"]);

  return (
    <Show when={local.column.getCanSort()} fallback={local.title}>
      <button
        type="button"
        role="button"
        onClick={local.column.getToggleSortingHandler()}
        class={cn(
          "flex h-full w-full cursor-pointer items-center justify-between bg-transparent text-left hover:bg-green-300",
          local.class,
        )}
        {...others}
      >
        {local.title}

        <Switch>
          <Match when={local.column.getIsSorted() === "asc"}>
            <i class="fas fa-sort-up" aria-hidden="true"></i>
          </Match>
          <Match when={local.column.getIsSorted() === "desc"}>
            <i class="fas fa-sort-down" aria-hidden="true"></i>
          </Match>
        </Switch>
      </button>
    </Show>
  );
}
