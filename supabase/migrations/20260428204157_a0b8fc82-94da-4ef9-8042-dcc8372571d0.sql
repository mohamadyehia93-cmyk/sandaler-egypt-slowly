
-- ============ REGIONS ============
UPDATE regions SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Saint_Catherine%2C_Egypt.jpg/1280px-Saint_Catherine%2C_Egypt.jpg' WHERE id = 'frontiers';
UPDATE regions SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Nile_River_and_Delta_from_orbit.jpg/1280px-Nile_River_and_Delta_from_orbit.jpg' WHERE id = 'nile-delta';
UPDATE regions SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Suez_Canal%2C_Egypt_%28Unsplash%29.jpg/1280px-Suez_Canal%2C_Egypt_%28Unsplash%29.jpg' WHERE id = 'suez-canal';
UPDATE regions SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Luxor%2C_Karnak_Temple%2C_Egypt%2C_Oct_2004.jpg/1280px-Luxor%2C_Karnak_Temple%2C_Egypt%2C_Oct_2004.jpg' WHERE id = 'upper-egypt';

-- ============ CITIES — Frontiers (Sinai / Red Sea / Western Desert) ============
UPDATE cities SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Siwa_Oasis_-_Egypt.jpg/1280px-Siwa_Oasis_-_Egypt.jpg' WHERE id = 'siwa';
UPDATE cities SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Dahab_Egypt_Lagoon.jpg/1280px-Dahab_Egypt_Lagoon.jpg' WHERE id = 'dahab';
UPDATE cities SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Hurghada_Marina.jpg/1280px-Hurghada_Marina.jpg' WHERE id = 'hurghada';
UPDATE cities SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Marsa_Alam_-_Red_Sea.jpg/1280px-Marsa_Alam_-_Red_Sea.jpg' WHERE id = 'marsa-alam';
UPDATE cities SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Marsa_Matruh_beach.jpg/1280px-Marsa_Matruh_beach.jpg' WHERE id = 'marsa-matrouh';
UPDATE cities SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/El_Quseir_Old_Town.jpg/1280px-El_Quseir_Old_Town.jpg' WHERE id = 'quseir';
UPDATE cities SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Al-Arish_Beach.jpg/1280px-Al-Arish_Beach.jpg' WHERE id = 'el-arish';

-- ============ CITIES — Nile Delta ============
UPDATE cities SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Rosetta_-_Egypt.jpg/1280px-Rosetta_-_Egypt.jpg' WHERE id = 'rosetta';
UPDATE cities SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Damietta_Corniche.jpg/1280px-Damietta_Corniche.jpg' WHERE id = 'damietta';
UPDATE cities SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Mansoura_Nile.jpg/1280px-Mansoura_Nile.jpg' WHERE id = 'mansoura';
UPDATE cities SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Tanta_Mosque.jpg/1280px-Tanta_Mosque.jpg' WHERE id = 'tanta';
UPDATE cities SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Nile_River_and_Delta_from_orbit.jpg/1280px-Nile_River_and_Delta_from_orbit.jpg' WHERE id = 'el-mahalla';
UPDATE cities SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Nile_River_and_Delta_from_orbit.jpg/1280px-Nile_River_and_Delta_from_orbit.jpg' WHERE id = 'bilbeis';
UPDATE cities SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Rosetta_-_Egypt.jpg/1280px-Rosetta_-_Egypt.jpg' WHERE id = 'fuwwah';
UPDATE cities SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Tanta_Mosque.jpg/1280px-Tanta_Mosque.jpg' WHERE id = 'desouk';
UPDATE cities SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Damietta_Corniche.jpg/1280px-Damietta_Corniche.jpg' WHERE id = 'manzala';

-- ============ CITIES — Suez Canal ============
UPDATE cities SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Suez_Canal%2C_Egypt_%28Unsplash%29.jpg/1280px-Suez_Canal%2C_Egypt_%28Unsplash%29.jpg' WHERE id = 'suez';
UPDATE cities SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Port_Said_Lighthouse.jpg/1280px-Port_Said_Lighthouse.jpg' WHERE id = 'port-said';
UPDATE cities SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Ismailia_-_Egypt.jpg/1280px-Ismailia_-_Egypt.jpg' WHERE id = 'ismailia';

-- ============ CITIES — Upper Egypt ============
UPDATE cities SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Luxor%2C_Karnak_Temple%2C_Egypt%2C_Oct_2004.jpg/1280px-Luxor%2C_Karnak_Temple%2C_Egypt%2C_Oct_2004.jpg' WHERE id = 'luxor';
UPDATE cities SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Philae_temple_Aswan.jpg/1280px-Philae_temple_Aswan.jpg' WHERE id = 'aswan';
UPDATE cities SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Edfu_Temple_Egypt.jpg/1280px-Edfu_Temple_Egypt.jpg' WHERE id = 'edfu';
UPDATE cities SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Esna_Temple_Egypt.jpg/1280px-Esna_Temple_Egypt.jpg' WHERE id = 'esna';
UPDATE cities SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Fayoum_Lake_Qarun.jpg/1280px-Fayoum_Lake_Qarun.jpg' WHERE id = 'fayoum';
UPDATE cities SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Beni_Hassan_tombs_Minya.jpg/1280px-Beni_Hassan_tombs_Minya.jpg' WHERE id = 'minya';
UPDATE cities SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Assiut_Egypt.jpg/1280px-Assiut_Egypt.jpg' WHERE id = 'assiut';
UPDATE cities SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Sohag_Nile.jpg/1280px-Sohag_Nile.jpg' WHERE id = 'sohag';
UPDATE cities SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Dendera_Temple_Qena.jpg/1280px-Dendera_Temple_Qena.jpg' WHERE id = 'qena';

-- ============ HERO SLIDES ============
UPDATE hero_slides
SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Nile_River_and_Delta_from_orbit.jpg/1280px-Nile_River_and_Delta_from_orbit.jpg',
    image_alts = ARRAY[
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Nile_River_and_Delta_from_orbit.jpg/1280px-Nile_River_and_Delta_from_orbit.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Rosetta_-_Egypt.jpg/1280px-Rosetta_-_Egypt.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Damietta_Corniche.jpg/1280px-Damietta_Corniche.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Mansoura_Nile.jpg/1280px-Mansoura_Nile.jpg'
    ]
WHERE title_en = 'Discover the Nile Delta';

UPDATE hero_slides
SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Suez_Canal%2C_Egypt_%28Unsplash%29.jpg/1280px-Suez_Canal%2C_Egypt_%28Unsplash%29.jpg',
    image_alts = ARRAY[
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Suez_Canal%2C_Egypt_%28Unsplash%29.jpg/1280px-Suez_Canal%2C_Egypt_%28Unsplash%29.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Port_Said_Lighthouse.jpg/1280px-Port_Said_Lighthouse.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Ismailia_-_Egypt.jpg/1280px-Ismailia_-_Egypt.jpg'
    ]
WHERE title_en = 'Suez Canal Stories';

UPDATE hero_slides
SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Fayoum_Lake_Qarun.jpg/1280px-Fayoum_Lake_Qarun.jpg',
    image_alts = ARRAY[
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Fayoum_Lake_Qarun.jpg/1280px-Fayoum_Lake_Qarun.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Siwa_Oasis_-_Egypt.jpg/1280px-Siwa_Oasis_-_Egypt.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Saint_Catherine%2C_Egypt.jpg/1280px-Saint_Catherine%2C_Egypt.jpg'
    ]
WHERE title_en = 'Fayyum Oasis';
