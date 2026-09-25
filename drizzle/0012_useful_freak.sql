CREATE TABLE `loyalty_rewards` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`points_required` integer NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT "loyalty_rewards_name_nonempty" CHECK(length(trim("loyalty_rewards"."name")) > 0),
	CONSTRAINT "loyalty_rewards_description_nonempty" CHECK(length(trim("loyalty_rewards"."description")) > 0),
	CONSTRAINT "loyalty_rewards_points_positive" CHECK("loyalty_rewards"."points_required" > 0),
	CONSTRAINT "loyalty_rewards_active_boolean" CHECK("loyalty_rewards"."is_active" in (0, 1))
);
--> statement-breakpoint
CREATE INDEX `loyalty_rewards_active_cost_idx` ON `loyalty_rewards` (`is_active`,`points_required`);