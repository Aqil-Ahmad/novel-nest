import React, { useRef, useState } from 'react';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
import { Link } from 'react-router-dom';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

import { FaCartShopping } from 'react-icons/fa6';

// import required modules
import { Pagination } from 'swiper/modules';

const BookCards = ({ books, headline }) => {
  return (
    <div className='my-16 px-4 lg:px-24 bg-black'>
      <h2 className='text-5xl text-center font-bold text-[#5DD62C] my-5'>{headline}</h2>

      {/* cards */}
      <div className='mt-12'>
        <Swiper
          slidesPerView={1}
          spaceBetween={10}
          pagination={{
            clickable: true,
          }}
          breakpoints={{
            640: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            768: {
              slidesPerView: 4,
              spaceBetween: 40,
            },
            1024: {
              slidesPerView: 5,
              spaceBetween: 50,
            },
          }}
          modules={[Pagination]}
          className="mySwiper q-full h-full"
        >
          {books.map(book => (
            <SwiperSlide key={book._id}>
              <Link to={`/book/${book._id}`}>
                <div className='relative'>
                  <img src={book.image_url} alt="" />
                  <div className='absolute top-3 right-3 bg-black hover:bg-[#6b6b6b] p-2 rounded'>
                    <FaCartShopping className='w-4 h-4 text-[#5DD62C]' />
                  </div>
                </div>
                <div className='text-[#5DD62C]'>
                  <div>
                    <h3>{book.book_title}</h3>
                    <p>{book.authorName}</p>
                  </div>
                  <div>
                    <p>Rs 500.00</p>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default BookCards;
