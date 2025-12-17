// "use client";

// import React, { useState, useRef, useEffect } from "react";
// import { FaChevronRight, FaCheck, FaChevronLeft } from "react-icons/fa";
// import { useRouter } from "next/navigation";
// import { sendOtp, verifyOtp } from "../../../api";
// import Link from "next/link";
// export default function LoginPage() {
//   const [currentStep, setCurrentStep] = useState(1);
//   const [phoneNumber, setPhoneNumber] = useState("");
//   const [otpDigits, setOtpDigits] = useState(["", "", "", "", ""]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [countdown, setCountdown] = useState(0);
//   const otpRefs = useRef([]);
//   const router = useRouter();
//   const timerRef = useRef(null);

//   const otpCode = otpDigits.join("");

//   // Start countdown timer for OTP resend
//   const startCountdown = () => {
//     // Clear any existing timer
//     if (timerRef.current) clearInterval(timerRef.current);
    
//     // Set initial countdown to 60 seconds
//     setCountdown(60);
    
//     // Start the timer
//     timerRef.current = setInterval(() => {
//       setCountdown(prev => {
//         if (prev <= 1) {
//           clearInterval(timerRef.current);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);
//   };

//   // Clean up timer on unmount
//   useEffect(() => {
//     return () => {
//       if (timerRef.current) clearInterval(timerRef.current);
//     };
//   }, []);

//   const handleSendOtp = async () => {
//     // Validate phone number format (Iran mobile format)
//     if (!phoneNumber || phoneNumber.length !== 11 || !phoneNumber.startsWith('09')) {
//       setError("لطفا شماره موبایل معتبر وارد کنید");
//       return;
//     }
    
//     setLoading(true);
//     setError("");
//     try {
//       const data = await sendOtp(phoneNumber);
//       if (data.err === false) {
//         setCurrentStep(2);
//         // Start countdown for resend button
//         startCountdown();
//         // Focus on first OTP input after transition
//         setTimeout(() => otpRefs.current[0]?.focus(), 300);
//       } else {
//         setError(data.msg || "خطا در ارسال کد تایید");
//       }
//     } catch (err) {
//       console.error("OTP send error:", err);
//       setError("خطای شبکه. لطفا اتصال اینترنت خود را بررسی کنید");
//     }
//     setLoading(false);
//   };
  
//   // Handle resend OTP
//   const handleResendOtp = async () => {
//     if (countdown > 0) return;
    
//     setLoading(true);
//     setError("");
//     try {
//       const data = await sendOtp(phoneNumber);
//       if (data.err === false) {
//         // Start countdown again
//         startCountdown();
//         setError("");
//       } else {
//         setError(data.msg || "خطا در ارسال مجدد کد تایید");
//       }
//     } catch (err) {
//       console.error("OTP resend error:", err);
//       setError("خطای شبکه. لطفا اتصال اینترنت خود را بررسی کنید");
//     }
//     setLoading(false);
//   };

//   const handleVerifyOtp = async () => {
//     if (otpCode.length !== 5) return;
//     setLoading(true);
//     setError("");
//     try {
//       const data = await verifyOtp(phoneNumber, otpCode);
//       if (data.access || data.access_token) {
//         localStorage.setItem("access", data.access || data.access_token);
//         localStorage.setItem("refresh", data.refresh || data.refresh_token);
//         localStorage.setItem("user_id", data.user_id);
//         localStorage.setItem("phone", phoneNumber);
//         router.push("/auth/role-status");
//       } else {
//         setError(data.msg || 'کد تایید نامعتبر');
//       }
//     } catch (err) {
//       console.error("OTP verify error:", err);
//       setError("کد تایید نامعتبر یا خطای شبکه");
//     }
//     setLoading(false);
//   };

