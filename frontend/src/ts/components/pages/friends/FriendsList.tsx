import { PersonalBest } from "@monkeytype/schemas/shared";
import { Friend } from "@monkeytype/schemas/users";
import { isSafeNumber } from "@monkeytype/util/numbers";
import { createColumnHelper } from "@tanstack/solid-table";
import { format as dateFormat } from "date-fns/format";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { formatDuration } from "date-fns/formatDuration";
import { intervalToDuration } from "date-fns/intervalToDuration";
import { createResource, JSXElement } from "solid-js";

import Ape from "../../../ape";
import { getActivePage } from "../../../signals/core";
import Format from "../../../utils/format";
import { getLanguageDisplayString } from "../../../utils/strings";
import AsyncContent from "../../common/AsyncContent";
import { DataTable } from "../../ui/table/DataTable";
import { TableColumnHeader } from "../../ui/table/TableColumnHeader";

const columnHelper = createColumnHelper<Friend>();
const columns = [
  columnHelper.accessor("name", {
    header: (props) => <TableColumnHeader column={props.column} title="name" />,
    cell: (info) => info.getValue(),
  }),

  columnHelper.accessor("lastModified", {
    header: (props) => (
      <TableColumnHeader column={props.column} title="friends for" />
    ),
    enableSorting: true,
    cell: (info) => {
      const value = info.getValue();
      return value === undefined ? "-" : formatAge(value, "short");
    },
    meta: {
      // @ts-expect-error huh?
      cellMeta: ({ value }) => {
        return value === undefined
          ? {}
          : {
              "data-balloon-pos": "down",
              "aria-label": `since ${dateFormat(value, "dd MMM yyy HH:mm")}`,
            };
      },
    },
  }),
];

export function FriendsList(): JSXElement {
  const isOpen = (): boolean => getActivePage() === "about";
  const [friendsListResource] = createResource(isOpen, async (open) => {
    if (!open) return [];
    const response = await Ape.users.getFriends();
    if (response.status !== 200) {
      throw new Error(response.body.message);
    }
    return response.body.data;
  });

  return (
    <>
      <h2>Friends</h2>
      <AsyncContent resource={friendsListResource}>
        {(data) => <DataTable columns={columns} data={data} />}
      </AsyncContent>
    </>
  );
}

function formatAge(
  timestamp: number | undefined,
  format?: "short" | "full",
): string {
  if (timestamp === undefined) return "";
  let formatted = "";
  const duration = intervalToDuration({ start: timestamp, end: Date.now() });

  if (format === undefined || format === "full") {
    formatted = formatDuration(duration, {
      format: ["years", "months", "days", "hours", "minutes"],
    });
  } else {
    formatted = formatDistanceToNow(timestamp);
  }

  return formatted !== "" ? formatted : "less then a minute";
}

function formatStreak(length?: number, prefix?: string): string {
  if (length === 1) return "-";
  return isSafeNumber(length)
    ? `${prefix !== undefined ? prefix + " " : ""}${length} days`
    : "-";
}

function formatPb(entry?: PersonalBest):
  | {
      wpm: string;
      acc: string;
      raw: string;
      con: string;
      details: string;
    }
  | undefined {
  if (entry === undefined) {
    return undefined;
  }
  const result = {
    wpm: Format.typingSpeed(entry.wpm, { showDecimalPlaces: true }),
    acc: Format.percentage(entry.acc, { showDecimalPlaces: true }),
    raw: Format.typingSpeed(entry.raw, { showDecimalPlaces: true }),
    con: Format.percentage(entry.consistency, { showDecimalPlaces: true }),
    details: "",
  };

  const details = [
    `${getLanguageDisplayString(entry.language)}`,
    `${result.wpm} wpm`,
  ];

  if (isSafeNumber(entry.acc)) {
    details.push(`${result.acc} acc`);
  }
  if (isSafeNumber(entry.raw)) {
    details.push(`${result.raw} raw`);
  }
  if (isSafeNumber(entry.consistency)) {
    details.push(`${result.con} con`);
  }
  if (isSafeNumber(entry.timestamp)) {
    details.push(`${dateFormat(entry.timestamp, "dd MMM yyyy")}`);
  }

  result.details = details.join("\n");

  return result;
}
