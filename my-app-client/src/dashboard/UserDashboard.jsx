import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../contects/AuthProider';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookDetails, setBookDetails] = useState({});
  const [chapterTitles, setChapterTitles] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3000/api/users/history', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setHistory(data.history);
        } else {
          setError(data.message || 'Failed to fetch history');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Fetch book details for all books in history
  useEffect(() => {
    const fetchBooksAndChapters = async () => {
      if (history.length === 0) return;
      const details = {};
      const chapters = {};
      await Promise.all(history.map(async (item) => {
        try {
          // Fetch book details
          const res = await fetch(`http://localhost:3000/api/books/${item.bookId}`);
          const data = await res.json();
          if (data.success && data.book) {
            details[item.bookId] = data.book;
          }
          // Fetch last chapter title
          if (item.lastChapterRead) {
            const chapRes = await fetch(`http://localhost:3000/api/books/${item.bookId}/chapters/${item.lastChapterRead}`);
            const chapData = await chapRes.json();
            if (chapData.success && chapData.chapter) {
              chapters[`${item.bookId}_${item.lastChapterRead}`] = chapData.chapter.title;
            }
          }
        } catch (e) { /* ignore individual errors */ }
      }));
      setBookDetails(details);
      setChapterTitles(chapters);
    };
    fetchBooksAndChapters();
  }, [history]);

  if (loading) return <div className="text-center text-[#5DD62C]">Loading history...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-[#5DD62C]">Your Reading History</h2>
      {history.length === 0 ? (
        <p className="text-gray-400">No reading history yet.</p>
      ) : (
        <table className="w-full bg-black text-[#5DD62C] rounded-lg">
          <thead>
            <tr>
              <th className="py-2">Book</th>
              <th className="py-2">Last Chapter</th>
              <th className="py-2">Progress</th>
              <th className="py-2">Last Read</th>
              <th className="py-2">Continue</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => {
              const book = bookDetails[item.bookId];
              const chapterTitle = chapterTitles[`${item.bookId}_${item.lastChapterRead}`];
              return (
                <tr key={item.bookId} className="border-b border-gray-700">
                  <td className="py-2 flex items-center gap-3">
                    {book && book.image_url && (
                      <img src={book.image_url} alt={book.book_title} className="w-12 h-16 object-cover rounded shadow" />
                    )}
                    <div>
                      <div className="font-bold">{book ? book.book_title : item.bookId}</div>
                      <div className="text-xs text-gray-400">{book ? `by ${book.authorName}` : ''}</div>
                    </div>
                  </td>
                  <td className="py-2">{item.lastChapterRead}{chapterTitle ? `: ${chapterTitle}` : ''}</td>
                  <td className="py-2">{item.percentComplete || 0}%</td>
                  <td className="py-2">{item.updatedAt ? new Date(item.updatedAt).toLocaleString() : ''}</td>
                  <td className="py-2">
                    <button
                      className="bg-[#5DD62C] text-black px-3 py-1 rounded hover:bg-[#4cc01f]"
                      onClick={() => navigate(`/ChapterReader/${item.bookId}/${item.lastChapterRead}`)}
                    >
                      Continue
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserDashboard;