//   const handleOtpChange = (index, value) => {
//     // Only allow digits
//     const cleanValue = value.replace(/[^0-9]/g, '');
//     if (cleanValue.length > 1) {
//       // If pasting multiple digits, distribute them across inputs
//       const digits = cleanValue.split('');
//       const newDigits = [...otpDigits];
      
//       // Fill current and subsequent inputs
//       for (let i = 0; i < digits.length && index + i < 5; i++) {
//         newDigits[index + i] = digits[i];
//       }
      
//       setOtpDigits(newDigits);
      
//       // Focus on appropriate field after paste
//       const nextIndex = Math.min(index + digits.length, 4);
//       if (nextIndex < 5) {
//         otpRefs.current[nextIndex]?.focus();
//       }
//     } else {
//       // Normal single digit input
//       const newDigits = [...otpDigits];
//       newDigits[index] = cleanValue;
//       setOtpDigits(newDigits);
      
//       // Auto-advance to next input
//       if (cleanValue && index < 4) {
//         otpRefs.current[index + 1]?.focus();
//       }
//     }
//   };
  
//   // Handle backspace to go to previous input
//   const handleKeyDown = (index, e) => {
//     if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
//       otpRefs.current[index - 1]?.focus();
//     }
//   };

//   return (
//     <div dir="rtl" className="min-h-screen bg-gray-50 flex flex-col font-custom">
//       {/* Mobile Header */}
//       <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-4">
//         <div className="flex items-center">
//           <Link href="/" className="p-2 text-gray-600">
//             <FaChevronLeft className="text-lg" />
//           </Link>
//           <h1 className="text-lg font-bold text-gray-900 mr-4">ورود / ثبت نام</h1>
//         </div>
//       </div>

//       {/* Mobile Content */}
//       <div className="lg:hidden bg-white flex-1 px-4 py-6">
//         {currentStep === 1 ? (
//           <div className="space-y-6">
//             {/* Step 1 Content */}
//             <div className="mb-6">
//               <p className="text-[18px] text-gray-800">
//                 شماره موبایل خود را وارد نمایید
//               </p>
//             </div>

//             <div className="space-y-3">
//               <label className="block text-sm font-medium text-gray-500 mb-1">
//                 لطفا برای ورود یا ثبت نام شماره موبایل خود را وارد نمایید
//               </label>
//               <input
//                 type="tel"
//                 value={phoneNumber}
//                 onChange={(e) => {
//                   // Only allow digits and limit to 11 characters (Iran mobile format)
//                   const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
//                   setPhoneNumber(value);
//                 }}
//                 placeholder="شماره موبایل"
//                 className={`w-full bg-gray-50 rounded-xl py-4 px-4 text-sm placeholder-gray-500 border-2 ${error ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:border-blue-500`}
//                 dir="ltr"
//                 inputMode="numeric"
//               />
//             </div>

//             {/* Mobile Buttons */}
//             <div className="bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
//               <div className="flex gap-3">
//                 <button
//                   onClick={handleSendOtp}
//                   disabled={loading}
//                   className="flex-1 py-4 rounded-xl bg-linear-to-l from-blue-600 to-blue-700 text-white text-base font-semibold shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50"
//                 >
//                   {loading ? "در حال ارسال..." : "تایید"}
//                 </button>
//               </div>
//             </div>
//             {error && (
//               <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
//                 <p className="text-red-600 text-sm text-center">{error}</p>
//               </div>
//             )}
//           </div>
//         ) : (
//           <div className="space-y-6 pb-20">
//             {/* Step 2 Content */}
//             <div className="">
//               <h3 className="text-lg font-bold text-gray-900 mb-2">کد تایید را وارد نمایید</h3>
//             </div>

