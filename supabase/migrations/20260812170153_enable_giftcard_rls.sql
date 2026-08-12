ALTER TABLE "GiftCard" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "GiftCard_select_all" ON "GiftCard" FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "GiftCard_insert_all" ON "GiftCard" FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "GiftCard_update_all" ON "GiftCard" FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "GiftCard_delete_all" ON "GiftCard" FOR DELETE
  TO anon, authenticated USING (true);
