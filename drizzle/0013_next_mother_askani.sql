CREATE TABLE `loyalty_earning_rule_changes` (
	`id` text PRIMARY KEY NOT NULL,
	`previous_idr_per_point` integer NOT NULL,
	`new_idr_per_point` integer NOT NULL,
	`changed_by_user_id` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`changed_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "loyalty_rule_previous_rate_positive" CHECK("loyalty_earning_rule_changes"."previous_idr_per_point" > 0),
	CONSTRAINT "loyalty_rule_new_rate_positive" CHECK("loyalty_earning_rule_changes"."new_idr_per_point" > 0),
	CONSTRAINT "loyalty_rule_rate_changed" CHECK("loyalty_earning_rule_changes"."previous_idr_per_point" <> "loyalty_earning_rule_changes"."new_idr_per_point")
);
--> statement-breakpoint
CREATE TABLE `loyalty_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`idr_per_point` integer DEFAULT 1000 NOT NULL,
	`updated_by_user_id` text,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`updated_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "loyalty_settings_default_id" CHECK("loyalty_settings"."id" = 'default'),
	CONSTRAINT "loyalty_settings_rate_positive" CHECK("loyalty_settings"."idr_per_point" > 0)
);
--> statement-breakpoint
INSERT INTO `loyalty_settings` (`id`, `idr_per_point`) VALUES ('default', 1000);
--> statement-breakpoint
ALTER TABLE `loyalty_transactions` ADD `created_by_user_id` text REFERENCES user(id) ON DELETE set null;
