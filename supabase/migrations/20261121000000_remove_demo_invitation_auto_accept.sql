-- Keep fixed-plan acceptance under the control of the authenticated recipient.
drop function if exists public.auto_accept_fixed_schedule_invitation_for_demo(uuid);
