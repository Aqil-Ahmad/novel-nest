import { useState, useEffect } from 'react'

const ChapterManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState('');


  useEffect(() => {
    // Fetch all books for the dropdown
    fetch('http://localhost:3000/all-books')
      .then(res => res.json())
      .then(data => {
        setBooks(data);
        if (data.length > 0) {
          setSelectedBook(data[0]._id);
        }
      })
      .catch(err => {
        setError('Error fetching books: ' + err.message);
      });
  }, []);

  const handleChapterSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!selectedBook) {
      setError('Please select a book first');
      setLoading(false);
      return;
    }

    const form = event.target;
    const chapterObj = {
      bookId: selectedBook,
      chapterNumber: parseInt(form.chapterNumber.value),
      title: form.chapterTitle.value,
      content: form.content.value
    }

    try {
      const response = await fetch("http://localhost:3000/api/chapters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chapterObj)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload chapter');
      }

      alert("Chapter uploaded successfully!");
      form.reset();
    } catch (err) {
      setError(err.message);
      alert("Error uploading chapter: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='min-h-screen bg-black py-8'>
      <div className='max-w-4xl mx-auto px-4'>
        <h2 className="text-4xl font-bold text-[#5DD62C] mb-8">Manage Chapters</h2>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <div className="bg-black rounded-lg p-8 border border-[#5DD62C]/30">
          <form onSubmit={handleChapterSubmit} className="space-y-6">
            <div>
              <label htmlFor="book" className="block text-[#5DD62C] text-lg mb-2">Select Book</label>
              <select
                id="book"
                value={selectedBook}
                onChange={(e) => setSelectedBook(e.target.value)}
                required
                className="w-full p-3 bg-gray-900 border border-[#5DD62C]/30 rounded-lg text-white focus:outline-none focus:border-[#5DD62C]"
              >
                <option value="">Select a book</option>
                {books.map(book => (
                  <option key={book._id} value={book._id}>
                    {book.book_title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="chapterTitle" className="block text-[#5DD62C] text-lg mb-2">Chapter Title</label>
                <input
                  type="text"
                  id="chapterTitle"
                  name="chapterTitle"
                  placeholder="Enter chapter title"
                  required
                  className="w-full p-3 bg-gray-900 border border-[#5DD62C]/30 rounded-lg text-white focus:outline-none focus:border-[#5DD62C]"
                />
              </div>

              <div>
                <label htmlFor="chapterNumber" className="block text-[#5DD62C] text-lg mb-2">Chapter Number</label>
                <input
                  type="number"
                  id="chapterNumber"
                  name="chapterNumber"
                  placeholder="Enter chapter number"
                  required
                  min="1"
                  className="w-full p-3 bg-gray-900 border border-[#5DD62C]/30 rounded-lg text-white focus:outline-none focus:border-[#5DD62C]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="content" className="block text-[#5DD62C] text-lg mb-2">Chapter Content</label>
              <textarea
                id="content"
                name="content"
                placeholder="Write your chapter content here..."
                required
                rows={10}
                className="w-full p-3 bg-gray-900 border border-[#5DD62C]/30 rounded-lg text-white focus:outline-none focus:border-[#5DD62C]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5DD62C] text-black font-semibold py-3 rounded-lg hover:bg-[#4cb824] transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent mr-3" />
                  Uploading Chapter...
                </div>
              ) : (
                'Upload Chapter'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChapterManagement;