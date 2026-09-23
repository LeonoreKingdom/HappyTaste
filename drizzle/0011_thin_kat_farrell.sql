CREATE TABLE `loyalty_transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`points_delta` integer NOT NULL,
	`balance_after` integer NOT NULL,
	`description` text NOT NULL,
	`reference_type` text,
	`reference_id` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `member_profiles`(`user_id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "loyalty_transactions_type_valid" CHECK("loyalty_transactions"."type" in ('earn', 'redeem', 'adjustment', 'expire')),
	CONSTRAINT "loyalty_transactions_delta_nonzero" CHECK("loyalty_transactions"."points_delta" <> 0),
	CONSTRAINT "loyalty_transactions_delta_matches_type" CHECK(("loyalty_transactions"."type" = 'earn' and "loyalty_transactions"."points_delta" > 0) or ("loyalty_transactions"."type" in ('redeem', 'expire') and "loyalty_transactions"."points_delta" < 0) or "loyalty_transactions"."type" = 'adjustment'),
	CONSTRAINT "loyalty_transactions_balance_nonnegative" CHECK("loyalty_transactions"."balance_after" >= 0),
	CONSTRAINT "loyalty_transactions_reference_pair_valid" CHECK(("loyalty_transactions"."reference_type" is null and "loyalty_transactions"."reference_id" is null) or ("loyalty_transactions"."reference_type" is not null and "loyalty_transactions"."reference_id" is not null))
);
--> statement-breakpoint
CREATE INDEX `loyalty_transactions_user_created_at_idx` ON `loyalty_transactions` (`user_id`,`created_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `loyalty_transactions_reference_unique` ON `loyalty_transactions` (`user_id`,`reference_type`,`reference_id`,`type`) WHERE "loyalty_transactions"."reference_type" is not null and "loyalty_transactions"."reference_id" is not null;