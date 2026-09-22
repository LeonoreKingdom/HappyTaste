CREATE TABLE `reservations` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`outlet_id` text NOT NULL,
	`table_type_id` text NOT NULL,
	`arrival_date` text NOT NULL,
	`arrival_time` text NOT NULL,
	`guest_count` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "reservations_guest_count_positive" CHECK("reservations"."guest_count" > 0),
	CONSTRAINT "reservations_guest_count_reasonable" CHECK("reservations"."guest_count" <= 20),
	CONSTRAINT "reservations_status_valid" CHECK("reservations"."status" in ('pending', 'confirmed', 'cancelled', 'completed'))
);
--> statement-breakpoint
CREATE INDEX `reservations_user_id_idx` ON `reservations` (`user_id`);--> statement-breakpoint
CREATE INDEX `reservations_outlet_schedule_idx` ON `reservations` (`outlet_id`,`arrival_date`,`arrival_time`);--> statement-breakpoint
CREATE INDEX `reservations_status_idx` ON `reservations` (`status`);