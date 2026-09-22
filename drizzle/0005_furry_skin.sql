ALTER TABLE `orders` ADD `scheduled_at` integer;--> statement-breakpoint
CREATE INDEX `orders_scheduled_at_idx` ON `orders` (`scheduled_at`);