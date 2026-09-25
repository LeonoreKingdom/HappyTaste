CREATE TABLE `order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`menu_id` text NOT NULL,
	`quantity` integer NOT NULL,
	`price` integer NOT NULL,
	`subtotal` integer NOT NULL,
	`notes` text,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`menu_id`) REFERENCES `menus`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "order_items_quantity_positive" CHECK("order_items"."quantity" > 0),
	CONSTRAINT "order_items_price_non_negative" CHECK("order_items"."price" >= 0),
	CONSTRAINT "order_items_subtotal_matches_quantity_price" CHECK("order_items"."subtotal" = "order_items"."quantity" * "order_items"."price")
);
--> statement-breakpoint
CREATE INDEX `order_items_order_id_idx` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE INDEX `order_items_menu_id_idx` ON `order_items` (`menu_id`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`outlet_id` text NOT NULL,
	`table_id` text,
	`order_type` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`payment_method` text NOT NULL,
	`total` integer NOT NULL,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	CONSTRAINT "orders_total_non_negative" CHECK("orders"."total" >= 0),
	CONSTRAINT "orders_order_type_valid" CHECK("orders"."order_type" in ('dine_in', 'advance')),
	CONSTRAINT "orders_status_valid" CHECK("orders"."status" in ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
	CONSTRAINT "orders_payment_method_valid" CHECK("orders"."payment_method" in ('cash', 'card', 'qris'))
);
--> statement-breakpoint
CREATE INDEX `orders_user_id_idx` ON `orders` (`user_id`);--> statement-breakpoint
CREATE INDEX `orders_outlet_created_at_idx` ON `orders` (`outlet_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `orders_status_created_at_idx` ON `orders` (`status`,`created_at`);