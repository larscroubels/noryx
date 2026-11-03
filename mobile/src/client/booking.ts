import type { DaySlot } from "@/lib/booking/slots";

/** The booking steps of the website's booking page, as a pure state machine. */
export type BookingState = {
  step: "service" | "staff" | "time" | "confirm" | "done";
  serviceId: string | null;
  staffId: string | null;
  date: string;
  slot: DaySlot | null;
  note: string;
  message: string | null;
  /** Bumped when the times must be loaded again (e.g. the slot was just taken). */
  reloadTimes: number;
  result: "pending" | "confirmed" | null;
};

export type BookingAction =
  | { type: "service"; serviceId: string }
  | { type: "staff"; staffId: string }
  | { type: "date"; date: string }
  | { type: "slot"; slot: DaySlot }
  | { type: "note"; note: string }
  | { type: "back" }
  | { type: "failed"; error: string; message: string }
  | { type: "booked"; status: string };

/** Errors after which the chosen time can't be used and fresh times are needed. */
const TIME_ERRORS = new Set([
  "slot_unavailable",
  "outside_booking_window",
  "invalid_slot",
  "23P01",
]);

const BACK: Record<BookingState["step"], BookingState["step"]> = {
  service: "service",
  staff: "service",
  time: "staff",
  confirm: "time",
  done: "done",
};

export function initialBooking(date: string): BookingState {
  return {
    step: "service",
    serviceId: null,
    staffId: null,
    date,
    slot: null,
    note: "",
    message: null,
    reloadTimes: 0,
    result: null,
  };
}

export function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case "service":
      return { ...state, step: "staff", serviceId: action.serviceId, slot: null, message: null };
    case "staff":
      return { ...state, step: "time", staffId: action.staffId, slot: null, message: null };
    case "date":
      return { ...state, date: action.date, slot: null, message: null };
    case "slot":
      return { ...state, step: "confirm", slot: action.slot, message: null };
    case "note":
      return { ...state, note: action.note };
    case "back":
      return { ...state, step: BACK[state.step], message: null };
    case "failed":
      return TIME_ERRORS.has(action.error)
        ? {
            ...state,
            step: "time",
            slot: null,
            message: action.message,
            reloadTimes: state.reloadTimes + 1,
          }
        : { ...state, message: action.message };
    case "booked":
      return {
        ...state,
        step: "done",
        result: action.status === "pending" ? "pending" : "confirmed",
        message: null,
      };
  }
}
