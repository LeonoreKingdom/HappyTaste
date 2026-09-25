CREATE TABLE `member_profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`phone` text,
	`points_balance` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "member_profiles_points_balance_nonnegative" CHECK("member_profiles"."points_balance" >= 0)
);
