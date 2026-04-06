
ALTER TABLE experiences DROP CONSTRAINT experiences_provider_id_fkey;
ALTER TABLE products DROP CONSTRAINT products_seller_id_fkey;
ALTER TABLE trips DROP CONSTRAINT trips_organizer_id_fkey;
ALTER TABLE accommodations DROP CONSTRAINT accommodations_host_id_fkey;
ALTER TABLE transport DROP CONSTRAINT transport_provider_id_fkey;
ALTER TABLE audio_tours DROP CONSTRAINT audio_tours_creator_id_fkey;
ALTER TABLE posts DROP CONSTRAINT posts_author_id_fkey;
ALTER TABLE organizations DROP CONSTRAINT organizations_owner_id_fkey;

ALTER TABLE experiences ADD CONSTRAINT experiences_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE SET NULL;
ALTER TABLE products ADD CONSTRAINT products_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES providers(id) ON DELETE SET NULL;
ALTER TABLE trips ADD CONSTRAINT trips_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES providers(id) ON DELETE SET NULL;
ALTER TABLE accommodations ADD CONSTRAINT accommodations_host_id_fkey FOREIGN KEY (host_id) REFERENCES providers(id) ON DELETE SET NULL;
ALTER TABLE transport ADD CONSTRAINT transport_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE SET NULL;
ALTER TABLE audio_tours ADD CONSTRAINT audio_tours_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES providers(id) ON DELETE SET NULL;
ALTER TABLE posts ADD CONSTRAINT posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES providers(id) ON DELETE SET NULL;
ALTER TABLE organizations ADD CONSTRAINT organizations_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES providers(id) ON DELETE SET NULL;
