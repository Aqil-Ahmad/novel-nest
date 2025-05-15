import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BannerCard from '../home/BannerCard'

const Banner = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchError, setSearchError] = useState('')
  const navigate = useNavigate()

  const handleSearch = async (e) => {
    e.preventDefault()
    setSearchError('')

    if (!searchQuery.trim()) {
      setSearchError('Please enter a book title to search')
      return
    }

    try {
      const response = await fetch('http://localhost:3000/all-books')
      const books = await response.json()
      
      const foundBook = books.find(book => 
        book.book_title.toLowerCase().includes(searchQuery.toLowerCase())
      )

      if (foundBook) {
        navigate(`/book/${foundBook._id}`)
      } else {
        setSearchError('No book found with that title')
      }
    } catch (error) {
      setSearchError('Error searching for books. Please try again.')
      console.error('Search error:', error)
    }
  }

  return (
    <div className='px-4 lg:px-24 bg-black flex items-center'>
      <div className='flex w-full flex-col md:flex-row justify-between items-center gap-12 py-40'>
        {/* left side */}
        <div className='md:w-1/2 space-y-8 h-full'>
          <h2 className='text-5xl font-bold leading-snug text-white'>Welcome! <span className='text-[#5DD62C]'>Here you can find your favorite Novels</span></h2>
          <p className='md:w-4/54 text-white'>Books are the quietest and most constant of friends; they are the most accessible and wisest of counselors, and the most patient of teachers.</p>
          <div>
            <form onSubmit={handleSearch} className='flex gap-2'>
              <input 
                type='search' 
                name='search' 
                id='search' 
                placeholder='search a book'
                className='py-2 px-2 rounded-s-sm focus:outline-none focus:ring-0'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type='submit'
                className='bg-[#5DD62C] px-6 py-2 text-white font-medium hover:bg-black transition-all ease-in duration-200'
              >
                Search
              </button>
            </form>
            {searchError && (
              <p className='text-red-500 mt-2'>{searchError}</p>
            )}
          </div>
        </div>
        {/*right side*/}
        <div className='mr-15'><BannerCard /></div>
      </div>
    </div>
  )
}

export default Banner