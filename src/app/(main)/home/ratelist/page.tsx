'use client'

import Main from '@/components/ratelist/main'
import { useEffect, useState } from 'react'

const RateList = ({ tabId }: { tabId: string }) => {
  const [customers, setCustomers] = useState<any[]>([])
  const [itemData, setItemData] = useState<any>({
    brands: [],
    category: [],
    quality: [],
    types: []
  })

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/ratelist-init')
      const data = await res.json()

      setCustomers(data.customers || [])
      setItemData({
        brands: data.brands || [],
        category: data.category || [],
        quality: data.quality || [],
        types: data.types || []
      })
    }

    fetchData()
  }, [])

  return (
    <div className='h-screen max-w-full w-full mx-auto'>
      <Main customers={customers} itemData={itemData} />
    </div>
  )
}

export default RateList