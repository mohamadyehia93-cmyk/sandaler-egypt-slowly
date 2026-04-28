UPDATE experiences AS t SET image = v.url
FROM (VALUES
  ('593022ac-7f32-4e83-a7d7-b3088d318d60','https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=800&q=80'),
  ('d7c1a2ab-c5a5-4dcc-a420-a73514146e66','https://images.unsplash.com/photo-1560359614-870d1a7ea91d?auto=format&fit=crop&w=800&q=80'),
  ('5c130cef-c768-4bf0-ab36-7741e374fae1','https://images.unsplash.com/photo-1547235001-d703406d3f17?auto=format&fit=crop&w=800&q=80'),
  ('5a8fcac7-7e22-4741-a52d-277a16c837da','https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=800&q=80'),
  ('62f6fd99-84a1-46cd-a0cb-c87bb372ab9d','https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'),
  ('dd1b1501-9417-4eda-a49c-11b0760decd8','https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80'),
  ('fffd5dcb-a15e-4b11-ba39-d5946db4626b','https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80'),
  ('b5413a52-bfdd-492c-b010-36f1a8e55186','https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80'),
  ('cdbc2b94-9618-4576-b374-4dc1b977af94','https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=800&q=80'),
  ('c864e576-0da8-4e87-b83b-3aea19049caf','https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80'),
  ('e092e671-8861-4d63-815d-51b490d96a60','https://images.unsplash.com/photo-1590077428593-a55bb07c4665?auto=format&fit=crop&w=800&q=80'),
  ('022f0651-5e21-4a3c-aad0-8fd332bacbdb','https://images.unsplash.com/photo-1535140728325-a4d3707eee94?auto=format&fit=crop&w=800&q=80'),
  ('52cbf791-db11-4208-ba5d-f888efed5bba','https://images.unsplash.com/photo-1515562141589-67f0d569b6c4?auto=format&fit=crop&w=800&q=80'),
  ('049cba44-9eb5-442a-bd9c-314a42069695','https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=800&q=80'),
  ('fe206810-2bb4-41b6-9e56-cd53dfc81ab6','https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80'),
  ('8f3a67bf-634c-4fbb-97f5-5ecc6b07e1a1','https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80')
) AS v(id, url)
WHERE t.id = v.id::uuid;

UPDATE trips AS t SET image = v.url
FROM (VALUES
  ('d609c3b8-286a-4b5f-9f5a-085a371f5a5c','https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80'),
  ('7d5ab78a-baeb-4abf-bffb-743b4229bfed','https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80'),
  ('ac7ada0b-b2a0-4dad-858b-4bb184b91176','https://images.unsplash.com/photo-1568322445389-f64c5bb0df1d?auto=format&fit=crop&w=800&q=80'),
  ('d5560397-f3a9-4a5e-acae-9c87afaf88dc','https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=800&q=80')
) AS v(id, url)
WHERE t.id = v.id::uuid;

UPDATE audio_tours AS t SET image = v.url
FROM (VALUES
  ('cc8cf247-8776-4f25-b79c-ab642a6f93ae','https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80'),
  ('cc03f78d-80cd-4f80-9760-40039b24181c','https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80'),
  ('6979cb6b-5d60-46ed-b204-4649ed139019','https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=800&q=80'),
  ('1cf5be20-f157-444d-b67c-574a050e3142','https://images.unsplash.com/photo-1568322445389-f64c5bb0df1d?auto=format&fit=crop&w=800&q=80'),
  ('649a534d-019e-470b-b499-a396062498ef','https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80'),
  ('a4a803db-a0b1-4652-b158-f11220aca44e','https://images.unsplash.com/photo-1568322445389-f64c5bb0df1d?auto=format&fit=crop&w=800&q=80'),
  ('f8a9c976-dc1b-483f-9407-8e591a81e54c','https://images.unsplash.com/photo-1568322445389-f64c5bb0df1d?auto=format&fit=crop&w=800&q=80'),
  ('e7423886-793c-4dec-8bbb-e1356a40b789','https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'),
  ('395d543e-2d53-4b88-8294-058392ff14b3','https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=800&q=80'),
  ('9d7c4599-7c27-4acb-ab18-b4a9a6196f6d','https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80')
) AS v(id, url)
WHERE t.id = v.id::uuid;

