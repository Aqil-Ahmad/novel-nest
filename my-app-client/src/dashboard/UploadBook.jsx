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
    <div className='px-4 flex flex-col justify-center min-h-[calc(100vh-100px)]'>
      <form onSubmit={handleBookSubmit} className="flex lg:w-[930px] flex-col flex-wrap gap-4">
        {/*Form 1*/}
        <div className='flex gap-8'>
          <div className='lg:w-1/2'>
            <div className="mb-2 block">
              <Label htmlFor="book_title" value="Book Title" />
            </div>
            <TextInput 
              id="book_title" 
              type="text" 
              name='book_title'
              placeholder="Book Name" 
              required
            />
          </div>

          <div className='lg:w-1/2'>
            <div className="mb-2 block">
              <Label htmlFor="authorName" value="Author Name" />
            </div>
            <TextInput 
              id="authorName" 
              name='authorName'
              type="text" 
              placeholder="Author Name" 
              required
            />
          </div>
        </div>

        {/*Form 2*/}
        <div className='flex gap-8'>
          <div className='lg:w-1/2'>
            <div className="mb-2 block">
              <Label htmlFor="image_url" value="Book image URL" />
            </div>
            <TextInput 
              id="image_url" 
              type="text" 
              name='image_url'
              placeholder="Book image URL" 
              required
            />
          </div>

          <div className='lg:w-1/2'>
            <div className="mb-2 block">
              <Label htmlFor="category" value="Book Category" />
            </div>
            <Select 
              id="category" 
              name="category" 
              className='w-full rounded' 
              value={selectedBookCategory} 
              onChange={handleChangeSelectedValue}
            >
              {bookCategories.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </Select>
          </div>
        </div>

        {/*Book description*/}
        <div>
          <div className='mb-2 block'>
            <Label htmlFor="book_description" value="Book Description" />
          </div>
          <Textarea 
            id="book_description"
            name="book_description"
            placeholder='Write your book description...'
            required
            className='w-full'
            rows={4}
          />
        </div>

        {/*PDF file upload*/}
        <div>
          <div className='mb-2 block'>
            <Label htmlFor="pdf" value="Book PDF File" />
          </div>
          <input
            type="file"
            id="pdf"
            name="pdf"
            accept=".pdf"
            onChange={handleFileChange}
            required
            className="w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          {pdfFile && (
            <p className="mt-2 text-sm text-gray-500">
              Selected file: {pdfFile.name}
            </p>
          )}
        </div>

        <Button type="submit" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload Book'}
        </Button>
      </form>
    </div>
  )
}

export default UploadBook