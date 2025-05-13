import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ChapterReader = () => {
  const { bookId, chapterNumber = 1 } = useParams();
  const navigate = useNavigate();
  
  const [book, setBook] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fontSize, setFontSize] = useState(16);
  const [theme, setTheme] = useState('light'); // 'light', 'dark', 'sepia'

  // Fetch book details
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await fetch(`http://localhost:3000/book/${bookId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch book details');
        }
        const data = await response.json();
        setBook(data);
      } catch (err) {
        setError(err.message);
      }
    };

    if (bookId) {
      fetchBook();
    }
  }, [bookId]);

  // Fetch chapter content
  useEffect(() => {
    const fetchChapter = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3000/book/${bookId}/chapter/${chapterNumber}`);
        if (!response.ok) {
          throw new Error('Failed to fetch chapter content');
        }
        const data = await response.json();
        setChapter(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (bookId && chapterNumber) {
      fetchChapter();
    }
  }, [bookId, chapterNumber]);

  // Navigate to next chapter
  const goToNextChapter = () => {
    if (book && parseInt(chapterNumber) < book.totalChapters) {
      navigate(`/ChapterReader/${bookId}/${parseInt(chapterNumber) + 1}`);
    }
  };

  // Navigate to previous chapter
  const goToPreviousChapter = () => {
    if (parseInt(chapterNumber) > 1) {
      navigate(`/ChapterReader/${bookId}/${parseInt(chapterNumber) - 1}`);
    }
  };

  // Handle font size change
  const changeFontSize = (size) => {
    setFontSize(size);
  };

  // Handle theme change
  const changeTheme = (newTheme) => {
    setTheme(newTheme);
  };

  // Update the theme classes
  const getThemeClasses = () => {
    switch (theme) {
      case 'dark':
        return 'bg-black text-[#5DD62C]';
      case 'sepia':
        return 'bg-[#1a1a1a] text-[#5DD62C]';
      default: // light
        return 'bg-gray-900 text-[#5DD62C]';
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 rounded-lg bg-red-50 text-red-600">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p>{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (loading || !book || !chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-[#5DD62C] border-r-transparent border-b-[#5DD62C] border-l-transparent"></div>
          <p className="mt-4 text-lg text-[#5DD62C]">Loading chapter...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${getThemeClasses()}`}>
      {/* Reader Header */}
      <header className="sticky top-0 z-10 bg-black text-[#5DD62C] shadow-[0_4px_15px_0_rgba(93,214,44,0.5)]">
        <div className="container mx-auto p-4 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h1 className="text-xl font-bold">{book.book_title}</h1>
            <p className="text-sm">by {book.authorName}</p>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center">
            {/* Chapter Navigation */}
            <div className="flex gap-2">
              <button
                onClick={goToPreviousChapter}
                disabled={parseInt(chapterNumber) <= 1}
                className={`px-3 py-1 rounded ${
                  parseInt(chapterNumber) <= 1 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-[#5DD62C] text-black hover:bg-[#4cc01f]'
                }`}
              >
                Previous
              </button>
              
              <span className="px-3 py-1 bg-gray-800 rounded">
                {chapterNumber} / {book.totalChapters}
              </span>
              
              <button
                onClick={goToNextChapter}
                disabled={parseInt(chapterNumber) >= book.totalChapters}
                className={`px-3 py-1 rounded ${
                  parseInt(chapterNumber) >= book.totalChapters 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-[#5DD62C] text-black hover:bg-[#4cc01f]'
                }`}
              >
                Next
              </button>
            </div>
            
            {/* Reader Controls */}
            <div className="flex gap-2">
              {/* Font Size */}
              <div className="flex gap-1 items-center border border-gray-700 rounded p-1">
                <button 
                  onClick={() => changeFontSize(Math.max(12, fontSize - 2))}
                  className="w-6 h-6 flex items-center justify-center hover:bg-gray-700 rounded"
                >
                  A-
                </button>
                <button 
                  onClick={() => changeFontSize(Math.min(24, fontSize + 2))}
                  className="w-6 h-6 flex items-center justify-center hover:bg-gray-700 rounded"
                >
                  A+
                </button>
              </div>
              
              {/* Theme Toggle */}
              <div className="flex gap-1 border border-gray-700 rounded p-1">
                <button 
                  onClick={() => changeTheme('light')}
                  className={`w-7 h-6 rounded ${theme === 'light' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                  title="Light Mode"
                >
                  ☀️
                </button>
                <button 
                  onClick={() => changeTheme('dark')}
                  className={`w-7 h-6 rounded ${theme === 'dark' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                  title="Dark Mode"
                >
                  🌙
                </button>
                <button 
                  onClick={() => changeTheme('sepia')}
                  className={`w-7 h-6 rounded ${theme === 'sepia' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                  title="Sepia Mode"
                >
                  📜
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Chapter Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <h2 className="text-2xl font-bold mb-6">{chapter.title}</h2>
        
        <div 
          className="chapter-content leading-relaxed"
          style={{ fontSize: `${fontSize}px` }}
          dangerouslySetInnerHTML={{ __html: chapter.content }}
        />
        
        {/* Chapter Navigation Buttons */}
        <div className="mt-10 flex justify-between">
          <button
            onClick={goToPreviousChapter}
            disabled={parseInt(chapterNumber) <= 1}
            className={`px-4 py-2 rounded ${
              parseInt(chapterNumber) <= 1 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-[#5DD62C] text-black hover:bg-[#4cc01f]'
            }`}
          >
            ← Previous Chapter
          </button>
          
          <button
            onClick={goToNextChapter}
            disabled={parseInt(chapterNumber) >= book.totalChapters}
            className={`px-4 py-2 rounded ${
              parseInt(chapterNumber) >= book.totalChapters 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-[#5DD62C] text-black hover:bg-[#4cc01f]'
            }`}
          >
            Next Chapter →
          </button>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-black text-[#5DD62C] p-4 text-center">
        <p>© {new Date().getFullYear()} Novel Nest. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default ChapterReader;