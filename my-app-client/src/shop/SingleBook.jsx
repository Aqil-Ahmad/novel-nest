import { useState } from 'react';
import { useLoaderData,  useNavigate } from 'react-router-dom';
import { Button, Spinner } from 'flowbite-react';

const SingleBook = () => {
  const data = useLoaderData();
  const book = data.book || data; // fallback for legacy data
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(false);
  const [pdfError, setPdfError] = useState(null);

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
      <div className="mt-28 px-4 lg:px-24">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Book Image */}
          <div className="lg:w-1/3">
            <img 
              src={image_url} 
              alt={book_title} 
              className="h-96 w-full object-cover rounded-lg shadow-lg"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder-book.png'; // Fallback image
              }}
            />
          </div>

          {/* Book Details */}
          <div className="lg:w-2/3">
            <h2 className="text-3xl font-bold mb-4 text-[#5DD62C]">{book_title}</h2>
            <p className="text-gray-400 mb-2">Author: {authorName}</p>
            <p className="text-gray-400 mb-2">Category: {category}</p>
            
            <div className="mt-4">
              <h3 className="text-xl font-semibold mb-2 text-[#5DD62C]">Description</h3>
              <p className="text-gray-300">{book_description}</p>
            </div>

            {/* Error message */}
            {pdfError && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {pdfError}
              </div>
            )}

            {/* Read Button (redirects to first chapter) */}
            <div className="mt-6">
              <Button 
                gradientDuoTone="purpleToBlue" 
                size="lg"
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