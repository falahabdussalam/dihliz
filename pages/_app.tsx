import '../styles/globals.css'
import type { AppProps } from 'next/app'
import AOS from 'aos';
import "aos/dist/aos.css";
import {useEffect} from 'react';
import NextNProgress from 'nextjs-progressbar';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    AOS.init({
      easing: "ease-out-cubic",
      once: false,
      offset: 50,
    });
  }, []);
  return (
    <>
    <NextNProgress 
    color='#289942'
    />
   <div data-theme="dihlizTheme"> <Component {...pageProps} /></div>
  </>
  )
}

export default MyApp
