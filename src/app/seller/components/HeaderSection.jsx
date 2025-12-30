"use client";

import Image from "next/image";
import logo from "../../../assets/fonts/LOGO_SVG.svg";

const HeaderSection = () => (
  <div className="text-center mb-8 flex-col justify-center items-center">
    <div className="flex justify-center items-center">
      <Image src={logo} alt="logo" width={60} height={60} />
    </div>
    <h1 className="text-2xl font-semibold mt-2 text-gray-900 mb-3">
       جستجوی محصولی که نیاز داری !
    </h1>
    <p className="text-gray-600 text-md font-light max-w-xl mx-auto">
      محصول مورد نظر خود را جستجو کنید، قیمت‌ها را مقایسه کرده و مستقیماً با فروشندگان ارتباط بگیرید
    </p>
  </div>
);

export default HeaderSection;