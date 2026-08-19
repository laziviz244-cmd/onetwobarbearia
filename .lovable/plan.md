# Plan: Fix WhatsApp Professional Name and Enforce Selection

The goal is to fix the issue where WhatsApp messages sometimes show a generic professional name and to ensure clients MUST select a professional before booking.

## Proposed Changes

### 1. Mandatory Professional Selection
- Modify `ClientHomePage.tsx` to strictly require a professional selection before navigating to the booking page.
- Add user feedback (toast) when trying to select a service without a professional.
- Remove default "Geral" values from `BookingPage.tsx` search parameter parsing.

### 2. Booking Flow Guards
- Disable time slot selection in `BookingPage.tsx` until `selectedBarber` is confirmed.
- Hide the "Agendar via WhatsApp" button until all required fields (Time + Professional) are selected.

### 3. WhatsApp Safety Check
- Implement a safety check in `finalizeBooking` to abort and log an error if a message is about to be sent with a missing or generic professional name.
- Remove hardcoded fallbacks like `|| "Geral"` from the message template.

### 4. Admin and UI Consistency
- Update `MeusAgendamentos.tsx` to ensure proper styling of professional names and remove any remaining generic fallbacks.

## Technical Details
- Files affected: `src/pages/ClientHomePage.tsx`, `src/pages/BookingPage.tsx`, `src/pages/MeusAgendamentos.tsx`.
- Safety check location: `finalizeBooking` function in `BookingPage.tsx`.
- Selection enforcement: `handleBarberSelect` and `service.map` logic in `ClientHomePage.tsx`.
