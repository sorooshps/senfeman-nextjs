"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FaPhone, FaCalendarAlt, FaCheck, FaTruck, FaShoppingCart, FaWarehouse } from "react-icons/fa";
import { IoCarSportOutline } from "react-icons/io5";
import { RiMotorbikeFill } from "react-icons/ri";
import { GiCartwheel } from "react-icons/gi";
import { MdElevator } from "react-icons/md";

// Helper function to convert English digits to Persian
const toPersianDigits = (str) => {
  if (!str) return "";
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.toString().replace(/\d/g, (digit) => persianDigits[digit]);
};

// Helper function to extract plate parts
const extractPlateParts = (plateString) => {
  if (!plateString) return { left: "", letter: "", right: "", cityCode: "" };
  
  // Remove any spaces or special characters
  const cleanPlate = plateString.replace(/\s/g, '');
  
  // Extract Persian letter (non-digit, non-english character)
  const persianLettersRegex = /[\u0600-\u06FF]/;
  const letterMatch = cleanPlate.match(persianLettersRegex);
  const letter = letterMatch ? letterMatch[0] : "";
  
  // Extract all digits (english and persian)
  const allDigits = cleanPlate.replace(persianLettersRegex, '');
  
  // Convert any Persian digits in the string to English for easier processing
  const englishDigits = allDigits.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
  
  // Based on Iranian plate format: usually 2 digits, letter, 3 digits, 2 digits (city code)
  let left = "";
  let right = "";
  let cityCode = "";
  
  if (englishDigits.length >= 7) {
    // If we have at least 7 digits (2+3+2)
    left = englishDigits.slice(0, 2);
    right = englishDigits.slice(2, 5);
    cityCode = englishDigits.slice(5, 7);
  } else if (englishDigits.length >= 5) {
    // If we have at least 5 digits (assume 2+3)
    left = englishDigits.slice(0, 2);
    right = englishDigits.slice(2, 5);
    cityCode = englishDigits.length > 5 ? englishDigits.slice(5) : "11"; // Default city code
  } else {
    // Fallback: try to split whatever we have
    left = englishDigits.slice(0, Math.min(2, englishDigits.length));
    right = englishDigits.slice(2, Math.min(5, englishDigits.length));
    cityCode = englishDigits.slice(5, 7) || "11";
  }
  
  // Convert back to Persian digits
  return {
    left: toPersianDigits(left),
    letter: letter,
    right: toPersianDigits(right),
    cityCode: toPersianDigits(cityCode)
  };
};

// IranLicensePlate Component
const IranLicensePlate = ({ left = "۱۲", letter = "ب", right = "۳۴۵", cityCode = "۱۱", className = "" }) => {
  return (
    <div
      className={`inline-flex items-center bg-white border-[3px] sm:border-4 border-black rounded-md shadow-[0_2px_6px_rgba(0,0,0,0.25)] w-[160px] h-[40px] sm:w-[220px] sm:h-[55px] lg:w-[260px] lg:h-[64px] ${className}`}
      aria-label="Iran license plate"
      dir="ltr"
    >
      {/* Blue IR strip */}
      <div className="relative flex flex-col items-center justify-between bg-blue-700 text-white h-full w-[30px] sm:w-[44px] lg:w-[46px] py-1 sm:py-1.5 lg:py-2">
        {/* Iran flag */}
        <div className="w-[16px] sm:w-[20px] lg:w-[22px] h-[10px] sm:h-[12px] lg:h-[14px] border border-white overflow-hidden">
          <div className="h-1/3 bg-green-600" />
          <div className="h-1/3 bg-white" />
          <div className="h-1/3 bg-red-600" />
        </div>

        {/* Text bottom */}
        <div className="flex flex-col items-center leading-none">
          <span className="text-[7px] sm:text-[8px] lg:text-[9px] tracking-wide">I.R</span>
          <span className="text-[7px] sm:text-[8px] lg:text-[9px] tracking-wide">IRAN</span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 h-full flex items-center justify-center">
        <div
          className="grid grid-cols-[auto_auto_auto] items-center gap-1 sm:gap-1.5 lg:gap-2 px-1.5 sm:px-2 lg:px-3 font-extrabold text-black"
          // style={{ fontFamily: 'Vazirmatn, IRANSans, system-ui, sans-serif' }}
        >
          <span className="text-[14px] sm:text-[18px] lg:text-[20px] leading-none">{left}</span>
          <span className="text-[16px] sm:text-[20px] lg:text-[24px] leading-none px-0.5 sm:px-1">{letter}</span>
          <span className="text-[14px] sm:text-[18px] lg:text-[20px] leading-none">{right}</span>
        </div>
      </div>

      {/* City code */}
      <div className="flex items-center justify-center h-full border-l-[3px] sm:border-l-4 border-black w-[28px] sm:w-[40px] lg:w-[44px]">
        <span
          className="font-extrabold text-[12px] sm:text-[16px] lg:text-[18px]"
          // style={{ fontFamily: 'Vazirmatn, IRANSans, system-ui, sans-serif' }}
        >
          {cityCode}
        </span>
      </div>
    </div>
  );
};

