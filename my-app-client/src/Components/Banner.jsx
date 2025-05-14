import BannerCard from '../home/BannerCard'

const Banner = () => {
  return (
    <div className='px-4 lg:px-24 bg-black flex items-center'>
      <div className='flex w-full flex-col md:flex-row justify-between items-center gap-12 py-40'>
        {/* left side */}
        <div className='md:w-1/2 space-y-8 h-full'>
        <h2 className='text-5xl font-bold leading-snug text-white'>Buy and Sell Novels <span className='text-[#5DD62C]'>for the Best Prices</span></h2>
        <p className='md:w-4/54 text-white'>Books are the quietest and most constant of friends; they are the most accessible and wisest of counselors, and the most patient of teachers.</p>
        <div>
          <input 
            type='search' 
            name='search' 
            id='search' 
            placeholder='search a book'
            className='py-2 px-2 rounded-s-sm focus:outline-none focus:ring-0'
          />
          <button className='bg-[#5DD62C] px-6 py-2 text-white font-medium hover:bg-black transition-all ease-in duration-200'>Search</button>
        </div>
        </div>
        {/*right side*/}
        <div className='mr-15'><BannerCard /></div>
      </div>
    </div>
  )
}

export default Banner