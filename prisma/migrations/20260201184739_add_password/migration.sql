-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "admin" BOOLEAN NOT NULL DEFAULT false,
    "unistraId" TEXT,
    "password" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "User_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_User" ("admin", "firstName", "id", "lastName", "schoolId", "unistraId") SELECT "admin", "firstName", "id", "lastName", "schoolId", "unistraId" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_unistraId_key" ON "User"("unistraId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
