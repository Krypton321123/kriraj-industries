'use server'

import { prisma } from '@/util/prisma' 

export type MasterType = 
  | 'brand'
  | 'quality'
  | 'type'
  | 'category'
  | 'color'
  | 'colorType'
  | 'colorCompany'
  | 'glassQuality'
  | 'glassType'
  | 'stickerType'
  | 'bank'

interface BatchOperations {
  create: any[]
  update: any[]
  delete: number[]
}

/**
 * 🔥 MASTER CONFIG WITH TAX SUPPORT
 */
const MASTER_MAPPING = {
  brand: {
    model: 'mstbrand',
    codeField: 'brandCode',
    nameField: 'brandName',
    hasTax: true
  },
  quality: {
    model: 'mstQuality',
    codeField: 'qualityCode',
    nameField: 'qualityName',
    hasTax: true
  },
  type: {
    model: 'mstType',
    codeField: 'typeCode',
    nameField: 'typeName',
    hasTax: true
  },
  category: {
    model: 'mstCategory',
    codeField: 'categoryCode',
    nameField: 'categoryName',
    hasTax: true
  },
  color: {
    model: 'mstColor',
    codeField: 'colorCode',
    nameField: 'colorName',
    hasTax: false
  },
  colorType: {
    model: 'mstColorType',
    codeField: 'colorTypeCode',
    nameField: 'colorTypeName',
    hasTax: false
  },
  colorCompany: {
    model: 'mstColorCompany',
    codeField: 'colorCompanyCode',
    nameField: 'colorCompanyName',
    hasTax: false
  },
  glassQuality: {
    model: 'mstGlassQuality',
    codeField: 'glassQualityCode',
    nameField: 'glassQualityName',
    hasTax: false
  },
  glassType: {
    model: 'mstGlassType',
    codeField: 'glassTypeCode',
    nameField: 'glassTypeName',
    hasTax: false
  },
  stickerType: {
    model: 'mstStickerType',
    codeField: 'stickerTypeCode',
    nameField: 'stickerTypeName',
    hasTax: false
  }, 
  bank: {
    model: 'mstBank', 
    codeField: 'bankCode', 
    nameField: 'bankName',
    hasTax: false
  }
} as const

/**
 * ✅ SAVE MASTER (GENERIC WITH TAX SUPPORT)
 */
export async function saveMasterBatch(
  masterType: MasterType,
  operations: BatchOperations
) {
  try {
    const config = MASTER_MAPPING[masterType]
    if (!config) {
      return { success: false, error: 'Invalid master type' }
    }

    const result = await prisma.$transaction(async (tx) => {
      const txModel = (tx as any)[config.model]

      // ✅ DELETE
      if (operations.delete.length > 0) {
        await txModel.deleteMany({
          where: { id: { in: operations.delete } }
        })
      }

      // ✅ UPDATE
      for (const item of operations.update) {
        await txModel.update({
          where: { id: item.id },
          data: {
            [config.codeField]: item[config.codeField],
            [config.nameField]: item[config.nameField],

            ...(config.hasTax && {
              taxes: {
                set: item.taxIds?.map((id: string) => ({ taxId: id })) || []
              }
            })
          }
        })
      }

      // ✅ CREATE
      for (const item of operations.create) {
        await txModel.create({
          data: {
            [config.codeField]: item[config.codeField],
            [config.nameField]: item[config.nameField],

            ...(config.hasTax && {
              taxes: {
                connect: item.taxIds?.map((id: string) => ({ taxId: id })) || []
              }
            })
          }
        })
      }

      // ✅ FETCH UPDATED DATA
      return await txModel.findMany({
        ...(config.hasTax && {
          include: { taxes: true }
        }),
        orderBy: { id: 'asc' }
      })
    })

    return {
      success: true,
      data: result
    }

  } catch (error: any) {
    console.error('Error saving master data:', error)
    return {
      success: false,
      error: error.message || 'Failed to save master data'
    }
  }
}

/**
 * ✅ FETCH MASTER DATA (GENERIC)
 */
export async function fetchMasterData(masterType: MasterType) {
  try {
    const config = MASTER_MAPPING[masterType]
    if (!config) {
      return { success: false, error: 'Invalid master type', data: [] }
    }

    const model = (prisma as any)[config.model]

    const records = await model.findMany({
      ...(config.hasTax && {
        include: { taxes: true }
      }),
      orderBy: { id: 'asc' }
    })

    return {
      success: true,
      data: records
    }

  } catch (error: any) {
    console.error('Error fetching master data:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch master data',
      data: []
    }
  }
}

/**
 * DELETE
 */
export async function deleteMasterRecord(masterType: MasterType, id: number) {
  try {
    const config = MASTER_MAPPING[masterType]
    const model = (prisma as any)[config.model]

    await model.delete({
      where: { id }
    })

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * CREATE SINGLE
 */
export async function createMasterRecord(masterType: MasterType, data: any) {
  try {
    const config = MASTER_MAPPING[masterType]
    const model = (prisma as any)[config.model]

    const record = await model.create({
      data: {
        [config.codeField]: data[config.codeField],
        [config.nameField]: data[config.nameField],

        ...(config.hasTax && {
          taxes: {
            connect: data.taxIds?.map((id: string) => ({ taxId: id })) || []
          }
        })
      },
      ...(config.hasTax && {
        include: { taxes: true }
      })
    })

    return { success: true, data: record }

  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * UPDATE SINGLE
 */
export async function updateMasterRecord(masterType: MasterType, id: number, data: any) {
  try {
    const config = MASTER_MAPPING[masterType]
    const model = (prisma as any)[config.model]

    const record = await model.update({
      where: { id },
      data: {
        [config.codeField]: data[config.codeField],
        [config.nameField]: data[config.nameField],

        ...(config.hasTax && {
          taxes: {
            set: data.taxIds?.map((id: string) => ({ taxId: id })) || []
          }
        })
      },
      ...(config.hasTax && {
        include: { taxes: true }
      })
    })

    return { success: true, data: record }

  } catch (error: any) {
    return { success: false, error: error.message }
  }
}