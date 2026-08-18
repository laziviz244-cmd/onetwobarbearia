# Plan - Professional Selection and Independent Availability

Implement a "Professional Selection" section on the home page and update the booking logic to support independent schedules for two barbers.

## User Review Required

> [!IMPORTANT]
> - I am assuming the two professionals are "Barbeiro 1" and "Barbeiro 2". Do they have specific names?
> - The database schema for `appointments` currently lacks a `barbeiro` field. I will add it via a migration.
> - I will use generic placeholders for professional photos if none are provided.

- [ ] Confirm professional names (e.g., "João" and "Maria" or keep "Barbeiro 1/2").
- [ ] Approve the addition of a `barbeiro` column to the `appointments` table.

## Proposed Changes

### Database & Backend
#### [Migration] Add barber field to appointments
- Add `barbeiro` (TEXT) column to `public.appointments`.
- Update the unique constraint `appointments_unique_slot_confirmed` to include `barbeiro`, allowing the same time slot to be booked for different barbers.

#### [Edge Function] Update appointments-api
- Modify `list_reserved_times` to filter by `barbeiro` if provided.
- Update `create` to accept and store the `barbeiro` field.

### Frontend
#### [Home Page] src/pages/ClientHomePage.tsx
- Add "Escolha um de nossos profissionais" section before "Nossos Serviços".
- Display two profile cards (Barbeiro 1 and Barbeiro 2).
- Clicking a professional stores the choice in state/localStorage and scrolls to the services section.
- Services should only be clickable after a professional is selected (or auto-select the first one).

#### [Booking Page] src/pages/BookingPage.tsx
- Read `barbeiro` from URL search params.
- Pass `barbeiro` to `appointmentsApi.listReservedTimes`.
- Ensure the booking confirmation includes the professional's name.
- Update WhatsApp message to include the professional's name.

## Technical Details
- New migration file for schema update.
- Updated `appointments-api` edge function logic.
- UI components for professional profiles with luxury styling.
- Persistence of professional selection via URL params and/or localStorage.
