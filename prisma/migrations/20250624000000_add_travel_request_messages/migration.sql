-- CreateTable
CREATE TABLE "travel_request_messages" (
    "id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "sender_id" TEXT,
    "sender_role" TEXT NOT NULL DEFAULT 'SYSTEM',
    "body_ar" TEXT NOT NULL,
    "visibility" TEXT NOT NULL DEFAULT 'USER',
    "message_type" TEXT NOT NULL DEFAULT 'TEXT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "travel_request_messages_pkey" PRIMARY KEY ("id")
);

-- AddIndex
CREATE INDEX "travel_request_messages_request_id_idx" ON "travel_request_messages"("request_id");
CREATE INDEX "travel_request_messages_sender_id_idx" ON "travel_request_messages"("sender_id");
CREATE INDEX "travel_request_messages_visibility_idx" ON "travel_request_messages"("visibility");
CREATE INDEX "travel_request_messages_created_at_idx" ON "travel_request_messages"("created_at");

-- AddForeignKey
ALTER TABLE "travel_request_messages" ADD CONSTRAINT "travel_request_messages_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "travel_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "travel_request_messages" ADD CONSTRAINT "travel_request_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