const ServiceProviderCard = ({ provider, type = "motorcycle" }) => {
  const [imageError, setImageError] = useState(false);
  
  // تعیین آیکون بر اساس نوع سرویس
  const getServiceIcon = () => {
    switch(type) {
      case "motorcycle":
        return <RiMotorbikeFill className="text-blue-600" size={24} />;
      case "van":
        return <FaTruck className="text-green-600" size={24} />;
      case "cart":
        return <GiCartwheel className="text-orange-600" size={24} />;
      case "lift":
        return <MdElevator className="text-purple-600" size={24} />;
      default:
        return <IoCarSportOutline className="text-gray-600" size={24} />;
    }
  };
  
  // تعیین عنوان سرویس
  const getServiceTitle = () => {
    switch(type) {
      case "motorcycle":
        return "پیک موتور";
      case "van":
        return "وانت";
      case "cart":
        return "چرخی";
      case "lift":
        return "بالابر";
      default:
        return "سرویس";
    }
  };
  
  // Extract plate data
  const plateData = extractPlateParts(provider.motorcycle_plate || provider.vehicle_plate);
  
  // ساختار اطلاعات سرویس دهنده
  const providerInfo = {
    name: `${provider.first_name} ${provider.last_name}`,
    contact: provider.mobile_number,
    workingHours: provider.working_days_hours,
    image: provider.face_image_url,
    ...provider
  };
  
  // ویژگی‌های سرویس (checkbox ها)
  const getServiceFeatures = () => {
    const features = [];
    
    switch(type) {
      case "motorcycle":
        if (provider.home_to_intersection) features.push("خونه من به سه راه");
        if (provider.available_on_load) features.push("هروقت بار بخوره");
        if (provider.personal_tasks) features.push("کار شخصی");
        break;
      case "van":
        if (provider.home_to_intersection) features.push("خونه من به سه راه");
        if (provider.available_on_load) features.push("هروقت بار بخوره");
        if (provider.personal_tasks) features.push("کار شخصی");
        if (provider.has_lift) features.push("بالابر دارم");
        if (provider.working_area_display) features.push(provider.working_area_display);
        break;
      case "cart":
        if (provider.personal_tasks_without_cart) features.push("کار بدون چرخ");
        if (provider.always_available) features.push("همیشه در دسترس");
        if (provider.lifting_tasks) features.push("بالابری");
        if (provider.nationality) features.push(`ملیت: ${provider.nationality}`);
        break;
      case "lift":
        if (provider.moving_tasks) features.push("اسباب کشی");
        if (provider.always_available) features.push("همیشه در دسترس");
        if (provider.nationality) features.push(`ملیت: ${provider.nationality}`);
        break;
    }
    
    return features;
  };
  
  const features = getServiceFeatures();

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:border-blue-300 overflow-hidden group">
      {/* هدر کارت */}
      <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {getServiceIcon()}
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{providerInfo.name}</h3>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {getServiceTitle()}
              </span>
            </div>
          </div>
          
          {/* پلاک */}
          {(provider.motorcycle_plate || provider.vehicle_plate) && (
            <div className="self-center sm:self-auto">
              <IranLicensePlate
                left={plateData.left}
                letter={plateData.letter}
                right={plateData.right}
                cityCode={plateData.cityCode}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* بدنه کارت */}
      <div className="p-5">
        <div className="flex flex-col md:flex-row gap-5">
          {/* عکس پروفایل */}
          <div className="md:w-1/3 flex justify-center">
            <div className="relative w-32 h-32 rounded-xl overflow-hidden border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300">
              {providerInfo.image && !imageError ? (
                <Image
                  src={providerInfo.image}
                  alt={providerInfo.name}
                  fill
                  className="object-cover"
                  onError={() => setImageError(true)}
                  sizes="(max-width: 128px) 100vw, 128px"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <span className="text-gray-500 text-4xl font-bold">
                    {providerInfo.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* اطلاعات */}
          <div className="md:w-2/3 space-y-4">
            {/* اطلاعات تماس */}
            <div className="space-y-3">
              {providerInfo.contact && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FaPhone className="text-green-600" />
                  <a 
                    href={`tel:${providerInfo.contact}`}
                    className="text-gray-800 hover:text-blue-600 transition-colors font-medium"
                  >
                    {toPersianDigits(providerInfo.contact)}
                  </a>
                  <span className="mr-auto text-xs text-gray-500 bg-green-100 text-green-800 px-2 py-1 rounded">
                    تماس مستقیم
                  </span>
                </div>
              )}
              
              {providerInfo.workingHours && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <FaCalendarAlt className="text-blue-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">ساعت‌های کاری:</p>
                    <p className="text-gray-800 font-medium">{providerInfo.workingHours}</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* ویژگی‌ها */}
            {features.length > 0 && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-sm text-gray-600 mb-2">ویژگی‌های خدمات:</p>
                <div className="flex flex-wrap gap-2">
                  {features.map((feature, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full"
                    >
                      <FaCheck size={10} />
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* فوتر کارت */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            عضو از {new Date(provider.created_at).toLocaleDateString('fa-IR')}
          </span>
          <button className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
            <FaPhone size={14} />
            درخواست سرویس
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceProviderCard;
























// "use client";

// import React, { useState } from "react";
// import Image from "next/image";
// import { FaPhone, FaCalendarAlt, FaCheck, FaMotorcycle, FaTruck, FaShoppingCart, FaWarehouse } from "react-icons/fa";
// import { IoCarSportOutline } from "react-icons/io5";
// import { RiMotorbikeFill } from "react-icons/ri";
// import { GiCartwheel } from "react-icons/gi";
// import { MdElevator } from "react-icons/md";

// const ServiceProviderCard = ({ provider, type = "motorcycle" }) => {
//   const [imageError, setImageError] = useState(false);
  
//   // تعیین آیکون بر اساس نوع سرویس
//   const getServiceIcon = () => {
//     switch(type) {
//       case "motorcycle":
//         return <RiMotorbikeFill className="text-blue-600" size={24} />;
//       case "van":
//         return <FaTruck className="text-green-600" size={24} />;
//       case "cart":
//         return <GiCartwheel className="text-orange-600" size={24} />;
//       case "lift":
//         return <MdElevator className="text-purple-600" size={24} />;
//       default:
//         return <IoCarSportOutline className="text-gray-600" size={24} />;
//     }
//   };
  
//   // تعیین عنوان سرویس
//   const getServiceTitle = () => {
//     switch(type) {
//       case "motorcycle":
//         return "پیک موتور";
//       case "van":
//         return "وانت";
//       case "cart":
//         return "چرخی";
//       case "lift":
//         return "بالابر";
//       default:
//         return "سرویس";
//     }
//   };
  
//   // ساختار اطلاعات سرویس دهنده
//   const providerInfo = {
//     name: `${provider.first_name} ${provider.last_name}`,
//     contact: provider.mobile_number,
//     workingHours: provider.working_days_hours,
//     image: provider.face_image_url,
//     ...provider
//   };
  
//   // ویژگی‌های سرویس (checkbox ها)
//   const getServiceFeatures = () => {
//     const features = [];
    
//     switch(type) {
//       case "motorcycle":
//         if (provider.home_to_intersection) features.push("خونه من به سه راه");
//         if (provider.available_on_load) features.push("هروقت بار بخوره");
//         if (provider.personal_tasks) features.push("کار شخصی");
//         break;
//       case "van":
//         if (provider.home_to_intersection) features.push("خونه من به سه راه");
//         if (provider.available_on_load) features.push("هروقت بار بخوره");
//         if (provider.personal_tasks) features.push("کار شخصی");
//         if (provider.has_lift) features.push("بالابر دارم");
//         if (provider.working_area_display) features.push(provider.working_area_display);
//         break;
//       case "cart":
//         if (provider.personal_tasks_without_cart) features.push("کار بدون چرخ");
//         if (provider.always_available) features.push("همیشه در دسترس");
//         if (provider.lifting_tasks) features.push("بالابری");
//         if (provider.nationality) features.push(`ملیت: ${provider.nationality}`);
//         break;
//       case "lift":
//         if (provider.moving_tasks) features.push("اسباب کشی");
//         if (provider.always_available) features.push("همیشه در دسترس");
//         if (provider.nationality) features.push(`ملیت: ${provider.nationality}`);
//         break;
//     }
    
//     return features;
//   };
  
//   const features = getServiceFeatures();

//   return (
//     <div className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:border-blue-300 overflow-hidden group">
//       {/* هدر کارت */}
//       <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             {getServiceIcon()}
//             <div>
//               <h3 className="font-bold text-gray-900 text-lg">{providerInfo.name}</h3>
//               <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
//                 {getServiceTitle()}
//               </span>
//             </div>
//           </div>
          
//           {/* پلاک یا شناسه */}
//           {(provider.motorcycle_plate || provider.vehicle_plate) && (
//             <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-mono text-sm font-bold">
//               {provider.motorcycle_plate || provider.vehicle_plate}
//             </div>
//           )}
//         </div>
//       </div>
      
//       {/* بدنه کارت */}
//       <div className="p-5">
//         <div className="flex flex-col md:flex-row gap-5">
//           {/* عکس پروفایل */}
//           <div className="md:w-1/3 flex justify-center">
//             <div className="relative w-32 h-32 rounded-xl overflow-hidden border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300">
//               {providerInfo.image && !imageError ? (
//                 <Image
//                   src={providerInfo.image}
//                   alt={providerInfo.name}
//                   fill
//                   className="object-cover"
//                   onError={() => setImageError(true)}
//                   sizes="(max-width: 128px) 100vw, 128px"
//                 />
//               ) : (
//                 <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
//                   <span className="text-gray-500 text-4xl font-bold">
//                     {providerInfo.name.charAt(0)}
//                   </span>
//                 </div>
//               )}
//             </div>
//           </div>
          
//           {/* اطلاعات */}
//           <div className="md:w-2/3 space-y-4">
//             {/* اطلاعات تماس */}
//             <div className="space-y-3">
//               {providerInfo.contact && (
//                 <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
//                   <FaPhone className="text-green-600" />
//                   <a 
//                     href={`tel:${providerInfo.contact}`}
//                     className="text-gray-800 hover:text-blue-600 transition-colors font-medium"
//                   >
//                     {providerInfo.contact}
//                   </a>
//                   <span className="mr-auto text-xs text-gray-500 bg-green-100 text-green-800 px-2 py-1 rounded">
//                     تماس مستقیم
//                   </span>
//                 </div>
//               )}
              
//               {providerInfo.workingHours && (
//                 <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
//                   <FaCalendarAlt className="text-blue-600 mt-1" />
//                   <div>
//                     <p className="text-sm text-gray-600 mb-1">ساعت‌های کاری:</p>
//                     <p className="text-gray-800 font-medium">{providerInfo.workingHours}</p>
//                   </div>
//                 </div>
//               )}
//             </div>
            
//             {/* ویژگی‌ها */}
//             {features.length > 0 && (
//               <div className="pt-3 border-t border-gray-100">
//                 <p className="text-sm text-gray-600 mb-2">ویژگی‌های خدمات:</p>
//                 <div className="flex flex-wrap gap-2">
//                   {features.map((feature, index) => (
//                     <span 
//                       key={index}
//                       className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full"
//                     >
//                       <FaCheck size={10} />
//                       {feature}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
      
//       {/* فوتر کارت */}
//       <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
//         <div className="flex items-center justify-between">
//           <span className="text-xs text-gray-500">
//             عضو از {new Date(provider.created_at).toLocaleDateString('fa-IR')}
//           </span>
//           <button className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
//             <FaPhone size={14} />
//             درخواست سرویس
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ServiceProviderCard;