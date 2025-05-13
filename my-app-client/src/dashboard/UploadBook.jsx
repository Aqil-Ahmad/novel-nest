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
  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleChangeSelectedValue = (event) => {
    setSelectedBookCategory(event.target.value);
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    } else {
      alert('Please select a PDF file');
      event.target.value = null;
    }
  }

  const handleBookSubmit = async (event) => {
    event.preventDefault();
    setUploading(true);

    const form = event.target;
    const formData = new FormData();
    
    formData.append('pdf', pdfFile);
    formData.append('book_title', form.book_title.value);
    formData.append('authorName', form.authorName.value);
    formData.append('book_description', form.book_description.value);
    formData.append('category', form.category.value);
    formData.append('image_url', form.image_url.value);

    try {
      const response = await fetch("http://localhost:3000/api/books/upload-pdf", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload book');
      }

      alert("Book uploaded successfully!");
      form.reset();
      setPdfFile(null);
    } catch (error) {
      alert("Error uploading book: " + error.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className='px-4 my-12 bg-black'>
      <h2 className="text-3xl font-bold text-[#5DD62C] mb-6">Upload New Book</h2>
      <div className="bg-black rounded-lg p-8 border border-[#5DD62C]/30">
        <form onSubmit={handleBookSubmit} className="flex flex-col gap-6">
          <div className='grid lg:grid-cols-2 gap-8'>
            <div className='space-y-4'>
              <div>
                <Label htmlFor="book_title" value="Book Title" className="text-[#5DD62C] text-lg" />
                <TextInput 
                  id="book_title" 
                  type="text" 
                  name='book_title'
                  placeholder="Enter book title" 
                  required
                  className="mt-2 bg-gray-800 text-white border-gray-700 focus:ring-0 focus:outline-none"
                />
              </div>

              <div>
                <Label htmlFor="authorName" value="Author Name" className="text-[#5DD62C] text-lg" />
                <TextInput 
                  id="authorName" 
                  name='authorName'
                  type="text" 
                  placeholder="Enter author name" 
                  required
                  className="mt-2 bg-black border-[#5DD62C]/30 text-white placeholder-gray-400 focus:ring-0 focus:outline-none"
                />
              </div>

              <div>
                <Label htmlFor="category" value="Book Category" className="text-[#5DD62C] text-lg" />
                <Select 
                  id="category" 
                  name="category" 
                  className='w-full mt-2 bg-gray-900 border-[#5DD62C]/30 text-white focus:ring-0 focus:outline-none' 
                  value={selectedBookCategory} 
                  onChange={handleChangeSelectedValue}
                >
                  {bookCategories.map((option) => (
                    <option key={option} value={option} className="bg-gray-900 text-white">{option}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className='space-y-4'>
              <div>
                <Label htmlFor="image_url" value="Book Cover Image URL" className="text-[#5DD62C] text-lg" />
                <TextInput 
                  id="image_url" 
                  type="text" 
                  name='image_url'
                  placeholder="Enter image URL" 
                  required
                  className="mt-2 bg-black border-[#5DD62C]/30 text-white placeholder-gray-400"
                />
              </div>

              <div>
                <Label htmlFor="book_description" value="Book Description" className="text-[#5DD62C] text-lg" />
                <Textarea 
                  id="book_description"
                  name="book_description"
                  placeholder='Write your book description...'
                  required
                  className='w-full mt-2 bg-white border-[#5DD62C]/30 text-gray-900 placeholder-gray-500'
                  rows={5}
                />
              </div>
            </div>
          </div>

          <div className='mt-6 p-6 bg-black rounded-lg border border-[#5DD62C]/30'>
            <Label htmlFor="pdf" value="Book PDF File" className="text-[#5DD62C] text-lg mb-3 block" />
            <input
              type="file"
              id="pdf"
              name="pdf"
              accept=".pdf"
              onChange={handleFileChange}
              required
              className="w-full text-sm text-gray-400
                file:mr-4 file:py-3 file:px-6
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-black file:text-white file:border file:border-[#5DD62C]/30
                hover:file:bg-gray-900 
                cursor-pointer"
            />
            {pdfFile && (
              <p className="mt-3 text-sm text-gray-400 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                {pdfFile.name}
              </p>
            )}
          </div>

          <Button 
            type="submit" 
            disabled={uploading}
            className="mt-6 bg-[#5DD62C] hover:bg-[#4cb824] text-black font-semibold py-3"
          >
            {uploading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Uploading...
              </div>
            ) : (
              'Upload Book'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default UploadBook