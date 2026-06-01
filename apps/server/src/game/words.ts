import {prisma} from "../db/client";

export async function pickRandomWords(count = 3): Promise<string[]> {
    const rows = await prisma.$queryRaw<{text: string}[]>`
      SELECT text FROM "Word" ORDER BY RANDOM() LIMIT ${count}`;
    return rows.map((row) => row.text);
}