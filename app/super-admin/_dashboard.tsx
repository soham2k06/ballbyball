"use client";

import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";

import { format } from "date-fns";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import { logout } from "./actions";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Totals {
  users: number;
  matches: number;
  players: number;
  teams: number;
  ballEvents: number;
}

interface MatchItem {
  id: string;
  name: string;
  createdAt: string;
  hasEnded: boolean;
  user: { name: string | null; email: string | null } | null;
}

interface UserItem {
  id: string;
  name: string | null;
  email: string | null;
  createdAt: string;
  lastActive: string | null;
  matchCount: number;
}

type UserSortField =
  | "name"
  | "email"
  | "createdAt"
  | "lastActive"
  | "matchCount";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZES = [10, 25, 50];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return format(new Date(d), "dd MMM yyyy, hh:mm a");
}

function getPageNums(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 2) return [1, 2, 3, "…", total];
  if (current >= total - 3)
    return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}

// Narrow layout has no room for the full sliding window of page numbers,
// so collapse down to first, current, current + 1, and last — e.g.
// selecting page 2 shows "1, 2, 3, …, last". The first and last pages stay
// visible at all times; a "…" fills any gap in between.
function getCompactPageNums(current: number, total: number): (number | "…")[] {
  if (total <= 4) return Array.from({ length: total }, (_, i) => i + 1);

  const page = Math.min(Math.max(current, 1), total);
  const nums = Array.from(
    new Set([1, page, Math.min(page + 1, total), total]),
  ).sort((a, b) => a - b);

  const result: (number | "…")[] = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) result.push("…");
    result.push(n);
  });
  return result;
}

// ─── Skeleton rows ────────────────────────────────────────────────────────────

function UserSkeletonRows() {
  const widths = [
    ["w-24", "w-40", "w-32", "w-32", "w-8", "w-10"],
    ["w-32", "w-48", "w-32", "w-32", "w-6", "w-10"],
    ["w-20", "w-36", "w-32", "w-8", "w-7", "w-10"],
    ["w-28", "w-44", "w-32", "w-32", "w-8", "w-10"],
    ["w-16", "w-40", "w-32", "w-32", "w-6", "w-10"],
    ["w-24", "w-36", "w-32", "w-8", "w-7", "w-10"],
  ];
  return (
    <>
      {widths.map((cols, i) => (
        <tr key={i} className="border-t">
          <td className="px-4 py-3">
            <Skeleton className={`h-4 ${cols[0]}`} />
          </td>
          <td className="px-4 py-3">
            <Skeleton className={`h-4 ${cols[1]}`} />
          </td>
          <td className="px-4 py-3">
            <Skeleton className={`h-4 ${cols[2]}`} />
          </td>
          <td className="px-4 py-3">
            <Skeleton className={`h-4 ${cols[3]}`} />
          </td>
          <td className="px-4 py-3 text-right">
            <Skeleton className={`h-4 ${cols[4]} ml-auto`} />
          </td>
          <td className="px-4 py-3">
            <Skeleton className={`h-4 ${cols[5]}`} />
          </td>
        </tr>
      ))}
    </>
  );
}

