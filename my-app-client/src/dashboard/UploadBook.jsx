import { useState } from 'react'
import { Button, Label, Select, TextInput, Textarea } from "flowbite-react";

const UploadBook = () => {
  const bookCategories = [
    "Fiction",
    "Science Fiction",
    "Non-Fiction",
    "Mystery",
    "Programming",
    "Fantasy",
    "Horror",
    "Biography",
    "Autobiography",
    "History",
    "Self help",
    "Memoir",
    "Business",
    "Children Books",
    "Travel",
    "Philosophy",
    "Psychology",
    "Religion",
    "Art"
  ]
  const [selectedBookCategory, setSelectedBookCategory] = useState(bookCategories[0]);
  const [uploading, setUploading] = useState(false);

  const handleChangeSelectedValue = (event) => {
    setSelectedBookCategory(event.target.value);
  }

  const handleBookSubmit = async (event) => {
    event.preventDefault();
    setUploading(true);

    const form = event.target;
    const bookData = {
      book_title: form.book_title.value,
      authorName: form.authorName.value,
      book_description: form.book_description.value,
      category: form.category.value,
      image_url: form.image_url.value
    };

    try {
      const response = await fetch("http://localhost:3000/api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload book');
      }

      alert("Book uploaded successfully!");
      form.reset();
    } catch (error) {
      alert("Error uploading book: " + error.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className='min-h-screen bg-black py-8'>
      <div className='max-w-4xl mx-auto px-4'>
        <h2 className="text-4xl font-bold text-[#5DD62C] mb-8">Upload New Book</h2>
        
        <div className="bg-black rounded-lg p-8">
          <form onSubmit={handleBookSubmit} className="space-y-6">
            <div>
              <label htmlFor="book_title" className="block text-[#5DD62C] text-lg mb-2">Book Title</label>
              <input
                type="text"
                id="book_title"
                name="book_title"
                placeholder="Enter book title"
                required
                className="w-full p-3 bg-gray-900 border border-[#5DD62C]/30 rounded-lg text-white focus:outline-none focus:border-[#5DD62C]"
              />
            </div>

            <div>
              <label htmlFor="authorName" className="block text-[#5DD62C] text-lg mb-2">Author Name</label>
              <input
                type="text"
                id="authorName"
                name="authorName"
                placeholder="Enter author name"
                required
                className="w-full p-3 bg-gray-900 border border-[#5DD62C]/30 rounded-lg text-white focus:outline-none focus:border-[#5DD62C]"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-[#5DD62C] text-lg mb-2">Book Category</label>
              <select
                id="category"
                name="category"
                value={selectedBookCategory}
                onChange={handleChangeSelectedValue}
                className="w-full p-3 bg-gray-900 border border-[#5DD62C]/30 rounded-lg text-white focus:outline-none focus:border-[#5DD62C]"
              >
                {bookCategories.map((option) => (
                  <option key={option} value={option} className="bg-gray-900">{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="image_url" className="block text-[#5DD62C] text-lg mb-2">Book Cover Image URL</label>
              <input
                type="text"
                id="image_url"
                name="image_url"
                placeholder="Enter image URL"
                required
                className="w-full p-3 bg-gray-900 border border-[#5DD62C]/30 rounded-lg text-white focus:outline-none focus:border-[#5DD62C]"
              />
            </div>

            <div>
              <label htmlFor="book_description" className="block text-[#5DD62C] text-lg mb-2">Book Description</label>
              <textarea
                id="book_description"
                name="book_description"
                placeholder="Write your book description..."
                required
                rows={5}
                className="w-full p-3 bg-gray-900 border border-[#5DD62C]/30 rounded-lg text-white focus:outline-none focus:border-[#5DD62C]"
              />
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-[#5DD62C] text-black font-semibold py-3 rounded-lg hover:bg-[#4cb824] transition-colors"
            >
              {uploading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent mr-3" />
                  Uploading...
                </div>
              ) : (
                'Upload Book'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default UploadBook