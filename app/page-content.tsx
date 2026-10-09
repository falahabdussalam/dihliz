"use client";

import Footer from '@/components/common/footer'
import NavBar from '@/components/common/nav'
import About from '@/components/home/about'
import AdmissionSteps from '@/components/home/admission_steps'
import CampusLife from '@/components/home/campus_life'
import ContactCta from '@/components/home/contact_cta'
import Courses from '@/components/home/courses'
import HomeHeader from '@/components/home/header'
import Leadership from '@/components/home/leadership'
import SecondAbout from '@/components/home/secondabout'
import Services from '@/components/home/services'
import Stats from '@/components/home/stats'

const Home = () => {
  return (
    <div className="overflow-x-hidden bg-white">
      <NavBar active="Home"/>
      <HomeHeader/>
      <Stats/>
      <About/>
      <Services/>
      <Courses/>
      <CampusLife/>
      <SecondAbout/>
      <AdmissionSteps/>
      <Leadership/>
      <ContactCta/>
      <Footer/>
    </div>
  )
}

export default Home
