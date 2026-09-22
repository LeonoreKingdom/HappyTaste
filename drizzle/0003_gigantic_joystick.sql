CREATE TABLE `restaurant_tables` (
	`id` text PRIMARY KEY NOT NULL,
	`outlet_id` text NOT NULL,
	`table_number` text NOT NULL,
	`capacity` integer NOT NULL,
	`type` text NOT NULL,
	`qr_code` text NOT NULL,
	`status` text DEFAULT 'available' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	CONSTRAINT "restaurant_tables_capacity_positive" CHECK("restaurant_tables"."capacity" > 0),
	CONSTRAINT "restaurant_tables_type_valid" CHECK("restaurant_tables"."type" in ('regular', 'vip')),
	CONSTRAINT "restaurant_tables_status_valid" CHECK("restaurant_tables"."status" in ('available', 'occupied'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `restaurant_tables_qr_code_unique` ON `restaurant_tables` (`qr_code`);--> statement-breakpoint
CREATE UNIQUE INDEX `restaurant_tables_outlet_table_number_unique` ON `restaurant_tables` (`outlet_id`,`table_number`);--> statement-breakpoint
CREATE INDEX `restaurant_tables_outlet_id_idx` ON `restaurant_tables` (`outlet_id`);--> statement-breakpoint
CREATE INDEX `restaurant_tables_status_idx` ON `restaurant_tables` (`status`);