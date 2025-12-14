ALTER TABLE "events" RENAME COLUMN "event_date" TO "start_date";--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "end_date" date;