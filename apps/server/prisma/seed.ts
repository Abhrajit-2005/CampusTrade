import bcrypt from "bcrypt";
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

const categories = [
  { name: "Textbooks",           slug: "textbooks",           icon: "📚" },
  { name: "Electronics",         slug: "electronics",         icon: "💻" },
  { name: "Furniture",           slug: "furniture",           icon: "🪑" },
  { name: "Clothing",            slug: "clothing",            icon: "👕" },
  { name: "Stationery",          slug: "stationery",          icon: "✏️" },
  { name: "Sports Equipment",    slug: "sports-equipment",    icon: "⚽" },
  { name: "Musical Instruments", slug: "musical-instruments", icon: "🎸" },
  { name: "Kitchen & Dining",    slug: "kitchen-dining",      icon: "🍽️" },
  { name: "Room Essentials",     slug: "room-essentials",     icon: "🛏️" },
  { name: "Vehicles",            slug: "vehicles",            icon: "🚲" },
  { name: "Tickets & Vouchers",  slug: "tickets-vouchers",    icon: "🎟️" },
  { name: "Other",               slug: "other",               icon: "📦" },
];

async function main() {
  // Seed colleges
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

  // Seed categories
  for (const category of categories) {
    await prisma.category.upsert({
      where: {
        slug: category.slug,
      },
      update: {
        name: category.name,
        icon: category.icon,
      },
      create: category,
    });
  }

  console.log("Category seed completed successfully.");

  // Seed platform admin
  const adminEmail = process.env.PLATFORM_ADMIN_EMAIL;
  const adminPassword = process.env.PLATFORM_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error(
      "PLATFORM_ADMIN_EMAIL and PLATFORM_ADMIN_PASSWORD must be set"
    );
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: {
      email: adminEmail,
    },
    update: {
      name: "Platform Administrator",
      password: hashedPassword,
      role: "PLATFORM_ADMIN",
      status: "ACTIVE",
      isEmailVerified: true,
      collegeId: null,
    },
    create: {
      name: "Platform Administrator",
      email: adminEmail,
      password: hashedPassword,
      role: "PLATFORM_ADMIN",
      status: "ACTIVE",
      isEmailVerified: true,
      collegeId: null,
    },
  });

  console.log("Platform admin seed completed successfully.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });