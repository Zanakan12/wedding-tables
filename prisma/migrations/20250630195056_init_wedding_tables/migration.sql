-- CreateTable
CREATE TABLE "tables" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "tables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guests" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "table_id" INTEGER NOT NULL,

    CONSTRAINT "guests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "guests" ADD CONSTRAINT "guests_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "tables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