//             {/* Code Input Section */}
//             <div className="space-y-4">
//               <label className="text-sm font-medium text-gray-700 block">
//                 کد پیامک شده به شماره {phoneNumber || "۰۹۱۳۴۵۶۷۸۹"} را وارد نمایید
//               </label>
//               <div className="flex gap-2 justify-between">
//                 {[1, 2, 3, 4, 5].map((item) => (
//                   <input
//                     key={item}
//                     type="text"
//                     maxLength={1}
//                     value={otpDigits[item - 1]}
//                     onChange={(e) => handleOtpChange(item - 1, e.target.value)}
//                     onKeyDown={(e) => handleKeyDown(item - 1, e)}
//                     onPaste={(e) => {
//                       e.preventDefault();
//                       const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 5);
//                       if (pasteData) {
//                         const newDigits = [...otpDigits];
//                         for (let i = 0; i < pasteData.length && i < 5; i++) {
//                           newDigits[i] = pasteData[i];
//                         }
//                         setOtpDigits(newDigits);
//                         if (pasteData.length === 5) {
//                           setTimeout(() => handleVerifyOtp(), 300);
//                         }
//                       }
//                     }}
//                     ref={(el) => (otpRefs.current[item - 1] = el)}
//                     className="w-12 h-12 bg-gray-50 rounded-xl text-sm border-2 border-gray-200 focus:outline-none focus:border-blue-500 transition-all duration-200 text-center font-bold"
//                     dir="ltr"
//                     inputMode="numeric"
//                   />
//                 ))}
//               </div>
//             </div>

//             {/* Resend Code Section */}
//             <div className="text-center space-y-4">
//               <div className="flex items-center justify-center gap-2 text-xs">
//                 <button
//                   type="button"
//                   onClick={handleResendOtp}
//                   disabled={countdown > 0}
//                   className={`font-medium transition-colors ${countdown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-700'}`}
//                 >
//                   دریافت مجدد کد ورود
//                 </button>
//                 {countdown > 0 && (
//                   <span className="text-gray-500 font-medium">
//                     ({countdown} ثانیه باقی مانده)
//                   </span>
//                 )}
//               </div>

//               <div className="flex items-center justify-center">
//                 <button
//                   type="button"
//                   onClick={() => setCurrentStep(1)}
//                   className="text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors flex items-center gap-1 bg-blue-50 rounded-xl px-4 py-2"
//                 >
//                   ویرایش شماره موبایل
//                   <FaChevronLeft className="text-xs" />
//                 </button>
//               </div>
//             </div>

//             {/* Mobile Buttons for Step 2 */}
//             <div className="bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
//               <div className="flex gap-3">
//                 <button
//                   onClick={() => setCurrentStep(1)}
//                   className="flex-1 py-3 rounded-lg bg-gray-100 text-gray-700 text-base font-medium border border-gray-300 hover:bg-gray-200 transition-colors"
//                 >
//                   بازگشت
//                 </button>
//                 <button
//                   onClick={handleVerifyOtp}
//                   disabled={loading || otpCode.length !== 5}
//                   className="flex-2 py-4 rounded-lg bg-linear-to-l from-blue-600 to-blue-700 text-white text-base font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
//                 >
//                   {loading ? "در حال تایید..." : "تایید"}
//                 </button>
//               </div>
//             </div>
//             {error && (
//               <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
//                 <p className="text-red-600 text-sm text-center">{error}</p>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Desktop View */}
//       <div className="hidden lg:flex lg:bg-gradient-to-br lg:from-blue-50 lg:to-gray-100 flex-1 items-center justify-center py-12">
//         <div className="w-full max-w-[450px] mx-4">
//           <div
//             className="bg-white rounded-[12px] shadow-xl border border-gray-200/60 p-8"
//             style={{
//               borderWidth: '1.5px'
//             }}
//           >
//             {/* Header */}
//             <div className="flex items-center justify-between mb-6">
//               <Link href="/" className="p-2 rounded-xl hover:bg-gray-50 transition-all duration-200">
//                 <FaChevronRight className="text-gray-900 text-lg" />
//               </Link>
//               <div className="text-center flex-1">
//                 <h2 className="text-xl font-bold text-gray-900">
//                   ورود / ثبت نام
//                 </h2>
//               </div>
//             </div>

