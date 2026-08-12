import { prisma } from "../prisma/client";

export const userRepository = {
  updateEmailVerification: async (id: string) => {
    return prisma.user.update({
      where: { id },
      data: {
        isEmailVerified: true,
        status: "PENDING_COLLEGE_APPROVAL",
      },
    });
  },
  findByEmail: async (email: string) => {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  findById: async (id: string) => {
    return prisma.user.findUnique({
      where: { id },
    });
  },
  findByIdWithCollege: async (id: string) => {
    return prisma.user.findUnique({
      where: { id },
      include: {
        college: true,
      },
    });
  },
  findPendingByCollegeId: async (collegeId: string) => {
    return prisma.user.findMany({
      where: {
        collegeId,
        status: "PENDING_COLLEGE_APPROVAL",
        isEmailVerified: true,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        isEmailVerified: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  },

  updateStatus: async (
    id: string,
    status:
      | "ACTIVE"
      | "REJECTED"
  ) => {
    return prisma.user.update({
      where: { id },
      data: {
        status,
      },
    });
  },
  updateRole: async (
    id: string,
    role: "USER" | "COLLEGE_ADMIN" | "PLATFORM_ADMIN"
  ) => {
    return prisma.user.update({
      where: { id },
      data: {
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        collegeId: true,
      },
    });
  },

  create: async (data: {
    name: string;
    email: string;
    password: string;
    collegeId: string;
  }) => {
    return prisma.user.create({
      data,
    });
  },

  createCollegeAdmin: async (data: {
    name: string;
    email: string;
    password: string;
    collegeId: string;
  }) => {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        collegeId: data.collegeId,
        role: "COLLEGE_ADMIN",
        status: "ACTIVE",
        isEmailVerified: true,
      },
    });
  },
};