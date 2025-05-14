import { useState, useEffect } from 'react';
import { useLoaderData,  useNavigate } from 'react-router-dom';
import { Button, Spinner } from 'flowbite-react';

const SingleBook = () => {
  const data = useLoaderData();
  const book = data.book || data; // fallback for legacy data
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(false);
  const [pdfError, setPdfError] = useState(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  if (!book) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="xl" />
        <p className="ml-2">Loading book details...</p>
      </div>
    );
  }

  const { _id, book_title, image_url, authorName, book_description, category } = book;

  // Function to verify PDF availability before navigating
  const handleRead = async () => {
    // Redirect to the first chapter of the book
    navigate(`/ChapterReader/${_id}/1`);
  };

  return (
    <div className="bg-black min-h-screen">
      <div className="pt-10 px-1 lg:px-6 w-full">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-center min-h-[20vh]">
          {/* Book Image */}
          <div className="lg:w-1/3 flex justify-center">
            <img 
              src={image_url} 
              alt={book_title} 
              className="max-h-40 w-auto object-contain rounded-lg shadow-md"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder-book.png'; // Fallback image
              }}
            />
          </div>

          {/* Book Details */}
          <div className="lg:w-2/3 flex flex-col items-center lg:items-start">
            <h2 className="text-lg font-bold mb-2 text-[#5DD62C] text-center lg:text-left">{book_title}</h2>
            <p className="text-gray-400 mb-1 text-center lg:text-left text-sm">Author: {authorName}</p>
            <p className="text-gray-400 mb-1 text-center lg:text-left text-sm">Category: {category}</p>
            <div className="mt-1">
              <h3 className="text-base font-semibold mb-1 text-[#5DD62C]">Description</h3>
              <p className="text-gray-300 text-xs">{book_description}</p>
            </div>
            {/* Error message */}
            {pdfError && (
              <div className="mt-2 p-1 bg-red-100 border border-red-400 text-red-700 rounded text-xs">
                {pdfError}
              </div>
            )}
            {/* Read Button (redirects to first chapter) */}
            <div className="mt-2">
              <Button 
                gradientDuoTone="purpleToBlue" 
                size="sm"
                onClick={handleRead}
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Loading...
                  </>
                ) : (
                  'Read'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleBook;