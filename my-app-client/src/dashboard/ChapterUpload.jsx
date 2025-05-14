import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Label, TextInput, Textarea } from "flowbite-react";

const ChapterUpload = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chapterData, setChapterData] = useState({
    chapterNumber: '',
    title: '',
    content: ''
  });

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/books/${bookId}`);
        if (!response.ok) throw new Error('Book not found');
        const data = await response.json();
        setBook(data.book);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [bookId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:3000/api/chapters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId,
          ...chapterData,
          chapterNumber: parseInt(chapterData.chapterNumber)
        }),
      });

      if (!response.ok) throw new Error('Failed to create chapter');

      alert('Chapter uploaded successfully!');
      // Reset form
      setChapterData({
        chapterNumber: '',
        title: '',
        content: ''
      });
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className='min-h-screen bg-black py-8'>
      <div className='max-w-4xl mx-auto px-4'>
        <h2 className="text-4xl font-bold text-[#5DD62C] mb-8">
          Upload Chapter for {book?.book_title}
        </h2>
        
        <div className="bg-black rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="chapterNumber" className="block text-[#5DD62C] text-lg mb-2">Chapter Number</label>
              <input
                type="number"
                id="chapterNumber"
                value={chapterData.chapterNumber}
                onChange={(e) => setChapterData({...chapterData, chapterNumber: e.target.value})}
                required
                className="w-full p-3 bg-gray-900 border border-[#5DD62C]/30 rounded-lg text-white focus:outline-none focus:border-[#5DD62C]"
              />
            </div>

            <div>
              <label htmlFor="title" className="block text-[#5DD62C] text-lg mb-2">Chapter Title</label>
              <input
                type="text"
                id="title"
                value={chapterData.title}
                onChange={(e) => setChapterData({...chapterData, title: e.target.value})}
                required
                className="w-full p-3 bg-gray-900 border border-[#5DD62C]/30 rounded-lg text-white focus:outline-none focus:border-[#5DD62C]"
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-[#5DD62C] text-lg mb-2">Chapter Content</label>
              <textarea
                id="content"
                value={chapterData.content}
                onChange={(e) => setChapterData({...chapterData, content: e.target.value})}
                required
                rows={10}
                className="w-full p-3 bg-gray-900 border border-[#5DD62C]/30 rounded-lg text-white focus:outline-none focus:border-[#5DD62C]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#5DD62C] text-black font-semibold py-3 rounded-lg hover:bg-[#4cb824] transition-colors"
            >
              Upload Chapter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChapterUpload;
