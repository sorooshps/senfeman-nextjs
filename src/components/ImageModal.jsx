"use client";

import React, { useEffect } from "react";
import { X, ZoomIn, ZoomOut } from "lucide-react";
import Image from "next/image";

const ImageModal = ({ isOpen, onClose, imageUrl, productTitle }) => {
  const [isZoomed, setIsZoomed] = React.useState(false);

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    // Close modal on Escape key
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop with fade animation */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? "opacity-80" : "opacity-0"
        }`}
      />

      {/* Modal Content */}
      <div
        className={`relative z-10 w-full max-w-5xl mx-4 transform transition-all duration-300 ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors z-20 bg-black/50 rounded-full backdrop-blur-sm"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Zoom Toggle Button */}
        <button
          onClick={() => setIsZoomed(!isZoomed)}
          className="absolute -top-12 right-14 p-2 text-white hover:text-gray-300 transition-colors z-20 bg-black/50 rounded-full backdrop-blur-sm"
          aria-label={isZoomed ? "Zoom out" : "Zoom in"}
        >
          {isZoomed ? (
            <ZoomOut className="w-6 h-6" />
          ) : (
            <ZoomIn className="w-6 h-6" />
          )}
        </button>

        {/* Image Container */}
        <div
          className={`bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
            isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
          }`}
          onClick={() => setIsZoomed(!isZoomed)}
        >
          {/* Product Title */}
          {productTitle && (
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
              <h3 className="font-bold text-lg text-right" dir="rtl">
                {productTitle}
              </h3>
            </div>
          )}

          {/* Image */}
          <div
            className={`relative bg-gray-100 flex items-center justify-center transition-all duration-500 ${
              isZoomed ? "p-4" : "p-8"
            }`}
            style={{
              minHeight: "400px",
              maxHeight: "80vh",
            }}
          >
            <div
              className={`relative w-full h-full transition-transform duration-500 ease-out ${
                isZoomed ? "scale-150" : "scale-100"
              }`}
              style={{
                maxWidth: isZoomed ? "200%" : "100%",
                maxHeight: isZoomed ? "200%" : "100%",
              }}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={productTitle || "Product image"}
                  className="w-full h-full object-contain"
                  style={{
                    maxHeight: "70vh",
                    animation: "fadeInScale 0.4s ease-out",
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p className="text-gray-400">تصویری موجود نیست</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Info */}
          <div className="bg-gray-50 px-6 py-3 text-center border-t border-gray-200">
            <p className="text-sm text-gray-500" dir="rtl">
              برای بستن روی پس‌زمینه کلیک کنید یا کلید ESC را فشار دهید
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default ImageModal;