//             <div className="border-t border-gray-200/60 my-4" />

//             {/* Form Content */}
//             {currentStep === 1 ? (
//               <div className="space-y-6">
//                 <div className="mb-6">
//                   <p className="text-[18px] text-gray-800">
//                     شماره موبایل خود را وارد نمایید
//                   </p>
//                 </div>

//                 <div className="space-y-3">
//                   <label className="block text-sm font-medium text-gray-500 mb-1">لطفا برای ورود یا ثبت نام شماره موبایل خود را وارد نمایید</label>
//                   <input
//                     type="tel"
//                     value={phoneNumber}
//                     onChange={(e) => {
//                       // Only allow digits and limit to 11 characters (Iran mobile format)
//                       const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
//                       setPhoneNumber(value);
//                     }}
//                     placeholder="شماره موبایل"
//                     className={`w-full bg-gray-50 rounded-xl py-4 px-4 text-sm placeholder-gray-500 border-2 ${error ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:border-blue-500 transition-all duration-200`}
//                     dir="ltr"
//                     inputMode="numeric"
//                   />
//                 </div>

//                 <button
//                   onClick={handleSendOtp}
//                   disabled={loading}
//                   className="w-full py-4 rounded-xl bg-linear-to-l from-blue-600 to-blue-700 text-white text-base font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
//                 >
//                   {loading ? "در حال ارسال..." : "تایید"}
//                 </button>
//               </div>
//             ) : (
//               <div className="flex flex-col gap-6">
//                 {/* Header Section */}
//                 <div className="">
//                   <h3 className="text-lg font-bold text-gray-900 mb-5">کد تایید را وارد نمایید</h3>
//                 </div>

//                 {/* Code Input Section */}
//                 <div className="flex flex-col gap-4">
//                   <label className="text-sm font-medium text-gray-700 text-right">کد پیامک شده به شماره {phoneNumber || "۰۹۱۳۴۵۶۷۸۹"} را وارد نمایید</label>
//                   <div className="flex gap-2 justify-between">
//                     {[1, 2, 3, 4, 5].map((item) => (
//                       <input
//                         key={item}
//                         type="text"
//                         maxLength={1}
//                         value={otpDigits[item - 1]}
//                         onChange={(e) => handleOtpChange(item - 1, e.target.value)}
//                         onKeyDown={(e) => handleKeyDown(item - 1, e)}
//                         onPaste={(e) => {
//                           e.preventDefault();
//                           const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 5);
//                           if (pasteData) {
//                             const newDigits = [...otpDigits];
//                             for (let i = 0; i < pasteData.length && i < 5; i++) {
//                               newDigits[i] = pasteData[i];
//                             }
//                             setOtpDigits(newDigits);
//                             if (pasteData.length === 5) {
//                               setTimeout(() => handleVerifyOtp(), 300);
//                             }
//                           }
//                         }}
//                         ref={(el) => (otpRefs.current[item - 1] = el)}
//                         className="w-12 h-12 bg-gray-50 rounded-xl text-sm border-2 border-gray-200 focus:outline-none focus:border-blue-500 transition-all duration-200 text-center font-bold"
//                         dir="ltr"
//                         inputMode="numeric"
//                       />
//                     ))}
//                   </div>
//                 </div>

//                 {/* Resend Code Section */}
//                 <div className="text-center space-y-3">
//                   <div className="flex items-center justify-center gap-2 text-xs">
//                     <button
//                       type="button"
//                       onClick={handleResendOtp}
//                       disabled={countdown > 0}
//                       className={`font-medium transition-colors ${countdown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-700'}`}
//                     >
//                       دریافت مجدد کد ورود
//                     </button>
//                     {countdown > 0 && (
//                       <span className="text-gray-500 font-medium">
//                         ({countdown} ثانیه باقی مانده)
//                       </span>
//                     )}
//                   </div>
//                   <div className="flex items-center justify-center">
//                     <button
//                       type="button"
//                       onClick={() => setCurrentStep(1)}
//                       className="text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors flex items-center gap-1 bg-blue-50 rounded-xl px-4 py-2"
//                     >
//                       ویرایش شماره موبایل
//                       <FaChevronLeft className="text-xs" />
//                     </button>
//                   </div>
//                 </div>

