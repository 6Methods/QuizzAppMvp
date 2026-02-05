import { PrismaClient, Role, QuestionType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database");

  const passwordHash = await bcrypt.hash("123456", 10);

  const organizer = await prisma.user.upsert({
    where: { email: "organizer@test.com" },
    update: {},
    create: {
      email: "organizer@test.com",
      passwordHash,
      role: Role.ORGANIZER,
    },
  });

  console.log("Created organizer:", organizer.email);

  const participant = await prisma.user.upsert({
    where: { email: "participant@test.com" },
    update: {},
    create: {
      email: "participant@test.com",
      passwordHash,
      role: Role.PARTICIPANT,
    },
  });

  console.log("Created participant:", participant.email);

  const existingQuiz = await prisma.quiz.findFirst({
    where: { ownerId: organizer.id },
  });

  if (!existingQuiz) {
    const quiz = await prisma.quiz.create({
      data: {
        ownerId: organizer.id,
        title: "Sample Quiz: General Knowledge",
        description: "A sample quiz to test the application functionality",
        questions: {
          create: [
            {
              order: 1,
              type: QuestionType.TEXT,
              prompt: "What is the capital of France?",
              isMulti: false,
              timeLimitSec: 20,
              points: 100,
              options: {
                create: [
                  { text: "London", isCorrect: false },
                  { text: "Berlin", isCorrect: false },
                  { text: "Paris", isCorrect: true },
                  { text: "Madrid", isCorrect: false },
                ],
              },
            },
            {
              order: 2,
              type: QuestionType.IMAGE,
              prompt: "Which programming languages are shown in this image?",
              imageUrl:
                "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Typescript_logo_2020.svg/512px-Typescript_logo_2020.svg.png",
              isMulti: true,
              timeLimitSec: 30,
              points: 150,
              options: {
                create: [
                  { text: "TypeScript", isCorrect: true },
                  { text: "JavaScript", isCorrect: true },
                  { text: "Python", isCorrect: false },
                  { text: "Rust", isCorrect: false },
                ],
              },
            },
          ],
        },
      },
    });

    console.log("Created sample quiz:", quiz.title);
  } else {
    console.log("Sample quiz already exists");
  }

  console.log("Seeding completed!");
  console.log("\nTest accounts:");
  console.log("   Organizer: organizer@test.com / 123456");
  console.log("   Participant: participant@test.com / 123456");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
