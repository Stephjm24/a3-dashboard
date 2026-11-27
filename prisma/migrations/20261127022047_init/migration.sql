-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sign_in_provider" TEXT NOT NULL DEFAULT 'invite',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invites" (
    "id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "user_id" UUID,

    CONSTRAINT "invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "a3s" (
    "id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'problem_solving',
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "pdca_stage" TEXT NOT NULL DEFAULT 'plan',
    "current_version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "a3s_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "a3_versions" (
    "id" UUID NOT NULL,
    "a3_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "document" JSONB NOT NULL,
    "saved_by" UUID NOT NULL,
    "change_summary" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'person',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "a3_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drafts" (
    "id" UUID NOT NULL,
    "a3_id" UUID NOT NULL,
    "field_path" TEXT NOT NULL,
    "proposed_value" JSONB NOT NULL,
    "source_quote" TEXT,
    "state" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decided_at" TIMESTAMP(3),

    CONSTRAINT "drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coaching_turns" (
    "id" UUID NOT NULL,
    "a3_id" UUID NOT NULL,
    "section" TEXT NOT NULL,
    "question_id" TEXT,
    "tag" TEXT,
    "speaker" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coaching_turns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "raw_inputs" (
    "id" UUID NOT NULL,
    "a3_id" UUID NOT NULL,
    "section" TEXT,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "raw_inputs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uploads" (
    "id" UUID NOT NULL,
    "a3_id" UUID NOT NULL,
    "file_name" TEXT NOT NULL,
    "storage_key" TEXT NOT NULL,
    "parsed_columns" JSONB,
    "mapped_metric_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "uploads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL,
    "a3_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "scores" JSONB NOT NULL,
    "flags" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "invites_token_hash_key" ON "invites"("token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_hash_key" ON "sessions"("token_hash");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "a3s_owner_id_idx" ON "a3s"("owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "a3_versions_a3_id_version_key" ON "a3_versions"("a3_id", "version");

-- CreateIndex
CREATE INDEX "drafts_a3_id_state_idx" ON "drafts"("a3_id", "state");

-- CreateIndex
CREATE INDEX "coaching_turns_a3_id_created_at_idx" ON "coaching_turns"("a3_id", "created_at");

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "a3s" ADD CONSTRAINT "a3s_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "a3_versions" ADD CONSTRAINT "a3_versions_a3_id_fkey" FOREIGN KEY ("a3_id") REFERENCES "a3s"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drafts" ADD CONSTRAINT "drafts_a3_id_fkey" FOREIGN KEY ("a3_id") REFERENCES "a3s"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coaching_turns" ADD CONSTRAINT "coaching_turns_a3_id_fkey" FOREIGN KEY ("a3_id") REFERENCES "a3s"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raw_inputs" ADD CONSTRAINT "raw_inputs_a3_id_fkey" FOREIGN KEY ("a3_id") REFERENCES "a3s"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uploads" ADD CONSTRAINT "uploads_a3_id_fkey" FOREIGN KEY ("a3_id") REFERENCES "a3s"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_a3_id_fkey" FOREIGN KEY ("a3_id") REFERENCES "a3s"("id") ON DELETE CASCADE ON UPDATE CASCADE;