function MatchSkeletonRows() {
  const widths = [
    ["w-36", "w-24", "w-32", "w-12"],
    ["w-44", "w-20", "w-32", "w-14"],
    ["w-28", "w-28", "w-32", "w-12"],
    ["w-40", "w-16", "w-32", "w-14"],
    ["w-32", "w-24", "w-32", "w-12"],
    ["w-36", "w-20", "w-32", "w-14"],
  ];
  return (
    <>
      {widths.map((cols, i) => (
        <tr key={i} className="border-t">
          <td className="px-4 py-3">
            <Skeleton className={`h-4 ${cols[0]}`} />
          </td>
          <td className="px-4 py-3">
            <Skeleton className={`h-4 ${cols[1]}`} />
          </td>
          <td className="px-4 py-3">
            <Skeleton className={`h-4 ${cols[2]}`} />
          </td>
          <td className="px-4 py-3">
            <Skeleton className={`h-5 w-14 rounded-full`} />
          </td>
        </tr>
      ))}
    </>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({
  page,
  total,
  limit,
  onPage,
  onLimit,
}: {
  page: number;
  total: number;
  limit: number;
  // eslint-disable-next-line no-unused-vars
  onPage: (p: number) => void;
  // eslint-disable-next-line no-unused-vars
  onLimit: (l: number) => void;
}) {
  const pages = Math.ceil(total / limit);
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const nums = getPageNums(page, pages);
  const compactNums = getCompactPageNums(page, pages);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span>Rows per page</span>
        <select
          value={limit}
          onChange={(e) => {
            onLimit(Number(e.target.value));
            onPage(1);
          }}
          className="rounded border bg-background px-1.5 py-0.5 text-xs text-foreground"
        >
          {PAGE_SIZES.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <span>
          {from}–{to} of {total.toLocaleString()}
        </span>
      </div>

      {pages > 1 && (
        <>
          <div className="flex items-center gap-1 sm:hidden">
            <PageBtn onClick={() => onPage(page - 1)} disabled={page <= 1}>
              Prev
            </PageBtn>
            {compactNums.map((n, i) =>
              n === "…" ? (
                <span key={`ce${i}`} className="px-1 text-muted-foreground">
                  …
                </span>
              ) : (
                <PageBtn
                  key={n}
                  onClick={() => onPage(n as number)}
                  active={n === page}
                >
                  {n}
                </PageBtn>
              ),
            )}
            <PageBtn onClick={() => onPage(page + 1)} disabled={page >= pages}>
              Next
            </PageBtn>
          </div>
          <div className="hidden items-center gap-1 sm:flex">
            <PageBtn onClick={() => onPage(page - 1)} disabled={page <= 1}>
              Prev
            </PageBtn>
            {nums.map((n, i) =>
              n === "…" ? (
                <span key={`e${i}`} className="px-1 text-muted-foreground">
                  …
                </span>
              ) : (
                <PageBtn
                  key={n}
                  onClick={() => onPage(n as number)}
                  active={n === page}
                >
                  {n}
                </PageBtn>
              ),
            )}
            <PageBtn onClick={() => onPage(page + 1)} disabled={page >= pages}>
              Next
            </PageBtn>
          </div>
        </>
      )}
    </div>
  );
}

function PageBtn({
  children,
  onClick,
  disabled,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`h-7 min-w-[30px] rounded border px-2 text-xs transition-colors
        ${active ? "border-primary bg-primary text-primary-foreground" : "border-transparent hover:bg-muted"}
        disabled:cursor-not-allowed disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

// ─── Sortable TH ─────────────────────────────────────────────────────────────

function SortTh({
  label,
  field,
  sort,
  order,
  onSort,
  right,
}: {
  label: string;
  field: UserSortField;
  sort: string;
  order: string;
  // eslint-disable-next-line no-unused-vars
  onSort: (f: UserSortField) => void;
  right?: boolean;
}) {
  const active = field === sort;
  return (
    <th
      onClick={() => onSort(field)}
      className={`cursor-pointer select-none whitespace-nowrap px-4 py-2.5 font-medium text-muted-foreground hover:text-foreground ${right ? "text-right" : "text-left"}`}
    >
      {label}{" "}
      <span className="text-xs">
        {active ? (order === "desc" ? "↓" : "↑") : "↕"}
      </span>
    </th>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const router = useRouter();

  const [totals, setTotals] = useState<Totals | null>(null);

  const [userPage, setUserPage] = useQueryState(
    "up",
    parseAsInteger.withOptions({ history: "replace" }).withDefault(1),
  );
  const [userLimit, setUserLimit] = useQueryState(
    "ul",
    parseAsInteger.withOptions({ history: "replace" }).withDefault(10),
  );
  const [search, setSearch] = useQueryState(
    "q",
    parseAsString.withOptions({ history: "replace" }).withDefault(""),
  );
  const [userSort, setUserSort] = useQueryState(
    "us",
    parseAsString.withOptions({ history: "replace" }).withDefault("createdAt"),
  );
  const [userOrder, setUserOrder] = useQueryState(
    "uo",
    parseAsString.withOptions({ history: "replace" }).withDefault("desc"),
  );
  const [matchPage, setMatchPage] = useQueryState(
    "mp",
    parseAsInteger.withOptions({ history: "replace" }).withDefault(1),
  );
  const [matchLimit, setMatchLimit] = useQueryState(
    "ml",
    parseAsInteger.withOptions({ history: "replace" }).withDefault(10),
  );

  const [users, setUsers] = useState<UserItem[]>([]);
  const [userTotal, setUserTotal] = useState(0);
  const [userLoading, setUserLoading] = useState(true);

  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [matchTotal, setMatchTotal] = useState(0);
  const [matchLoading, setMatchLoading] = useState(true);

  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput || null);
      setUserPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput, setSearch, setUserPage]);

  async function apiFetch(url: string) {
    const res = await fetch(url);
    if (res.status === 401) {
      router.refresh();
      return null;
    }
    return res.json();
  }

  useEffect(() => {
    apiFetch("/api/super-admin").then((d) => d && setTotals(d.totals));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setUserLoading(true);
    const params = new URLSearchParams({
      page: String(userPage),
      limit: String(userLimit),
      search,
      sort: userSort,
      order: userOrder,
    });
    apiFetch(`/api/super-admin/users?${params}`)
      .then((d) => d && (setUsers(d.users), setUserTotal(d.total)))
      .finally(() => setUserLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPage, userLimit, search, userSort, userOrder]);

  useEffect(() => {
    setMatchLoading(true);
    apiFetch(`/api/super-admin/matches?page=${matchPage}&limit=${matchLimit}`)
      .then((d) => d && (setMatches(d.matches), setMatchTotal(d.total)))
      .finally(() => setMatchLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchPage, matchLimit]);

  function handleUserSort(field: UserSortField) {
    if (field === userSort) {
      setUserOrder(userOrder === "desc" ? "asc" : "desc");
    } else {
      setUserSort(field);
      setUserOrder("desc");
    }
    setUserPage(1);
  }

  async function handleLogout() {
    await logout();
    router.refresh();
  }

  // initial load states
  const usersInitial = userLoading && users.length === 0;
  const matchesInitial = matchLoading && matches.length === 0;

  return (
    <div className="mx-auto min-h-screen max-w-6xl space-y-10 bg-background p-6 md:p-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Super Admin</h1>
        <button
          onClick={handleLogout}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Logout
        </button>
      </div>

      {/* Overview */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Overview
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {totals
            ? (
                [
                  { label: "Users", value: totals.users },
                  { label: "Matches", value: totals.matches },
                  { label: "Players", value: totals.players },
                  { label: "Teams", value: totals.teams },
                  { label: "Ball Events", value: totals.ballEvents },
                ] as const
              ).map(({ label, value }) => (
                <div
                  key={label}
                  className="flex flex-col gap-1 rounded-xl border p-4"
                >
                  <span className="text-2xl font-bold">
                    {value.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              ))
            : Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-3 rounded-xl border p-4"
                >
                  <Skeleton className="h-7 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              ))}
        </div>
      </section>

      {/* Users */}
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Users{" "}
            <span className="font-normal normal-case">
              {usersInitial ? (
                <Skeleton className="inline-block h-3 w-6 align-middle" />
              ) : (
                `(${userTotal.toLocaleString()})`
              )}
            </span>
          </h2>
          <Input
            type="search"
            placeholder="Search name or email…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-64"
          />
        </div>
        <div
          className={`overflow-hidden rounded-xl border transition-opacity ${userLoading && !usersInitial ? "opacity-50" : ""}`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <SortTh
                    label="Name"
                    field="name"
                    sort={userSort}
                    order={userOrder}
                    onSort={handleUserSort}
                  />
                  <SortTh
                    label="Email"
                    field="email"
                    sort={userSort}
                    order={userOrder}
                    onSort={handleUserSort}
                  />
                  <SortTh
                    label="Signed Up"
                    field="createdAt"
                    sort={userSort}
                    order={userOrder}
                    onSort={handleUserSort}
                  />
                  <SortTh
                    label="Last Active"
                    field="lastActive"
                    sort={userSort}
                    order={userOrder}
                    onSort={handleUserSort}
                  />
                  <SortTh
                    label="Matches"
                    field="matchCount"
                    sort={userSort}
                    order={userOrder}
                    onSort={handleUserSort}
                    right
                  />
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {usersInitial ? (
                  <UserSkeletonRows />
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-muted-foreground"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="border-t hover:bg-muted/20">
                      <td className="whitespace-nowrap px-4 py-2.5 font-medium">
                        {u.name ?? (
                          <span className="italic text-muted-foreground">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {u.email}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-muted-foreground">
                        {fmtDate(u.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-muted-foreground">
                        {u.lastActive ? (
                          fmtDate(u.lastActive)
                        ) : (
                          <span className="italic">Never</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono">
                        {u.matchCount}
                      </td>
                      <td className="px-4 py-2.5">
                        <a
                          href={`/?user=${u.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="whitespace-nowrap text-xs text-muted-foreground transition-colors hover:text-foreground"
                        >
                          View →
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {!usersInitial && (
            <Pagination
              page={userPage}
              total={userTotal}
              limit={userLimit}
              onPage={setUserPage}
              onLimit={setUserLimit}
            />
          )}
        </div>
      </section>

      {/* Matches */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Matches{" "}
          <span className="font-normal normal-case">
            {matchesInitial ? (
              <Skeleton className="inline-block h-3 w-6 align-middle" />
            ) : (
              `(${matchTotal.toLocaleString()})`
            )}
          </span>
        </h2>
        <div
          className={`overflow-hidden rounded-xl border transition-opacity ${matchLoading && !matchesInitial ? "opacity-50" : ""}`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                    Match
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                    User
                  </th>
                  <th className="whitespace-nowrap px-4 py-2.5 text-left font-medium text-muted-foreground">
                    Created
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {matchesInitial ? (
                  <MatchSkeletonRows />
                ) : (
                  matches.map((m) => (
                    <tr key={m.id} className="border-t hover:bg-muted/20">
                      <td className="px-4 py-2.5 font-medium">{m.name}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {m.user?.name ?? m.user?.email ?? (
                          <span className="italic">Unknown</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-muted-foreground">
                        {fmtDate(m.createdAt)}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            m.hasEnded
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          }`}
                        >
                          {m.hasEnded ? "Ended" : "Live"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {!matchesInitial && (
            <Pagination
              page={matchPage}
              total={matchTotal}
              limit={matchLimit}
              onPage={setMatchPage}
              onLimit={setMatchLimit}
            />
          )}
        </div>
      </section>
    </div>
  );
}
