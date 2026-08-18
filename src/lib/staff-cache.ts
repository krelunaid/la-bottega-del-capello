import { getStaffProfile, type StaffProfile } from "@/lib/staff-server";

let cached: StaffProfile | null | undefined;
let inflight: Promise<StaffProfile | null> | null = null;

export function staffOnce(): Promise<StaffProfile | null> {
  if (cached !== undefined) return Promise.resolve(cached);
  if (!inflight) {
    inflight = getStaffProfile()
      .then((s) => {
        cached = s;
        return s;
      })
      .catch(() => {
        cached = null;
        return null;
      });
  }
  return inflight;
}

export function clearStaffCache() {
  cached = undefined;
  inflight = null;
}
