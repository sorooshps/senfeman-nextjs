import React from 'react';
import { FaVectorSquare, FaChevronLeft, FaArrowRight } from 'react-icons/fa6';
import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir='rtl'>
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/auth/information" className="p-2 text-gray-600">
            <FaArrowRight className="text-lg" />
          </Link>
          <h1 className="text-lg font-bold text-gray-900">پلن های ما</h1>
          <div className="w-8"></div>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="lg:hidden bg-gray-50 flex-1 px-4 py-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">سطح حساب کاربری خود را انتخاب کنید:</h2>
          <p className="text-sm text-gray-500">متناسب با نیاز خود یک حساب کاربری را انتخاب کنید</p>
        </div>

        <div className="space-y-3 mb-8">
          {/* Simple Plan */}
          <label className="block bg-white border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition duration-150 ease-in-out overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="pricingPlan"
                  value="simple"
                  className="form-radio h-5 w-5 text-green-500 border-gray-300 focus:ring-green-400"
                  defaultChecked
                />
                <span className="font-semibold text-gray-800">پلن ساده</span>
                <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-0.5 rounded-full">رایگان</span>
              </div>
              <span className="text-gray-800 font-semibold">رایگان</span>
            </div>
            <div className="p-4">
              <p className="text-xs text-gray-600 font-light">
                مناسب برای شروع، بدون هزینه ثبت‌نام کن قیمت‌ها رو ببین و با چند فروشنده ارتباط بگیر امکانات پایه برای بررسی بازار
              </p>
            </div>
          </label>

          {/* Professional Plan */}
          <label className="block bg-white border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition duration-150 ease-in-out overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="pricingPlan"
                  value="professional"
                  className="form-radio h-5 w-5 text-green-500 border-gray-300 focus:ring-green-400"
                />
                <span className="font-semibold text-gray-800">پلن حرفه‌ای</span>
                <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-0.5 rounded-full">۲ ماهه</span>
              </div>
              <div className="text-left">
                <span className="block text-gray-800 font-semibold">۴/۰۰۰/۰۰۰</span>
                <span className="block text-xs text-gray-500">تومان</span>
              </div>
            </div>
            <div className="p-4">
              <p className="text-xs text-gray-600 font-extralight leading-relaxed">
                مناسب برای شروع، بدون هزینه ثبت‌نام کن قیمت‌ها رو ببین و با چند فروشنده ارتباط بگیر امکانات پایه برای بررسی بازار
              </p>
            </div>
          </label>

          {/* All-inclusive Plan */}
          <label className="block bg-white border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition duration-150 ease-in-out overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="pricingPlan"
                  value="allInclusive"
                  className="form-radio h-5 w-5 text-green-500 border-gray-300 focus:ring-green-400"
                />
                <span className="font-semibold text-gray-800">پلن همه کاره</span>
                <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-0.5 rounded-full">۲ ماهه</span>
              </div>
              <div className="text-left">
                <span className="block text-gray-800 font-semibold">۴/۰۰۰/۰۰۰</span>
                <span className="block text-xs text-gray-500">تومان</span>
              </div>
            </div>
            <div className="p-4">
              <p className="text-xs text-gray-600 leading-relaxed">
                مناسب برای شروع، بدون هزینه ثبت‌نام کن قیمت‌ها رو ببین و با چند فروشنده ارتباط بگیر امکانات پایه برای بررسی بازار
              </p>
            </div>
          </label>
        </div>

        <div className="flex items-center bg-green-50 text-green-700 p-3 rounded-lg text-sm mb-8">
          <FaVectorSquare className="h-5 w-5 ml-2"/>
          <span className="font-medium text-sm">بابت ماهانه اشتراک، امکان لغو پلن در هر زمان وجود دارد.</span>
        </div>

        {/* Mobile Fixed Button */}
        <div className="bottom-0 left-0 right-0 mb-8 bg-white border-t border-gray-200 p-4">
          <Link href="/wholesaler/dashboard" className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition duration-150 ease-in-out block text-center">
            تایید پلن و ورود
          </Link>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden lg:flex lg:bg-gradient-to-br lg:from-blue-50 lg:to-gray-100 flex-1 items-center justify-center py-12">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full mx-4">
          <div className="flex justify-between border-b border-gray-300 py-3 items-center mb-6">
            <Link href="/auth/information" className="p-2 rounded-xl hover:bg-gray-50 transition-all duration-200">
              <FaChevronLeft className="text-gray-600 text-lg" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">پلن های ما</h1>
            <div className="w-8"></div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">سطح حساب کاربری خود را انتخاب کنید:</h2>
            <p className="text-sm text-gray-500">متناسب با نیاز خود یک حساب کاربری را انتخاب کنید</p>
          </div>

          <div className="space-y-4 mb-8">
            {/* Simple Plan */}
            <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition duration-150 ease-in-out">
              <input
                type="radio"
                name="pricingPlan"
                value="simple"
                className="form-radio h-5 w-5 text-green-500 border-gray-300 focus:ring-green-400"
                defaultChecked
              />
              <div className="mr-4 flex-grow">
                <div className="flex items-center mb-1">
                  <span className="font-semibold text-gray-800 ml-2">پلن ساده</span>
                  <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-0.5 rounded-full">رایگان</span>
                </div>
                <p className="text-sm text-gray-600">
                  مناسب برای شروع، بدون هزینه ثبت‌نام کن قیمت‌ها رو ببین و با چند فروشنده ارتباط بگیر امکانات پایه برای بررسی بازار
                </p>
              </div>
              <span className="text-sm text-gray-500">رایگان</span>
            </label>

            {/* Professional Plan */}
            <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition duration-150 ease-in-out">
              <input
                type="radio"
                name="pricingPlan"
                value="professional"
                className="form-radio h-5 w-5 text-green-500 border-gray-300 focus:ring-green-400"
              />
              <div className="mr-4 flex-grow">
                <div className="flex items-center mb-1">
                  <span className="font-semibold text-gray-800 ml-2">پلن حرفه‌ای</span>
                  <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-0.5 rounded-full">۲ ماهه</span>
                </div>
                <p className="text-sm text-gray-600">
                  مناسب برای شروع، بدون هزینه ثبت‌نام کن قیمت‌ها رو ببین و با چند فروشنده ارتباط بگیر امکانات پایه برای بررسی بازار
                </p>
              </div>
              <div className="text-left">
                <span className="block text-gray-800 font-semibold">۴/۰۰۰/۰۰۰</span>
                <span className="block text-xs text-gray-500">تومان</span>
              </div>
            </label>

            {/* All-inclusive Plan */}
            <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition duration-150 ease-in-out">
              <input
                type="radio"
                name="pricingPlan"
                value="allInclusive"
                className="form-radio h-5 w-5 text-green-500 border-gray-300 focus:ring-green-400"
              />
              <div className="mr-4 flex-grow">
                <div className="flex items-center mb-1">
                  <span className="font-semibold text-gray-800 ml-2">پلن همه کاره</span>
                  <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-0.5 rounded-full">۲ ماهه</span>
                </div>
                <p className="text-sm text-gray-600">
                  مناسب برای شروع، بدون هزینه ثبت‌نام کن قیمت‌ها رو ببین و با چند فروشنده ارتباط بگیر امکانات پایه برای بررسی بازار
                </p>
              </div>
              <div className="text-left">
                <span className="block text-gray-800 font-semibold">۴/۰۰۰/۰۰۰</span>
                <span className="block text-xs text-gray-500">تومان</span>
              </div>
            </label>
          </div>

          <div className="flex items-center bg-green-50 text-green-700 p-3 rounded-lg text-sm mb-8">
            <FaVectorSquare className="h-5 w-5 ml-2"/>
            <span className="font-medium">بابت ماهانه اشتراک، امکان لغو پلن در هر زمان وجود دارد.</span>
          </div>

          <Link href="/wholesaler/dashboard" className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition duration-150 ease-in-out block text-center">
            تایید پلن و ورود
          </Link>
        </div>
      </div>
    </div>
  );
}