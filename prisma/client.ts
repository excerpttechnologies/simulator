// @ts-nocheck
/**
 * Safe Prisma client wrapper to avoid build-time errors when @prisma/client is not installed.
 * Usage: import prisma from '@/prisma/client'
 */

let prisma
try {
  const { PrismaClient } = require('@prisma/client')
  prisma = global.prismaClient || new PrismaClient()
  if (process.env.NODE_ENV === 'development') global.prismaClient = prisma
} catch (e) {
  // noop — prisma not installed in this environment
  prisma = null
}

export default prisma
