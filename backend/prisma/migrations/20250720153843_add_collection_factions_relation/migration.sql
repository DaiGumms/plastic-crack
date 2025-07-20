-- CreateTable
CREATE TABLE "_CollectionToFaction" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CollectionToFaction_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CollectionToFaction_B_index" ON "_CollectionToFaction"("B");

-- AddForeignKey
ALTER TABLE "_CollectionToFaction" ADD CONSTRAINT "_CollectionToFaction_A_fkey" FOREIGN KEY ("A") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionToFaction" ADD CONSTRAINT "_CollectionToFaction_B_fkey" FOREIGN KEY ("B") REFERENCES "factions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
