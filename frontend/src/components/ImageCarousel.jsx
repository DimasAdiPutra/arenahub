// 📄 src/components/ImageCarousel.jsx
import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Mousewheel } from 'swiper/modules';

// Import CSS bawaan Swiper
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import '../styles/carousel.css'

const ImageCarousel = ({ images, title }) => {
  const [activeIdx, setActiveIdx] = useState(1);
  const totalImages = images?.length || 0;

  // Jika tidak ada gambar sama sekali, tampilkan placeholder semenjana
  if (totalImages === 0) {
    return (
      <div className="w-full h-75 sm:h-105 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
        <img src="https://placehold.co/800x450?text=ArenaHub" alt="Placeholder" className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div className="w-full relative group h-75 sm:h-105 rounded-2xl overflow-hidden shadow-xs border border-slate-200 bg-slate-900 select-none">

      <Swiper
        modules={[Navigation, Pagination, Mousewheel]}
        spaceBetween={0}
        slidesPerView={1}
        grabCursor={true}
        simulateTouch={true}
        navigation={totalImages > 1}
        pagination={totalImages > 1 ? { clickable: true } : false}
        onSlideChange={(swiper) => setActiveIdx(swiper.realIndex + 1)}
        className="w-full h-full"
      >
        {images.map((img, index) => (
          <SwiperSlide key={img.fileId || index}>
            <img
              src={img.url}
              alt={`${title || 'Arena'} - ${index + 1}`}
              className="w-full h-full object-cover pointer-events-none"
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* INDIKATOR ANGKA (Format: 1/5) - Otomatis hilang jika gambar hanya 1 */}
      {totalImages > 1 && (
        <div className="absolute top-4 right-4 bg-slate-950/60 backdrop-blur-md text-[11px] font-bold text-white px-2.5 py-1 rounded-full tracking-wider shadow-sm z-10 pointer-events-none">
          {activeIdx} / {totalImages}
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;