import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ReadNovel = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch('http://localhost:3000/all-books');
        if (!response.ok) {
          throw new Error('Failed to fetch books');
        }
        const data = await response.json();
        setBooks(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-[#5DD62C] border-r-transparent border-b-[#5DD62C] border-l-transparent"></div>
          <p className="mt-4 text-lg text-[#5DD62C]">Loading books...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 rounded-lg bg-red-50 text-red-600">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-20 px-4 lg:px-24">
      <h1 className="text-4xl font-bold text-[#5DD62C] mb-8 text-center">Available Novels</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {books.map((book) => (
          <div key={book._id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
            <img 
              src={book.image_url} 
              alt={book.book_title} 
              className="w-full h-64 object-cover"
            />
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-2">{book.book_title}</h2>
              <p className="text-gray-300 mb-4">by {book.authorName}</p>
              <Link 
                to={`/ChapterReader/${book._id}`}
                className="block w-full text-center bg-[#5DD62C] text-black font-semibold py-2 px-4 rounded hover:bg-[#4cc01f] transition-colors"
              >
                Start Reading
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReadNovel; 