//                 {/* Submit Button */}
//                 <button
//                   onClick={handleVerifyOtp}
//                   disabled={loading || otpCode.length !== 5}
//                   className="w-full py-4 rounded-xl bg-linear-to-l from-blue-600 to-blue-700 text-white text-base font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
//                 >
//                   <FaCheck className="text-white" />
//                   {loading ? "در حال تایید..." : "تایید"}
//                 </button>
//                 {error && (
//                   <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
//                     <p className="text-red-600 text-sm text-center">{error}</p>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

















"use client";

import React, { useState, useRef, useEffect } from "react";
import { FaChevronRight, FaCheck, FaChevronLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { sendOtp, verifyOtp } from "../../../api";
import Link from "next/link";

export default function LoginPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isOtpValid, setIsOtpValid] = useState(false);
  const [verificationCode, setVerificationCode] = useState(null);
  const otpInputRef = useRef(null);
  const otpContainerRef = useRef(null);
  const router = useRouter();
  const timerRef = useRef(null);

  // Start countdown timer for OTP resend
  const startCountdown = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    setCountdown(60);
    
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Check if OTP is complete
  useEffect(() => {
    setIsOtpValid(otp.length === 5);
    
    // Auto-verify when OTP is complete
    if (otp.length === 5) {
      setTimeout(() => {
        handleVerifyOtp();
      }, 300);
    }
  }, [otp]);

  // Focus OTP input when step changes
  useEffect(() => {
    if (currentStep === 2) {
      startCountdown();
      setTimeout(() => {
        otpInputRef.current?.focus();
        otpInputRef.current?.select();
      }, 300);
    }
  }, [currentStep]);

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length !== 11 || !phoneNumber.startsWith('09')) {
      setError("لطفا شماره موبایل معتبر وارد کنید");
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      const data = await sendOtp(phoneNumber);
      if (data.err === false) {
        setVerificationCode(data.code);
        setCurrentStep(2);
      } else {
        setError(data.msg || "خطا در ارسال کد تایید");
      }
    } catch (err) {
      console.error("OTP send error:", err);
      setError("خطای شبکه. لطفا اتصال اینترنت خود را بررسی کنید");
    }
    setLoading(false);
  };
  
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    setError("");
    try {
      const data = await sendOtp(phoneNumber);
      if (data.err === false) {
        startCountdown();
        setError("");
        // Clear OTP and refocus
        setOtp("");
        setTimeout(() => {
          otpInputRef.current?.focus();
          otpInputRef.current?.select();
        }, 100);
      } else {
        setError(data.msg || "خطا در ارسال مجدد کد تایید");
      }
    } catch (err) {
      console.error("OTP resend error:", err);
      setError("خطای شبکه. لطفا اتصال اینترنت خود را بررسی کنید");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 5) return;
    
    setLoading(true);
    setError("");
    try {
      const data = await verifyOtp(phoneNumber, otp);
      if (data.access || data.access_token) {
        localStorage.setItem("access", data.access || data.access_token);
        localStorage.setItem("refresh", data.refresh || data.refresh_token);
        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("phone", phoneNumber);
        
        // Redirect to next page
        router.push("/auth/role-status");
      } else {
        setError(data.msg || 'کد تایید نامعتبر');
        // Clear OTP on error
        setOtp("");
        setTimeout(() => {
          otpInputRef.current?.focus();
          otpInputRef.current?.select();
        }, 100);
      }
    } catch (err) {
      console.error("OTP verify error:", err);
      setError("کد تایید نامعتبر یا خطای شبکه");
      // Clear OTP on error
      setOtp("");
      setTimeout(() => {
        otpInputRef.current?.focus();
        otpInputRef.current?.select();
      }, 100);
    }
    setLoading(false);
  };

  const handleOtpChange = (e) => {
    // Only allow digits and limit to 5 characters
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 5);
    setOtp(value);
  };

  const handleOtpKeyDown = (e) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      // Allow default behavior
      return;
    }
    
    // Handle arrow keys - prevent default to keep cursor at end
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      // Move cursor to end
      setTimeout(() => {
        otpInputRef.current.selectionStart = otp.length;
        otpInputRef.current.selectionEnd = otp.length;
      }, 0);
    }
  };

  const handleOtpClick = () => {
    // Focus the input
    if (otpInputRef.current) {
      otpInputRef.current.focus();
      // Move cursor to end
      setTimeout(() => {
        otpInputRef.current.selectionStart = otp.length;
        otpInputRef.current.selectionEnd = otp.length;
      }, 0);
    }
  };

  const handleOtpFocus = () => {
    // Move cursor to end when input gets focus
    if (otpInputRef.current) {
      setTimeout(() => {
        otpInputRef.current.selectionStart = otp.length;
        otpInputRef.current.selectionEnd = otp.length;
      }, 0);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 5);
    if (pasteData) {
      setOtp(pasteData);
      setTimeout(() => {
        otpInputRef.current.selectionStart = pasteData.length;
        otpInputRef.current.selectionEnd = pasteData.length;
      }, 0);
    }
  };

  // Get border color for individual digit box
  const getDigitBoxClass = (index) => {
    const isFilled = index < otp.length;
    
    if (isOtpValid && isFilled) {
      return "border-green-500 bg-green-50";
    }
    if (isFilled) {
      return "border-blue-500 bg-blue-50";
    }
    // Show focused state on the box that would receive the next character
    if (index === otp.length && document.activeElement === otpInputRef.current) {
      return "border-blue-300";
    }
    return "border-gray-200";
  };

  // Get the digit at position, or empty string
  const getDigit = (index) => {
    return index < otp.length ? otp[index] : "";
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 flex flex-col font-custom">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center">
          <Link href="/" className="p-2 text-gray-600">
            <FaChevronLeft className="text-lg" />
          </Link>
          <h1 className="text-lg font-bold text-gray-900 mr-4">ورود / ثبت نام</h1>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="lg:hidden bg-white flex-1 px-4 py-6">
        {currentStep === 1 ? (
          <div className="space-y-6">
            <div className="mb-6">
              <p className="text-[18px] text-gray-800">
                شماره موبایل خود را وارد نمایید
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-500 mb-1">
                لطفا برای ورود یا ثبت نام شماره موبایل خود را وارد نمایید
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
                  setPhoneNumber(value);
                }}
                placeholder="شماره موبایل"
                className={`w-full bg-gray-50 rounded-xl py-4 px-4 text-sm placeholder-gray-500 border-2 ${error ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:border-blue-500`}
                dir="ltr"
                inputMode="numeric"
              />
            </div>

            <div className="bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
              <div className="flex gap-3">
                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="flex-1 py-4 rounded-xl bg-gradient-to-l from-blue-600 to-blue-700 text-white text-base font-semibold shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50"
                >
                  {loading ? "در حال ارسال..." : "تایید"}
                </button>
              </div>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 pb-20">
            <div className="">
              <h3 className="text-lg font-bold text-gray-900 mb-2">کد تایید را وارد نمایید</h3>
            </div>

            {/* Single OTP Input with Visual Boxes */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700 block">
                کد پیامک شده به شماره {phoneNumber || "۰۹۱۳۴۵۶۷۸۹"} را وارد نمایید
              </label>
              
              {/* Container for the OTP input and visual boxes */}
              <div 
                ref={otpContainerRef}
                className="relative w-full" 
                onClick={handleOtpClick}
                dir="ltr" 
              >
                {/* Transparent but visible input for typing - FIXED for mobile */}
                <input
                  ref={otpInputRef}
                  type="text"
                  value={otp}
                  onChange={handleOtpChange}
                  onKeyDown={handleOtpKeyDown}
                  onFocus={handleOtpFocus}
                  onPaste={handlePaste}
                  className="absolute top-0 left-0 w-full h-12 opacity-0 z-10 cursor-text text-transparent bg-transparent"
                  inputMode="numeric"
                  maxLength={5}
                  autoComplete="one-time-code"
                  dir="ltr"  
                  style={{
                    fontSize: '16px', // Prevents zoom on iOS
                    letterSpacing: '24px', // Spread out the characters
                    paddingLeft: '6px', // Adjust for proper positioning
                    textIndent: '6px', // Adjust for proper positioning
                  }}
                />
                
                {/* Visual boxes container */}
                <div className="flex gap-2 justify-between">
                  {[0, 1, 2, 3, 4].map((index) => (
                    <div
                      key={index}
                      className={`w-12 h-12 bg-gray-50 rounded-xl text-sm border-2 transition-all duration-200 text-center font-bold flex items-center justify-center ${getDigitBoxClass(index)}`}
                    >
                      <span className="text-gray-900 text-lg">
                        {getDigit(index)}
                      </span>
                      {/* Show cursor on the next empty box */}
                      {index === otp.length && document.activeElement === otpInputRef.current && (
                        <span className="ml-0.5 w-0.5 h-6 bg-blue-500 animate-pulse"></span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center space-y-4">
              {verificationCode && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-700 font-medium">کد تایید: <span className="text-lg font-bold">{verificationCode}</span></p>
                </div>
              )}
              <div className="flex items-center justify-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={countdown > 0}
                  className={`font-medium transition-colors ${countdown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-700'}`}
                >
                  دریافت مجدد کد ورود
                </button>
                {countdown > 0 && (
                  <span className="text-gray-500 font-medium">
                    ({countdown} ثانیه باقی مانده)
                  </span>
                )}
              </div>

              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(1);
                    setOtp("");
                  }}
                  className="text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors flex items-center gap-1 bg-blue-50 rounded-xl px-4 py-2"
                >
                  ویرایش شماره موبایل
                  <FaChevronLeft className="text-xs" />
                </button>
              </div>
            </div>

            <div className="bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setCurrentStep(1);
                    setOtp("");
                  }}
                  className="flex-1 py-3 rounded-lg bg-gray-100 text-gray-700 text-base font-medium border border-gray-300 hover:bg-gray-200 transition-colors"
                >
                  بازگشت
                </button>
                <button
                  onClick={handleVerifyOtp}
                  disabled={loading || !isOtpValid}
                  className="flex-2 py-4 rounded-lg bg-gradient-to-l from-blue-600 to-blue-700 text-white text-base font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? "در حال تایید..." : "تایید"}
                </button>
              </div>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden lg:flex lg:bg-gradient-to-br lg:from-blue-50 lg:to-gray-100 flex-1 items-center justify-center py-12">
        <div className="w-full max-w-[450px] mx-4">
          <div
            className="bg-white rounded-[12px] shadow-xl border border-gray-200/60 p-8"
            style={{
              borderWidth: '1.5px'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <Link href="/" className="p-2 rounded-xl hover:bg-gray-50 transition-all duration-200">
                <FaChevronRight className="text-gray-900 text-lg" />
              </Link>
              <div className="text-center flex-1">
                <h2 className="text-xl font-bold text-gray-900">
                  ورود / ثبت نام
                </h2>
              </div>
            </div>

            <div className="border-t border-gray-200/60 my-4" />

            {currentStep === 1 ? (
              <div className="space-y-6">
                <div className="mb-6">
                  <p className="text-[18px] text-gray-800">
                    شماره موبایل خود را وارد نمایید
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-500 mb-1">لطفا برای ورود یا ثبت نام شماره موبایل خود را وارد نمایید</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
                      setPhoneNumber(value);
                    }}
                    placeholder="شماره موبایل"
                    className={`w-full bg-gray-50 rounded-xl py-4 px-4 text-sm placeholder-gray-500 border-2 ${error ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:border-blue-500 transition-all duration-200`}
                    dir="ltr"
                    inputMode="numeric"
                  />
                </div>

                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-gradient-to-l from-blue-600 to-blue-700 text-white text-base font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? "در حال ارسال..." : "تایید"}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <div className="">
                  <h3 className="text-lg font-bold text-gray-900 mb-5">کد تایید را وارد نمایید</h3>
                </div>

                <div className="flex flex-col gap-4">
                  <label className="text-sm font-medium text-gray-700 text-right">کد پیامک شده به شماره {phoneNumber || "۰۹۱۳۴۵۶۷۸۹"} را وارد نمایید</label>
                  
                  {/* Container for the OTP input and visual boxes */}
                  <div 
                    ref={otpContainerRef}
                    className="relative w-full" 
                    onClick={handleOtpClick}
                    dir="ltr"  
                  >
                    {/* Transparent but visible input for typing - FIXED for mobile */}
                    <input
                      ref={otpInputRef}
                      type="text"
                      value={otp}
                      onChange={handleOtpChange}
                      onKeyDown={handleOtpKeyDown}
                      onFocus={handleOtpFocus}
                      onPaste={handlePaste}
                      className="absolute top-0 left-0 w-full h-12 opacity-0 z-10 cursor-text text-transparent bg-transparent"
                      inputMode="numeric"
                      maxLength={5}
                      autoComplete="one-time-code"
                      dir="ltr"  
                      style={{
                        fontSize: '16px', // Prevents zoom on iOS
                        letterSpacing: '24px', // Spread out the characters
                        paddingLeft: '6px', // Adjust for proper positioning
                        textIndent: '6px', // Adjust for proper positioning
                      }}
                    />
                    
                    {/* Visual boxes container */}
                    <div className="flex gap-2 justify-between">
                      {[0, 1, 2, 3, 4].map((index) => (
                        <div
                          key={index}
                          className={`w-12 h-12 bg-gray-50 rounded-xl text-sm border-2 transition-all duration-200 text-center font-bold flex items-center justify-center ${getDigitBoxClass(index)}`}
                        >
                          <span className="text-gray-900 text-lg">
                            {getDigit(index)}
                          </span>
                          {/* Show cursor on the next empty box */}
                          {index === otp.length && document.activeElement === otpInputRef.current && (
                            <span className="ml-0.5 w-0.5 h-6 bg-blue-500 animate-pulse"></span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-3">
                  {verificationCode && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                      <p className="text-green-700 font-medium">کد تایید: <span className="text-lg font-bold">{verificationCode}</span></p>
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={countdown > 0}
                      className={`font-medium transition-colors ${countdown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-700'}`}
                    >
                      دریافت مجدد کد ورود
                    </button>
                    {countdown > 0 && (
                      <span className="text-gray-500 font-medium">
                        ({countdown} ثانیه باقی مانده)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentStep(1);
                        setOtp("");
                      }}
                      className="text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors flex items-center gap-1 bg-blue-50 rounded-xl px-4 py-2"
                    >
                      ویرایش شماره موبایل
                      <FaChevronLeft className="text-xs" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleVerifyOtp}
                  disabled={loading || !isOtpValid}
                  className="w-full py-4 rounded-xl bg-gradient-to-l from-blue-600 to-blue-700 text-white text-base font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <FaCheck className="text-white" />
                  {loading ? "در حال تایید..." : "تایید"}
                </button>
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
                    <p className="text-red-600 text-sm text-center">{error}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}