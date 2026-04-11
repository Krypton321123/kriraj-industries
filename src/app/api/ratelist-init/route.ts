import { prisma } from '@/util/prisma'

export async function GET() {
  let customers = await prisma.mstCustomer.findMany({})
  const brands = await prisma.mstbrand.findMany({})
  const category = await prisma.mstCategory.findMany({})
  const quality = await prisma.mstQuality.findMany({})
  const types = await prisma.mstType.findMany({})

  // fix Decimal
  customers = customers.map((item) => ({
    ...item,
    openingBalance: item.openingBalance.toNumber(),
  }))

  return Response.json({
    customers,
    brands,
    category,
    quality,
    types,
  })
}