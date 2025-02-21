import { format, parseISO } from "date-fns";

export function formatDateTime(dateTime: string): string {
  const date = parseISO(dateTime);
  return format(date, "yyyy MMM dd, hh:mm a");
}
