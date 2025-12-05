import * as React from "react"
import { Filter } from 'lucide-react'
import { Button } from './ui/button'
import { Slider } from './ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

export function ModernFilterBar({
  filters,
  setFilters,
  formatCurrency,
  radiusFilterKm,
  setRadiusFilterKm,
  showMoreFilters,
  setShowMoreFilters,
}) {
  const RADIUS_OPTIONS = [
    { label: '2 km', value: 2 },
    { label: '5 km', value: 5 },
    { label: '10 km', value: 10 },
    { label: '15 km', value: 15 },
    { label: '20 km', value: 20 },
    { label: '25 km', value: 25 },
  ]

  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col gap-4 overflow-x-auto">
      <div className="flex items-center space-x-3">
        <Filter size={18} className="text-blue-600" />
        <h3 className="text-sm font-semibold text-gray-800">Filters</h3>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        {/* Price Range Slider */}
        <div className="w-full space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700">Price Range</span>
            <span className="text-xs text-gray-600">
              {formatCurrency(filters.priceRange[0])} - {formatCurrency(filters.priceRange[1])}
            </span>
          </div>

          <Slider
            min={0}
            max={100000}
            step={500}
            value={filters.priceRange}
            onValueChange={(value) => {
              setFilters({ ...filters, priceRange: value })
            }}
            className="w-full"
          />

          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.priceRange[0]}
              step={500}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  priceRange: [
                    Math.min(
                      Number(e.target.value) || 0,
                      filters.priceRange[1] - 500
                    ),
                    filters.priceRange[1],
                  ],
                })
              }
              className="w-24 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.priceRange[1]}
              step={500}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  priceRange: [
                    filters.priceRange[0],
                    Math.max(
                      Number(e.target.value) || 100000,
                      filters.priceRange[0] + 500
                    ),
                  ],
                })
              }
              className="w-24 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Rating filter */}
        <div className="w-full space-y-2">
          <label className="block text-xs font-medium text-gray-700">Rating</label>
          <Select
            value={filters.rating}
            onValueChange={(value) => setFilters({ ...filters, rating: value })}
          >
            <SelectTrigger className="w-full h-10 text-sm">
              <SelectValue placeholder="Select rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any rating</SelectItem>
              <SelectItem value="9">9+ Wonderful</SelectItem>
              <SelectItem value="8">8+ Very good</SelectItem>
              <SelectItem value="7">7+ Good</SelectItem>
              <SelectItem value="6">6+ Pleasant</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Property Type filter */}
        <div className="w-full space-y-2">
          <label className="block text-xs font-medium text-gray-700">Property Type</label>
          <Select
            value={filters.type}
            onValueChange={(value) => setFilters({ ...filters, type: value })}
          >
            <SelectTrigger className="w-full h-10 text-sm">
              <SelectValue placeholder="Select property type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stays</SelectItem>
              <SelectItem value="hotels">Hotels</SelectItem>
              <SelectItem value="resorts">Resorts</SelectItem>
              <SelectItem value="guesthouses">Guesthouses</SelectItem>
              <SelectItem value="farmstays">Farm stays</SelectItem>
              <SelectItem value="apartments">Apartments</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search Radius */}
        <div className="w-full space-y-2">
          <div className="text-xs font-medium text-gray-700">Search radius</div>
          <div className="flex flex-wrap gap-2">
            {RADIUS_OPTIONS.map((opt) => {
              const isActive = radiusFilterKm === opt.value
              return (
                <Button
                  key={opt.label}
                  type="button"
                  size="sm"
                  variant={isActive ? 'default' : 'outline'}
                  onClick={() => setRadiusFilterKm(opt.value)}
                  className={
                    'rounded-full px-3 py-1 text-xs ' +
                    (isActive
                      ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50')
                  }
                >
                  {opt.label}
                </Button>
              )
            })}
          </div>
        </div>

        {/* More filters button */}
        <div className="w-full flex justify-center pt-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setShowMoreFilters(!showMoreFilters)}
            className="px-6 py-2 text-sm text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            {showMoreFilters ? 'Hide filters' : 'More filters'}
          </Button>
        </div>
      </div>
    </div>
  )
}
