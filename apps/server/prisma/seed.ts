import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const colleges = [
  {
    name: "Indian Institute of Information Technology Ranchi",
    domain: "iiitranchi.ac.in",
    city: "Ranchi",
    state: "Jharkhand",
    country: "India",
  },
  {
    name: "Indian Institute of Technology Delhi",
    domain: "iitd.ac.in",
    city: "New Delhi",
    state: "Delhi",
    country: "India",
  },
  {
    name: "Indian Institute of Technology Bombay",
    domain: "iitb.ac.in",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
  },
];

async function main() {
  for (const college of colleges) {
    await prisma.college.upsert({
      where: {
        domain: college.domain,
      },
      update: {
        name: college.name,
        city: college.city,
        state: college.state,
        country: college.country,
      },
      create: college,
    });
  }

  console.log("College seed completed successfully.");
}

main()
  .catch((error) => {
    console.error("College seed failed:", error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });