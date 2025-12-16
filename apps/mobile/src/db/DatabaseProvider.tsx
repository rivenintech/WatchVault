import migrations from "@/drizzle/migrations";
import * as schema from "@/src/db/schema";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import * as SQLite from "expo-sqlite";
import type { ReactNode } from "react";
import { Text, View } from "react-native";

const expo = SQLite.openDatabaseSync("db.db", { enableChangeListener: true });
expo.execSync("PRAGMA journal_mode = WAL");
expo.execSync("PRAGMA foreign_keys = ON");
export const LocalDB = drizzle(expo, { schema });

export const LocalDatabase = ({ children }: { children?: ReactNode }) => {
  const { success, error } = useMigrations(LocalDB, migrations);

  if (error) {
    return (
      <View>
        <Text style={{ color: "red" }}>Migration error: {error.message}</Text>
      </View>
    );
  }

  if (!success) {
    return (
      <View>
        <Text>Migration is in progress...</Text>
      </View>
    );
  }

  return children;
};
