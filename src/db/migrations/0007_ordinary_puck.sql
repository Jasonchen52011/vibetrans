CREATE TABLE "generation_history" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"prompt" text NOT NULL,
	"image_url" text,
	"result_url" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"task_id" text,
	"credits_used" integer NOT NULL,
	"metadata" text,
	"error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "generation_history" ADD CONSTRAINT "generation_history_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "generation_history_user_id_idx" ON "generation_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "generation_history_type_idx" ON "generation_history" USING btree ("type");--> statement-breakpoint
CREATE INDEX "generation_history_status_idx" ON "generation_history" USING btree ("status");--> statement-breakpoint
CREATE INDEX "generation_history_task_id_idx" ON "generation_history" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "generation_history_created_at_idx" ON "generation_history" USING btree ("created_at");