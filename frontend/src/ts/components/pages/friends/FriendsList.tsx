import { PersonalBest } from "@monkeytype/schemas/shared";
import { Friend } from "@monkeytype/schemas/users";
import { isSafeNumber } from "@monkeytype/util/numbers";
import { ColumnDef } from "@tanstack/solid-table";
import { format as dateFormat } from "date-fns/format";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { formatDuration } from "date-fns/formatDuration";
import { intervalToDuration } from "date-fns/intervalToDuration";
import { createMemo, createResource, JSXElement } from "solid-js";

import Ape from "../../../ape";
import { getHTMLById } from "../../../controllers/badge-controller";
import { getHtmlByUserFlags } from "../../../controllers/user-flag-controller";
import { getActivePage } from "../../../signals/core";
import { secondsToString } from "../../../utils/date-and-time";
import Format from "../../../utils/format";
import { getXpDetails } from "../../../utils/levels";
import { getLanguageDisplayString } from "../../../utils/strings";
import AsyncContent from "../../common/AsyncContent";
import { DataTable } from "../../ui/DataTable";

const columns: ColumnDef<Friend>[] = [
  {
    accessorFn: (row) => row,
    header: "name",
    cell: (props) => {
      const formatted = createMemo(() => {
        const entry = props.getValue() as Friend;
        return (
          <div class="avatarNameBadge">
            <div class="avatarPlaceholder"></div>
            <a
              href={`${location.origin}/profile/${entry.uid}?isUid`}
              class="entryName"
              data-uid={entry.uid}
              // oxlint-disable-next-line react/no-unknown-property
              router-link
            >
              {entry.name}
            </a>
            <div class="flagsAndBadge">
              {getHtmlByUserFlags(entry)}
              {isSafeNumber(entry.badgeId) ? getHTMLById(entry.badgeId) : ""}
            </div>
          </div>
        );
      });
      return formatted();
    },
  },
  {
    accessorKey: "lastModified",
    header: "friends for",
    cell: (props) => {
      const formatted = createMemo(() => {
        const lastModified: number = props.row.getValue("lastModified");
        return lastModified !== undefined
          ? formatAge(lastModified, "short")
          : "-";
      });
      return formatted();
    },
  },
  {
    accessorKey: "xp",
    header: "level",
    cell: (props) => {
      const formatted = createMemo(() =>
        getXpDetails(props.row.getValue("xp") ?? 0),
      );

      return formatted().level;
    },
  },
  {
    accessorFn: (row: Friend) => ({
      completed: row.completedTests ?? 0,
      started: row.startedTests ?? 0,
    }),
    header: "tests",
    cell: (props) => {
      const { completed, started } = props.getValue() as {
        completed: number;
        started: number;
      };
      return `${completed} / ${started}`;
    },
  },
  {
    accessorKey: "timeTyping",
    header: "time typing",
    cell: (props) => {
      const formatted = createMemo(() =>
        secondsToString(
          Math.round(props.row.getValue("timeTyping") ?? 0),
          true,
          true,
        ),
      );

      return formatted();
    },
  },
  {
    id: "streak",
    header: "Streak",
    accessorFn: (row) => row.streak.length,
    cell: (info) => formatStreak(info.getValue() as number),
  },
  {
    accessorFn: (row) => row.top15,
    header: "time 15 pb",
    cell: (props) => {
      const formatted = createMemo(
        () => formatPb(props.getValue() as PersonalBest)?.wpm ?? "-",
      );
      return formatted();
    },
  },
  {
    accessorFn: (row) => row.top60,
    header: "time 60 pb",
    cell: (props) => {
      const formatted = createMemo(
        () => formatPb(props.getValue() as PersonalBest)?.wpm ?? "-",
      );
      return formatted();
    },
  },
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
