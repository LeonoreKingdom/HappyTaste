CREATE TABLE `outlets` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`address` text NOT NULL,
	`city` text,
	`phone` text,
	`whatsapp` text,
	`email` text,
	`opening_hours` text,
	`latitude` real,
	`longitude` real,
	`is_demo_location` integer DEFAULT false NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	CONSTRAINT "outlets_coordinates_pair_valid" CHECK(("outlets"."latitude" is null and "outlets"."longitude" is null) or ("outlets"."latitude" is not null and "outlets"."longitude" is not null and "outlets"."latitude" between -90 and 90 and "outlets"."longitude" between -180 and 180))
);
--> statement-breakpoint
CREATE INDEX `outlets_active_name_idx` ON `outlets` (`is_active`,`name`);