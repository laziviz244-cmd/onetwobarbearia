import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BookingPage from "./BookingPage";

const fullVisibleSlots = [
  "14:00", "14:30", "15:00", "15:30", "16:00",
  "16:30", "17:00", "17:30", "18:00", "18:30",
];

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            order: async () => ({
              data: table === "appointments"
                ? fullVisibleSlots.map((time) => ({ time }))
                : [],
            }),
          }),
          single: async () => ({
            data: {
              value: {
                monday: { open: "08:00", close: "19:00", enabled: true },
                tuesday: { open: "08:00", close: "19:00", enabled: true },
                wednesday: { open: "08:00", close: "19:00", enabled: true },
                thursday: { open: "08:00", close: "19:00", enabled: true },
                friday: { open: "08:00", close: "19:00", enabled: true },
                saturday: { open: "08:00", close: "18:00", enabled: true },
                sunday: { open: "00:00", close: "00:00", enabled: false },
              },
            },
          }),
        }),
      }),
      insert: vi.fn(),
    }),
    channel: () => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    }),
    removeChannel: vi.fn(),
    functions: { invoke: vi.fn() },
  },
}));

vi.mock("@/lib/onesignal", () => ({ tagOneSignalUser: vi.fn() }));

describe("BookingPage agenda cheia", () => {
  beforeEach(() => {
    vi.setSystemTime(new Date("2026-04-29T13:00:00"));
  });

  it("desabilita a seleção de horários e exibe a mensagem de Agenda Completa", async () => {
    const { findByText, getByText, queryByText } = render(
      <MemoryRouter initialEntries={["/agendar?servico=Corte"]}>
        <BookingPage />
      </MemoryRouter>
    );

    expect(await findByText("Agenda Completa")).toBeInTheDocument();
    expect(
      getByText(/Todos os horários para este período já estão reservados/i)
    ).toBeInTheDocument();

    expect(queryByText("14:00")).not.toBeInTheDocument();
    expect(queryByText(/Confirmar via WhatsApp/i)).not.toBeInTheDocument();
  });
});