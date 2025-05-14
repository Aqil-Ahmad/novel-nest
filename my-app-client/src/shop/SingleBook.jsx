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

  const { _id, book_title, image_url, authorName, book_description, category, pdfFile, book_pdf_url } = book;

  // Function to verify PDF availability before navigating
  const handleReadPDF = async () => {
    setIsVerifying(true);
    setPdfError(null);
    try {
      // Direct navigation is often better than pre-checking
      navigate(`/book/${_id}/pdf`);
    } catch (error) {
      console.error('Navigation error:', error);
      setPdfError('Unable to access the PDF viewer. Please try again.');
      setIsVerifying(false);
    }
  };

  return (
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
          <h2 className="text-3xl font-bold mb-4">{book_title}</h2>
          <p className="text-gray-600 mb-2">Author: {authorName}</p>
          <p className="text-gray-600 mb-2">Category: {category}</p>
          
          <div className="mt-4">
            <h3 className="text-xl font-semibold mb-2">Description</h3>
            <p className="text-gray-700">{book_description}</p>
          </div>

          {/* Error message */}
          {pdfError && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {pdfError}
            </div>
          )}

          {/* PDF View Button */}
          {(pdfFile || book_pdf_url) && (
            <div className="mt-6">
              <Button 
                gradientDuoTone="purpleToBlue" 
                size="lg"
                onClick={handleReadPDF}
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Loading PDF...
                  </>
                ) : (
                  'Read PDF Book'
                )}
              </Button>
            </div>
          )}
          
          {/* Alternative direct link */}
          {(pdfFile || book_pdf_url) && (
            <div className="mt-2">
              <a 
                href={`/api/books/${_id}/pdf`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                Or open PDF directly in new tab
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SingleBook;