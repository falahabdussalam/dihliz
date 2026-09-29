"use client";

import Footer from '@/components/common/footer'
import NavBar from '@/components/common/nav'
import About from '@/components/home/about'
import Courses from '@/components/home/courses'
import HomeHeader from '@/components/home/header'
import LargeLogo from '@/components/home/large_logo'
// import NewsEvents from '@/components/home/news'
import SecondAbout from '@/components/home/secondabout'
import Services from '@/components/home/services'
import Image from 'next/image'

const Home = () => {
  return (
    <div className="overflow-x-hidden">
      
      <NavBar active="Home"/>
      <HomeHeader/>
      <About/>
      <Services/>
      <SecondAbout/>
      <Courses/>
      {/* <Vision/>
      <NewsEvents/>
      <LargeLogo/> */}
      <Footer/>
    </div>
  )
}

export default Home
