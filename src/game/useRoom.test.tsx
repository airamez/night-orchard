import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { newLobby, addPlayer } from "./engine";

const mocks = vi.hoisted(() => ({ read: vi.fn(), update: undefined as undefined | ((payload: { new: unknown }) => void) }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: mocks.read }) }) }),
    channel: () => ({ on: (_event: string, _filter: unknown, callback: typeof mocks.update) => {
      mocks.update = callback;
      return { subscribe: () => ({}) };
    } }),
    removeChannel: vi.fn(),
  },
}));
import { clearSeat, loadSeat, saveSeat, useRoom } from "./useRoom";

beforeEach(() => { sessionStorage.clear(); localStorage.clear(); mocks.read.mockReset(); });
afterEach(cleanup);

describe("window player seats", () => {
  it("keeps this window's player separate from shared incognito storage", () => {
    localStorage.setItem("night-orchard:seat:ABCD", JSON.stringify({ token: "other-token", seatId: "other-player" }));
    expect(loadSeat("ABCD")).toBeNull();
    saveSeat("abcd", { token: "my-token", seatId: "jose" });
    expect(loadSeat("ABCD")?.seatId).toBe("jose");
    clearSeat("ABCD");
    expect(loadSeat("ABCD")).toBeNull();
    expect(localStorage.getItem("night-orchard:seat:ABCD")).toContain("other-player");
  });
});

describe("room synchronization", () => {
  it("refreshes the roster to include a newly joined player", async () => {
    const lobby = newLobby("jose", "Jose");
    mocks.read.mockResolvedValueOnce({ data: { state: lobby, updated_at: "2026-10-25T01:00:00Z" } });
    const { result } = renderHook(() => useRoom("ABCD"));
    await waitFor(() => expect(result.current.state?.players).toHaveLength(1));
    mocks.read.mockResolvedValueOnce({ data: { state: addPlayer(lobby, "leila", "Leila"), updated_at: "2026-10-25T01:00:01Z" } });
    await act(async () => { await result.current.refetch(); });
    expect(result.current.state?.players.map((p) => p.id)).toEqual(["jose", "leila"]);
  });

  it("does not remove a new player when an older read arrives after Realtime", async () => {
    const lobby = newLobby("jose", "Jose");
    let finish: ((value: unknown) => void) | undefined;
    mocks.read.mockReturnValueOnce(new Promise((resolve) => { finish = resolve; }));
    const { result } = renderHook(() => useRoom("ABCD"));
    act(() => { mocks.update?.({ new: { state: addPlayer(lobby, "leila", "Leila"), updated_at: "2026-10-25T01:00:01Z" } }); });
    await act(async () => { finish?.({ data: { state: lobby, updated_at: "2026-10-25T01:00:00Z" } }); });
    expect(result.current.state?.players.map((p) => p.id)).toEqual(["jose", "leila"]);
  });

  it("still accepts a real removal in a newer snapshot", async () => {
    const lobby = newLobby("jose", "Jose");
    mocks.read.mockResolvedValueOnce({ data: { state: addPlayer(lobby, "leila", "Leila"), updated_at: "2026-10-25T01:00:00Z" } });
    const { result } = renderHook(() => useRoom("ABCD"));
    await waitFor(() => expect(result.current.state?.players).toHaveLength(2));
    act(() => { mocks.update?.({ new: { state: lobby, updated_at: "2026-10-25T01:00:01Z" } }); });
    expect(result.current.state?.players.map((p) => p.id)).toEqual(["jose"]);
  });
});