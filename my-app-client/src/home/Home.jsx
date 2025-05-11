import Banner from '../Components/Banner'
import BestSellerBooks from './BestSellerBooks'
import FavBook from './FavBook'
import PromoBanner from './PromoBanner'
import Review from './Review'

const Home = () => {
  return (
    <div style={{ background: 'black', margin: 0, padding: 0 }}>
      <Banner />
      <BestSellerBooks />
      <FavBook />
      <PromoBanner />
      <Review />
    </div>
  )
}

export default Home