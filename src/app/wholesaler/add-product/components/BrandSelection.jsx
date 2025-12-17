"use client";

import { useState } from 'react';
import { FaSearch, FaArrowRight } from 'react-icons/fa';
import ig from '../../../../assets/fonts/ic_neo.png';

const BrandSelection = ({ brands = [], loadingBrands, selectedBrand, onBrandSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 border-b border-gray-200 pb-2 lg:border-none">
          <FaArrowRight className="text-gray-700 text-lg" />
          <h3 className="text-md font-semibold text-gray-800 ml-2">انتخاب برند محصول:</h3>
        </div>
        <div className="relative w-full lg:w-96">
          <input
            type="text"
            placeholder="جستجوی برند..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 py-3 pl-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="overflow-x-auto">
        {loadingBrands ? (
          <div className="text-center py-8 text-gray-500">در حال بارگذاری برندها...</div>
        ) : filteredBrands.length === 0 ? (
          <div className="text-center py-8 text-gray-500">برندی یافت نشد</div>
        ) : (
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 text-center text-xs font-medium text-gray-500 uppercase rounded-tr-lg">
                  انتخاب
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  نام برند
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  تعداد کلی
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase rounded-tl-lg">
                  مبلغ کلی
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBrands.map((brand) => (
                <tr
                  key={brand.id}
                  className={`hover:bg-gray-50 cursor-pointer transition ${
                    selectedBrand?.id === brand.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => onBrandSelect(brand)}
                >
                  <td className="px-6 py-4 text-center">
                    <input
                      type="radio"
                      checked={selectedBrand?.id === brand.id}
                      readOnly
                      className="w-5 h-5 text-blue-600"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={ig.src} alt={brand.name} className="h-10 w-14 rounded bg-gray-100 p-1" />
                      <span className="font-semibold text-gray-900">{brand.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500">-</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500">-</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default BrandSelection;