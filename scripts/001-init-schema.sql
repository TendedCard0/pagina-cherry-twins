/* =====================================================================
   Cherry Twins E-Commerce - PostgreSQL schema
   Migration: 001-init-schema.sql
   ===================================================================== */

BEGIN;

SET TIME ZONE 'UTC';

-- ---------------------------------------------------------------------
-- Utility: updated_at trigger (only used by tables that have updated_at)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------
-- USERS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "users" (
  "id"            BIGSERIAL PRIMARY KEY,
  "email"         VARCHAR(255) UNIQUE NOT NULL,
  "password_hash" VARCHAR(255) NOT NULL,
  "full_name"     VARCHAR(200),
  "phone"         VARCHAR(40),
  "role"          VARCHAR(30) NOT NULL DEFAULT 'CUSTOMER',
  "is_active"     BOOLEAN NOT NULL DEFAULT TRUE,
  "email_verified" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "chk_users_role" CHECK ("role" IN ('CUSTOMER','ADMIN'))
);

DROP TRIGGER IF EXISTS "trg_users_updated_at" ON "users";
CREATE TRIGGER "trg_users_updated_at"
BEFORE UPDATE ON "users"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------
-- ADDRESSES
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "addresses" (
  "id"             BIGSERIAL PRIMARY KEY,
  "user_id"        BIGINT NOT NULL,
  "label"          VARCHAR(60),
  "recipient_name" VARCHAR(200),
  "line1"          VARCHAR(255) NOT NULL,
  "line2"          VARCHAR(255),
  "city"           VARCHAR(120) NOT NULL,
  "state"          VARCHAR(120),
  "postal_code"    VARCHAR(30),
  "country"        VARCHAR(2) NOT NULL,
  "is_default"     BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS "trg_addresses_updated_at" ON "addresses";
CREATE TRIGGER "trg_addresses_updated_at"
BEFORE UPDATE ON "addresses"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------
-- ARTISTS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "artists" (
  "id"         BIGSERIAL PRIMARY KEY,
  "name"       VARCHAR(200) NOT NULL,
  "slug"       VARCHAR(220) UNIQUE NOT NULL,
  "bio"        TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS "trg_artists_updated_at" ON "artists";
CREATE TRIGGER "trg_artists_updated_at"
BEFORE UPDATE ON "artists"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------
-- CATEGORIES
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "categories" (
  "id"         BIGSERIAL PRIMARY KEY,
  "name"       VARCHAR(120) NOT NULL,
  "slug"       VARCHAR(140) UNIQUE NOT NULL,
  "parent_id"  BIGINT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS "trg_categories_updated_at" ON "categories";
CREATE TRIGGER "trg_categories_updated_at"
BEFORE UPDATE ON "categories"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------
-- PRODUCTS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "products" (
  "id"               BIGSERIAL PRIMARY KEY,
  "artist_id"        BIGINT,
  "category_id"      BIGINT,
  "name"             VARCHAR(255) NOT NULL,
  "slug"             VARCHAR(280) UNIQUE NOT NULL,
  "description"      TEXT,
  "is_active"        BOOLEAN NOT NULL DEFAULT TRUE,
  "base_price_cents" INTEGER NOT NULL DEFAULT 0,
  "currency"         VARCHAR(3) NOT NULL DEFAULT 'USD',
  "created_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "chk_products_base_price_nonnegative" CHECK ("base_price_cents" >= 0)
);

DROP TRIGGER IF EXISTS "trg_products_updated_at" ON "products";
CREATE TRIGGER "trg_products_updated_at"
BEFORE UPDATE ON "products"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------
-- PRODUCT IMAGES
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "product_images" (
  "id"         BIGSERIAL PRIMARY KEY,
  "product_id" BIGINT NOT NULL,
  "url"        TEXT NOT NULL,
  "alt_text"   VARCHAR(255),
  "sort_order" INT NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- PRODUCT VARIANTS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "product_variants" (
  "id"            BIGSERIAL PRIMARY KEY,
  "product_id"    BIGINT NOT NULL,
  "sku"           VARCHAR(80) UNIQUE NOT NULL,
  "variant_name"  VARCHAR(200),
  "attributes"    JSONB NOT NULL DEFAULT '{}'::jsonb,
  "price_cents"   INTEGER NOT NULL,
  "currency"      VARCHAR(3) NOT NULL DEFAULT 'USD',
  "stock_on_hand" INTEGER NOT NULL DEFAULT 0,
  "is_active"     BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "chk_stock_nonnegative" CHECK ("stock_on_hand" >= 0),
  CONSTRAINT "chk_price_nonnegative" CHECK ("price_cents" >= 0)
);

DROP TRIGGER IF EXISTS "trg_product_variants_updated_at" ON "product_variants";
CREATE TRIGGER "trg_product_variants_updated_at"
BEFORE UPDATE ON "product_variants"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------
-- INVENTORY MOVEMENTS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "inventory_movements" (
  "id"            BIGSERIAL PRIMARY KEY,
  "variant_id"    BIGINT NOT NULL,
  "movement_type" VARCHAR(30) NOT NULL,
  "quantity"      INTEGER NOT NULL,
  "reason"        VARCHAR(255),
  "reference_id"  VARCHAR(80),
  "created_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "chk_qty_nonzero" CHECK ("quantity" <> 0),
  CONSTRAINT "chk_inventory_movement_type" CHECK ("movement_type" IN ('IN','OUT','ADJUST'))
);

-- ---------------------------------------------------------------------
-- CARTS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "carts" (
  "id"         BIGSERIAL PRIMARY KEY,
  "user_id"    BIGINT,
  "status"     VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "chk_carts_status" CHECK ("status" IN ('ACTIVE','CHECKED_OUT','ABANDONED'))
);

DROP TRIGGER IF EXISTS "trg_carts_updated_at" ON "carts";
CREATE TRIGGER "trg_carts_updated_at"
BEFORE UPDATE ON "carts"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------
-- CART ITEMS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "cart_items" (
  "id"         BIGSERIAL PRIMARY KEY,
  "cart_id"    BIGINT NOT NULL,
  "variant_id" BIGINT NOT NULL,
  "quantity"   INTEGER NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "chk_cartitem_qty" CHECK ("quantity" > 0)
);

DROP TRIGGER IF EXISTS "trg_cart_items_updated_at" ON "cart_items";
CREATE TRIGGER "trg_cart_items_updated_at"
BEFORE UPDATE ON "cart_items"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------
-- COUPONS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "coupons" (
  "id"             BIGSERIAL PRIMARY KEY,
  "code"           VARCHAR(40) UNIQUE NOT NULL,
  "discount_type"  VARCHAR(20) NOT NULL,
  "discount_value" INTEGER NOT NULL,
  "currency"       VARCHAR(3) NOT NULL DEFAULT 'USD',
  "starts_at"      TIMESTAMPTZ,
  "ends_at"        TIMESTAMPTZ,
  "max_redemptions" INTEGER,
  "per_user_limit" INTEGER,
  "min_order_cents" INTEGER NOT NULL DEFAULT 0,
  "is_active"      BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "chk_coupon_discount_type" CHECK ("discount_type" IN ('PERCENT','FIXED')),
  CONSTRAINT "chk_coupon_discount_value_positive" CHECK ("discount_value" > 0),
  CONSTRAINT "chk_coupon_min_order_nonnegative" CHECK ("min_order_cents" >= 0),
  CONSTRAINT "chk_coupon_time_range" CHECK ("starts_at" IS NULL OR "ends_at" IS NULL OR "starts_at" <= "ends_at"),
  CONSTRAINT "chk_coupon_limits_nonnegative" CHECK (
    ("max_redemptions" IS NULL OR "max_redemptions" >= 0)
    AND ("per_user_limit" IS NULL OR "per_user_limit" >= 0)
  )
);

DROP TRIGGER IF EXISTS "trg_coupons_updated_at" ON "coupons";
CREATE TRIGGER "trg_coupons_updated_at"
BEFORE UPDATE ON "coupons"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------
-- COUPON REDEMPTIONS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "coupon_redemptions" (
  "id"          BIGSERIAL PRIMARY KEY,
  "coupon_id"   BIGINT NOT NULL,
  "user_id"     BIGINT,
  "order_id"    BIGINT,
  "redeemed_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- ORDERS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "orders" (
  "id"                 BIGSERIAL PRIMARY KEY,
  "user_id"            BIGINT,
  "status"             VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  "currency"           VARCHAR(3) NOT NULL DEFAULT 'USD',
  "subtotal_cents"     INTEGER NOT NULL DEFAULT 0,
  "discount_cents"     INTEGER NOT NULL DEFAULT 0,
  "shipping_cents"     INTEGER NOT NULL DEFAULT 0,
  "tax_cents"          INTEGER NOT NULL DEFAULT 0,
  "total_cents"        INTEGER NOT NULL DEFAULT 0,
  "coupon_id"          BIGINT,
  "shipping_address_id" BIGINT,
  "billing_address_id"  BIGINT,
  "placed_at"          TIMESTAMPTZ,
  "created_at"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "chk_money_nonnegative" CHECK (
    "subtotal_cents" >= 0 AND "discount_cents" >= 0 AND "shipping_cents" >= 0 AND "tax_cents" >= 0 AND "total_cents" >= 0
  ),
  CONSTRAINT "chk_orders_status" CHECK ("status" IN ('PENDING','PAID','CANCELLED','REFUNDED','FULFILLED'))
);

DROP TRIGGER IF EXISTS "trg_orders_updated_at" ON "orders";
CREATE TRIGGER "trg_orders_updated_at"
BEFORE UPDATE ON "orders"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------
-- ORDER ITEMS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "order_items" (
  "id"               BIGSERIAL PRIMARY KEY,
  "order_id"         BIGINT NOT NULL,
  "variant_id"       BIGINT,
  "product_name"     VARCHAR(255) NOT NULL,
  "variant_snapshot" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "sku"              VARCHAR(80),
  "unit_price_cents" INTEGER NOT NULL,
  "quantity"         INTEGER NOT NULL,
  "line_total_cents" INTEGER NOT NULL,
  "created_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "chk_orderitem_qty" CHECK ("quantity" > 0),
  CONSTRAINT "chk_orderitem_money" CHECK ("unit_price_cents" >= 0 AND "line_total_cents" >= 0)
);

-- ---------------------------------------------------------------------
-- PAYMENTS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "payments" (
  "id"           BIGSERIAL PRIMARY KEY,
  "order_id"     BIGINT NOT NULL,
  "provider"     VARCHAR(40) NOT NULL,
  "provider_ref" VARCHAR(120),
  "status"       VARCHAR(30) NOT NULL DEFAULT 'INITIATED',
  "amount_cents" INTEGER NOT NULL,
  "currency"     VARCHAR(3) NOT NULL DEFAULT 'USD',
  "paid_at"      TIMESTAMPTZ,
  "created_at"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "chk_payment_amount" CHECK ("amount_cents" >= 0),
  CONSTRAINT "chk_payments_status" CHECK ("status" IN ('INITIATED','AUTHORIZED','CAPTURED','FAILED','CANCELLED','REFUNDED'))
);

DROP TRIGGER IF EXISTS "trg_payments_updated_at" ON "payments";
CREATE TRIGGER "trg_payments_updated_at"
BEFORE UPDATE ON "payments"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------
-- SHIPMENTS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "shipments" (
  "id"              BIGSERIAL PRIMARY KEY,
  "order_id"        BIGINT NOT NULL,
  "carrier"         VARCHAR(60),
  "tracking_number" VARCHAR(120),
  "status"          VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  "shipped_at"      TIMESTAMPTZ,
  "delivered_at"    TIMESTAMPTZ,
  "created_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "chk_shipments_status" CHECK ("status" IN ('PENDING','LABEL_CREATED','SHIPPED','IN_TRANSIT','DELIVERED','RETURNED','CANCELLED'))
);

DROP TRIGGER IF EXISTS "trg_shipments_updated_at" ON "shipments";
CREATE TRIGGER "trg_shipments_updated_at"
BEFORE UPDATE ON "shipments"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------
-- REVIEWS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "reviews" (
  "id"        BIGSERIAL PRIMARY KEY,
  "product_id" BIGINT NOT NULL,
  "user_id"   BIGINT,
  "rating"    INT NOT NULL,
  "title"     VARCHAR(120),
  "comment"   TEXT,
  "is_public" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "chk_rating_range" CHECK ("rating" BETWEEN 1 AND 5)
);

-- ---------------------------------------------------------------------
-- INDEXES
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "idx_addresses_user" ON "addresses" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_categories_parent" ON "categories" ("parent_id");
CREATE INDEX IF NOT EXISTS "idx_products_artist" ON "products" ("artist_id");
CREATE INDEX IF NOT EXISTS "idx_products_category" ON "products" ("category_id");
CREATE INDEX IF NOT EXISTS "idx_products_active" ON "products" ("is_active");
CREATE INDEX IF NOT EXISTS "idx_product_images_product" ON "product_images" ("product_id");
CREATE INDEX IF NOT EXISTS "idx_variants_product" ON "product_variants" ("product_id");
CREATE INDEX IF NOT EXISTS "idx_variants_active" ON "product_variants" ("is_active");
CREATE INDEX IF NOT EXISTS "idx_variants_attributes_gin" ON "product_variants" USING GIN ("attributes");
CREATE INDEX IF NOT EXISTS "idx_inventory_variant" ON "inventory_movements" ("variant_id");
CREATE INDEX IF NOT EXISTS "idx_carts_user" ON "carts" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_carts_status" ON "carts" ("status");
CREATE UNIQUE INDEX IF NOT EXISTS "uq_cart_variant" ON "cart_items" ("cart_id", "variant_id");
CREATE INDEX IF NOT EXISTS "idx_cart_items_cart" ON "cart_items" ("cart_id");
CREATE INDEX IF NOT EXISTS "idx_cart_items_variant" ON "cart_items" ("variant_id");
CREATE INDEX IF NOT EXISTS "idx_coupon_redemptions_coupon" ON "coupon_redemptions" ("coupon_id");
CREATE INDEX IF NOT EXISTS "idx_coupon_redemptions_user" ON "coupon_redemptions" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_orders_user" ON "orders" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_orders_status" ON "orders" ("status");
CREATE INDEX IF NOT EXISTS "idx_orders_created" ON "orders" ("created_at");
CREATE INDEX IF NOT EXISTS "idx_order_items_order" ON "order_items" ("order_id");
CREATE INDEX IF NOT EXISTS "idx_payments_order" ON "payments" ("order_id");
CREATE INDEX IF NOT EXISTS "idx_payments_status" ON "payments" ("status");
CREATE INDEX IF NOT EXISTS "idx_shipments_order" ON "shipments" ("order_id");
CREATE INDEX IF NOT EXISTS "idx_shipments_tracking" ON "shipments" ("tracking_number");
CREATE INDEX IF NOT EXISTS "idx_reviews_product" ON "reviews" ("product_id");
CREATE INDEX IF NOT EXISTS "idx_reviews_user" ON "reviews" ("user_id");

-- ---------------------------------------------------------------------
-- FOREIGN KEYS
-- ---------------------------------------------------------------------
DO $$ BEGIN
  ALTER TABLE "addresses"
    ADD CONSTRAINT "fk_addresses_user"
    FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "categories"
    ADD CONSTRAINT "fk_categories_parent"
    FOREIGN KEY ("parent_id") REFERENCES "categories" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "products"
    ADD CONSTRAINT "fk_products_artist"
    FOREIGN KEY ("artist_id") REFERENCES "artists" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "products"
    ADD CONSTRAINT "fk_products_category"
    FOREIGN KEY ("category_id") REFERENCES "categories" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "product_images"
    ADD CONSTRAINT "fk_product_images_product"
    FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "product_variants"
    ADD CONSTRAINT "fk_product_variants_product"
    FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "inventory_movements"
    ADD CONSTRAINT "fk_inventory_movements_variant"
    FOREIGN KEY ("variant_id") REFERENCES "product_variants" ("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "carts"
    ADD CONSTRAINT "fk_carts_user"
    FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "cart_items"
    ADD CONSTRAINT "fk_cart_items_cart"
    FOREIGN KEY ("cart_id") REFERENCES "carts" ("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "cart_items"
    ADD CONSTRAINT "fk_cart_items_variant"
    FOREIGN KEY ("variant_id") REFERENCES "product_variants" ("id");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "coupon_redemptions"
    ADD CONSTRAINT "fk_coupon_redemptions_coupon"
    FOREIGN KEY ("coupon_id") REFERENCES "coupons" ("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "coupon_redemptions"
    ADD CONSTRAINT "fk_coupon_redemptions_user"
    FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "coupon_redemptions"
    ADD CONSTRAINT "fk_coupon_redemptions_order"
    FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "orders"
    ADD CONSTRAINT "fk_orders_user"
    FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "orders"
    ADD CONSTRAINT "fk_orders_coupon"
    FOREIGN KEY ("coupon_id") REFERENCES "coupons" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "orders"
    ADD CONSTRAINT "fk_orders_shipping_address"
    FOREIGN KEY ("shipping_address_id") REFERENCES "addresses" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "orders"
    ADD CONSTRAINT "fk_orders_billing_address"
    FOREIGN KEY ("billing_address_id") REFERENCES "addresses" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "order_items"
    ADD CONSTRAINT "fk_order_items_order"
    FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "order_items"
    ADD CONSTRAINT "fk_order_items_variant"
    FOREIGN KEY ("variant_id") REFERENCES "product_variants" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "payments"
    ADD CONSTRAINT "fk_payments_order"
    FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "shipments"
    ADD CONSTRAINT "fk_shipments_order"
    FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "reviews"
    ADD CONSTRAINT "fk_reviews_product"
    FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "reviews"
    ADD CONSTRAINT "fk_reviews_user"
    FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

COMMIT;
