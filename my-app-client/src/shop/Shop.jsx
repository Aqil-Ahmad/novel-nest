import React, { useState, useEffect } from 'react'
import { Card } from "flowbite-react";
import { useLocation } from 'react-router-dom';
import Image from "../assets/profile.jpg";

const Shop = () => {
  const [books, setBooks] = useState([]);
  const location = useLocation();

  // Get search query from URL
  const params = new URLSearchParams(location.search);
  const search = params.get('search')?.toLowerCase() || '';

  useEffect(() => {
    fetch("http://localhost:3000/all-books").then(res => res.json()).then(data => setBooks(data));
  },[])

  // Filter books if search query is present
  const filteredBooks = search
    ? books.filter(book =>
        book.book_title?.toLowerCase().includes(search) ||
        book.category?.toLowerCase().includes(search)
      )
    : books;

  return (
    <div className='min-h-screen bg-black px-4 lg:px-24 flex flex-col'>
      <h1 className='text-5xl mt-24 mb-12 font-bold text-center text-[#5DD62C]'>All Books are here</h1>
      <div className='grid gap-6 flex-1 lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2 grid-cols-1'>
        {
          filteredBooks.map(book => (
            <Card className='shadow-2xl bg-gray-900 text-white border border-gray-800 p-2 flex flex-col h-full' key={book._id}>
              <img src={book.image_url} alt="" className='h-40 w-full object-contain bg-black rounded mb-2'/>
              <h5 className="text-lg font-bold tracking-tight text-[#5DD62C] mx-2 mb-1 text-center">
                <p className="text-lg text-center">{book.book_title}</p>
              </h5>
              <p className="font-normal text-gray-400 mx-2 text-sm mb-2 text-center">
                {/* You can add a book description here if available */}
              </p>
              <div className="flex-1 flex flex-col justify-end">
                <button
                  className='bg-[#5DD62C] font-semibold text-black py-2 text-base rounded mx-2 mb-2 hover:bg-black hover:text-[#5DD62C] transition w-full'
                  onClick={() => window.location.href = `/ChapterReader/${book._id}/1`}
                >
                  Read Now
                </button>
              </div>
            </Card>
          ))
        }
      </div>
    </div>
  )
}

export default Shop