UPDATE accommodations AS t SET image = v.url
FROM (VALUES
  ('50dcf76b-d7ab-44f5-9401-b460978b451a','https://images.unsplash.com/photo-1568322445389-f64c5bb0df1d?auto=format&fit=crop&w=800&q=80'),
  ('57d4d7e8-99d2-4a5a-951c-ecd6f578508b','https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80'),
  ('58b791f1-26a0-4c2f-be90-f431cbe9b74e','https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80'),
  ('28e90aae-1729-4b6a-a9c5-dea8074d98db','https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=800&q=80')
) AS v(id, url)
WHERE t.id = v.id::uuid;

UPDATE products AS t SET image = v.url
FROM (VALUES
  ('a41e222c-f209-418d-8808-e397de6896af','https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80'),
  ('57c28871-f322-48ac-8a91-124ab399b3ad','https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80'),
  ('7085fc37-80c9-4403-ace7-669ee45df8c2','https://images.unsplash.com/photo-1590077428593-a55bb07c4665?auto=format&fit=crop&w=800&q=80'),
  ('a4c89800-9e5c-492e-8ad6-4041bccd30f2','https://images.unsplash.com/photo-1596207498818-c84a1afe1bb6?auto=format&fit=crop&w=800&q=80'),
  ('1da57815-c2e5-4d27-bcf7-e731bd11c41b','https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80'),
  ('ce088634-b5d6-485a-b0b0-d704540eccc1','https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80'),
  ('76535750-64f4-4e32-aac7-8b341f43c1b9','https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=800&q=80'),
  ('088fc98a-65d3-41e5-bc4c-3dc251fe6368','https://images.unsplash.com/photo-1535140728325-a4d3707eee94?auto=format&fit=crop&w=800&q=80'),
  ('b7c11942-7ac4-4aae-ac19-52b80db6d316','https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80'),
  ('493e86fc-aaa0-4fb5-9ebe-5de61132d564','https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80'),
  ('fe77369d-fe78-4a59-bc71-914c3d0b2ac2','https://images.unsplash.com/photo-1605651531144-51381895e23d?auto=format&fit=crop&w=800&q=80'),
  ('8ada2ef9-b350-43a8-8276-0a400ba59233','https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80'),
  ('8871cd00-0056-407e-a51c-cd29cbf3c8fd','https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=800&q=80'),
  ('5d8d8b43-766c-4396-9701-d1172df6caae','https://images.unsplash.com/photo-1556910638-b384b6c83bb1?auto=format&fit=crop&w=800&q=80'),
  ('9bec09a1-0a8f-4d07-84ec-36db98e38c5f','https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80'),
  ('e189052e-5d04-4f33-894d-1a8453e45c0e','https://images.unsplash.com/photo-1577415124269-fc1140a69e91?auto=format&fit=crop&w=800&q=80'),
  ('cb57b156-c9c5-43e4-9719-5c99508f0615','https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=800&q=80'),
  ('899c7fb9-cfbe-4118-8819-214e21e879cf','https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=800&q=80'),
  ('be0be6c8-84e7-41f5-beb5-fb26d81d6287','https://images.unsplash.com/photo-1605651531144-51381895e23d?auto=format&fit=crop&w=800&q=80'),
  ('1062d708-7d61-4b14-b5b9-2aa6a6d5494f','https://images.unsplash.com/photo-1548276145-69bb96eef0a8?auto=format&fit=crop&w=800&q=80'),
  ('38535459-ca0c-4eac-9896-e923c95ba34d','https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80'),
  ('d3de2a6f-9adb-493c-a9f8-9c3a839f910f','https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=800&q=80'),
  ('ed0ad7b5-93d5-4f89-8727-e35ebb51c303','https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80'),
  ('f8195ffb-3d16-4808-98ef-8e416a262837','https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80'),
  ('dab8db49-2431-4c92-92bf-d2b0ab0c8e8f','https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80'),
  ('94d157a1-6556-46c1-808f-a393785c13c2','https://images.unsplash.com/photo-1583212292454-5c8e4be2dee6?auto=format&fit=crop&w=800&q=80'),
  ('957ff2bc-fd87-4c4e-a26a-911fd65183ed','https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80'),
  ('101384bc-5978-49d0-bacb-f7a49849b306','https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'),
  ('319aeb28-0566-4176-8021-93aec851c09e','https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=800&q=80'),
  ('f3354178-9ddd-4671-b4a0-d1c215ebd6e3','https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80'),
  ('48e8d4b1-1b31-4e17-a495-9e4df5d30ccd','https://images.unsplash.com/photo-1599909533730-ef2e72c2c5fa?auto=format&fit=crop&w=800&q=80'),
  ('52dd6dc9-3a93-4a0e-a6cb-0fe7780b459e','https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80'),
  ('dce3e461-14e3-4272-8baf-3d651fbb9a37','https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&w=800&q=80'),
  ('dd96d651-c302-4043-983b-0782ab802cac','https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80'),
  ('3b941576-808d-4997-b4eb-f2cb568afb47','https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80'),
  ('23befcc7-ef63-40e2-abf1-44c2203cc165','https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80'),
  ('684a9e1e-9ecd-472b-9fa8-318b6054dfcc','https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&w=800&q=80'),
  ('f04d130a-7cef-4143-a740-c7f5995233d8','https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80'),
  ('33675b23-ccf2-44a7-b239-36cb88f557dc','https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&w=800&q=80'),
  ('172d6fbb-d65e-4902-858f-f14d9e8fc9d8','https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80'),
  ('186207a6-5385-4d14-b8d8-93defebf41cf','https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&w=800&q=80'),
  ('2cc9c6e3-07c4-4c2e-b380-0d40bca7e0e6','https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80'),
  ('314aa247-163e-4765-bfcb-513404b5cdb0','https://images.unsplash.com/photo-1599909533730-ef2e72c2c5fa?auto=format&fit=crop&w=800&q=80'),
  ('f623126f-f9ab-4b7e-bbf0-1187d1e2b230','https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80'),
  ('7b9f5cbd-afc1-49f8-87a9-d720599fa9d6','https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&w=800&q=80'),
  ('deb47521-f41d-4340-a693-821c6e9e3830','https://images.unsplash.com/photo-1556910638-b384b6c83bb1?auto=format&fit=crop&w=800&q=80'),
  ('9fc90135-d44a-40c3-98e4-5efca887f761','https://images.unsplash.com/photo-1556910638-b384b6c83bb1?auto=format&fit=crop&w=800&q=80'),
  ('9a5e8fca-3550-4d42-80a6-ca5c3aa22a4f','https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80'),
  ('6ccc3e66-2d90-4c71-8233-9fc554262f14','https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&w=800&q=80'),
  ('57189bd9-80dc-43a8-9475-7aff5b3bac19','https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80'),
  ('185e6641-fc69-4e5e-8ced-7b121683399e','https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&w=800&q=80'),
  ('b504cf5a-9ee3-476d-8176-1b86d59c5954','https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80'),
  ('242c5a24-cf68-4ff3-9812-c0fff426cdf6','https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80'),
  ('4f96bae3-efec-47cb-bab2-1430ae4dfbc5','https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80'),
  ('b5a25a7f-21bb-4a70-a3a4-ae57cbedcac0','https://images.unsplash.com/photo-1599909533730-ef2e72c2c5fa?auto=format&fit=crop&w=800&q=80'),
  ('499408f2-823b-4411-8c42-0e1b2093d5ec','https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80'),
  ('78bcd51f-a7d0-48b3-9771-298727c199ba','https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80'),
  ('55dd84d6-eb4b-4fe4-849c-3cc5c6dc53ca','https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=800&q=80'),
  ('d4b72302-21ac-4d52-9e78-3c6398a1075f','https://images.unsplash.com/photo-1568322445389-f64c5bb0df1d?auto=format&fit=crop&w=800&q=80'),
  ('aef7f761-5688-488a-9b42-64701847a00f','https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80'),
  ('bcedd6f7-2b8b-4e9f-b1dd-4d3f8234e92d','https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80'),
  ('b3567407-91cb-4494-8928-1976ec0c1f73','https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80'),
  ('eda710e1-6f7c-4648-8193-1351b780904c','https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80'),
  ('a5785a1d-4646-4228-8c3d-d530764fc320','https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80'),
  ('d91bdde6-c47a-46a4-a1b1-df9507f92859','https://images.unsplash.com/photo-1599909533730-ef2e72c2c5fa?auto=format&fit=crop&w=800&q=80'),
  ('0b42ea8c-54ed-4817-b692-1475a10de6fb','https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80'),
  ('6c6cf70c-71f9-483f-8532-2ea730e472f6','https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&w=800&q=80'),
  ('c96017ec-81ca-4da2-92cc-a7d4dcd717b0','https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80'),
  ('a612e12f-f8ff-42e8-896c-bf8806809ee5','https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&w=800&q=80'),
  ('993ccadf-e3da-490e-acbf-397d9ff980d6','https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80'),
  ('433a414e-0241-4ea4-b3c0-17c834b8c88e','https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&w=800&q=80'),
  ('f0fab3ea-7037-428e-a328-1c9653445fcf','https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80'),
  ('5c7eb8b0-16d8-476f-adde-d5a7d9389883','https://images.unsplash.com/photo-1599909533730-ef2e72c2c5fa?auto=format&fit=crop&w=800&q=80'),
  ('fe8a8e40-7727-481d-99d7-c8a01d8a7695','https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80'),
  ('b11d4366-16a2-470f-8621-50a2066f9abb','https://images.unsplash.com/photo-1599909533730-ef2e72c2c5fa?auto=format&fit=crop&w=800&q=80'),
  ('804cb907-58b8-4c11-8602-0d9dee5bbea3','https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80'),
  ('a675b904-fe25-49ac-b779-fc9d627d4bc9','https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&w=800&q=80'),
  ('c238b204-147a-413b-9bea-036f1be1dc00','https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80'),
  ('ee63107c-6343-407d-a62a-a3ebbaf78f0b','https://images.unsplash.com/photo-1599909533730-ef2e72c2c5fa?auto=format&fit=crop&w=800&q=80'),
  ('244e692f-38fd-4529-ab40-1434aef30a9f','https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80'),
  ('a31379b4-297c-4e1c-b7e7-3d9df4b8e10e','https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80'),
  ('44362d60-0699-467c-b4b3-6f4133a94422','https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80'),
  ('e7fb1288-b4a7-4a98-b7b8-a087eabd502b','https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80'),
  ('ddc9b210-9fd5-459e-95ef-1b85840dfc04','https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80'),
  ('5f5262f7-48f0-474c-9ba3-fc9b718bdac1','https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80')
) AS v(id, url)
WHERE t.id = v.id::uuid;

UPDATE transport AS t SET image = v.url
FROM (VALUES
  ('a9a1313c-e4cf-45f0-a827-194b7780c553','https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=800&q=80'),
  ('7741e7c8-94aa-4feb-85ce-fb0470c3d73a','https://images.unsplash.com/photo-1568322445389-f64c5bb0df1d?auto=format&fit=crop&w=800&q=80'),
  ('da40a99f-2736-424c-99d3-622c0dc1f017','https://images.unsplash.com/photo-1517256673644-36ad11246d21?auto=format&fit=crop&w=800&q=80'),
  ('55657193-27d3-47f7-9cb6-f8c352dc1c8a','https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80')
) AS v(id, url)
WHERE t.id = v.id::uuid;