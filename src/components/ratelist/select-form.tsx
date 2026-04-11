'use client'

import React, { useState } from 'react'
import { Label } from '../ui/label'
import ComboboxForRate from './combobox-rate'
import { Customer } from '@/actions/masters/customer/actions'
import { Input } from '../ui/input'

const SelectForm = ({ customers, setCustomer, setDate }: {customers: Customer[], setCustomer: any, setDate: any}) => {



  return (
    <div className='w-full rounded-lg h-52 shadow-lg border bg-white flex flex-col border-gray-300 shadow-gray-200'>
        <p className='font-semibold text-2xl tracking-tighter m-3'>Select Customer</p>
        <div className='h-20 mt-4 mx-4 flex gap-30 items-center'>
            <div className='flex flex-col gap-1'>
                <Label className='text-md'>Customer Name</Label>
                <ComboboxForRate setFn={setCustomer} data={customers}/>
            </div>
            <div className='flex flex-col gap-1'>
                <Label className='text-md'>Date</Label>
                <Input onChange={(e) => setDate(e.target.value as string)} type={"date"}/>
            </div>
        </div>
    </div>
  )
}

export default SelectForm