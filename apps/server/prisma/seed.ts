import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const WORDS: { text: string; category: string; difficulty: number }[] = [
  // --- difficulty 1: easy, very drawable ---
  { text: "cat", category: "animals", difficulty: 1 },
  { text: "dog", category: "animals", difficulty: 1 },
  { text: "fish", category: "animals", difficulty: 1 },
  { text: "bird", category: "animals", difficulty: 1 },
  { text: "tree", category: "nature", difficulty: 1 },
  { text: "sun", category: "nature", difficulty: 1 },
  { text: "house", category: "objects", difficulty: 1 },
  { text: "car", category: "vehicles", difficulty: 1 },
  { text: "pizza", category: "food", difficulty: 1 },
  { text: "banana", category: "food", difficulty: 1 },
  { text: "apple", category: "food", difficulty: 1 },
  { text: "chair", category: "objects", difficulty: 1 },
  { text: "star", category: "nature", difficulty: 1 },
  { text: "clock", category: "objects", difficulty: 1 },
  { text: "key", category: "objects", difficulty: 1 },
  { text: "boat", category: "vehicles", difficulty: 1 },

  // --- difficulty 2: medium ---
  { text: "elephant", category: "animals", difficulty: 2 },
  { text: "penguin", category: "animals", difficulty: 2 },
  { text: "octopus", category: "animals", difficulty: 2 },
  { text: "butterfly", category: "animals", difficulty: 2 },
  { text: "umbrella", category: "objects", difficulty: 2 },
  { text: "telescope", category: "objects", difficulty: 2 },
  { text: "scissors", category: "objects", difficulty: 2 },
  { text: "ladder", category: "objects", difficulty: 2 },
  { text: "rainbow", category: "nature", difficulty: 2 },
  { text: "volcano", category: "nature", difficulty: 2 },
  { text: "cactus", category: "nature", difficulty: 2 },
  { text: "island", category: "nature", difficulty: 2 },
  { text: "airplane", category: "vehicles", difficulty: 2 },
  { text: "bicycle", category: "vehicles", difficulty: 2 },
  { text: "rocket", category: "vehicles", difficulty: 2 },
  { text: "hamburger", category: "food", difficulty: 2 },
  { text: "cupcake", category: "food", difficulty: 2 },
  { text: "lighthouse", category: "objects", difficulty: 2 },
  { text: "windmill", category: "objects", difficulty: 2 },
  { text: "skateboard", category: "objects", difficulty: 2 },

  // --- difficulty 3: hard / abstract ---
  { text: "gravity", category: "concepts", difficulty: 3 },
  { text: "electricity", category: "concepts", difficulty: 3 },
  { text: "shadow", category: "concepts", difficulty: 3 },
  { text: "echo", category: "concepts", difficulty: 3 },
  { text: "nightmare", category: "concepts", difficulty: 3 },
  { text: "submarine", category: "vehicles", difficulty: 3 },
  { text: "helicopter", category: "vehicles", difficulty: 3 },
  { text: "parachute", category: "objects", difficulty: 3 },
  { text: "tornado", category: "nature", difficulty: 3 },
  { text: "chameleon", category: "animals", difficulty: 3 },
  { text: "kangaroo", category: "animals", difficulty: 3 },
  { text: "telescope", category: "objects", difficulty: 3 },
];

async function main() {
  console.log(`Seeding ${WORDS.length} words...`);
  for (const w of WORDS) {
    await prisma.word.upsert({
      where: { text: w.text },
      update: { category: w.category, difficulty: w.difficulty },
      create: w,
    });
  }
  const total = await prisma.word.count();
  console.log(`Done. Word bank now has ${total} unique words.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
