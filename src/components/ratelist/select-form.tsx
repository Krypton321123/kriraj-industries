'use client'

import React, { useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Label } from '../ui/label'
import ComboboxForRate from './combobox-rate'
import { Customer } from '@/actions/masters/customer/actions'
import { Input } from '../ui/input'

// "2026-11-16" -> "16 Nov 2026"
const formatDate = (value: string) => {
  if (!value) return ''
  const d = new Date(`${value}T00:00:00`)
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
}

const SelectForm = ({
  customers,
  customer,
  date,
  setCustomer,
  setDate,
}: {
  customers: Customer[]
  customer: any
  date: string
  setCustomer: any
  setDate: any
}) => {
  const [open, setOpen] = useState(true)
  const panelId = useId()

  // The combobox only hands us the selection, so look the name up by id
  const selected =
    customer?.id != null
      ? (customers as any[]).find((c) => c.id === customer.id)
      : undefined
  const customerName: string = selected?.customerName ?? customer?.customerName ?? ''

  return (
    <div className='w-full rounded-lg shadow-lg border bg-white border-gray-300 shadow-gray-200'>
      {/* Whole header is the toggle, so the click target is large */}
      <button
        type='button'
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls={panelId}
        className='w-full flex items-center justify-between gap-4 px-4 py-3 text-left rounded-lg cursor-pointer hover:bg-gray-50'
      >
        <div className='flex items-baseline gap-4 min-w-0'>
          <span className='font-semibold text-2xl tracking-tighter'>
            Select Customer
          </span>

          {/* What was selected, so it's still visible while collapsed */}
          {!open && (
            <span className='truncate text-sm text-gray-600'>
              {customerName ? (
                <>
                  <span className='font-medium text-gray-900'>{customerName}</span>
                  {date && <span>, {formatDate(date)}</span>}
                </>
              ) : (
                'No customer selected'
              )}
            </span>
          )}
        </div>

        <ChevronDown
          className={`h-5 w-5 shrink-0 text-gray-500 transition-transform duration-200 motion-reduce:transition-none ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/*
        The body stays mounted (just hidden), so the combobox and date input keep
        their values. Height animates via grid rows; `invisible` (after the
        animation) keeps hidden fields out of the tab order.
      */}
      <div
        id={panelId}
        className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div
          className={`min-h-0 overflow-hidden transition-[visibility] duration-0 ${
            open ? 'visible' : 'invisible delay-200'
          }`}
        >
          <div className='px-4 pb-5 pt-1 flex gap-30 items-center'>
            <div className='flex flex-col gap-1'>
              <Label className='text-md'>Customer Name</Label>
              <ComboboxForRate setFn={setCustomer} data={customers} />
            </div>
            <div className='flex flex-col gap-1'>
              <Label className='text-md'>Date</Label>
              <Input
                value={date}
                onChange={(e) => setDate(e.target.value as string)}
                type={'date'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SelectForm