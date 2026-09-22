import React from 'react'

const HeroSection = () => {
  return (
    <section className='w-full relative h-[90vh] flex flex-col items-center justify-center relative'>
        <h1 className='text-[13rem] font-bold text-center text-white z-10'>SKILL MENTOR</h1>
        <p className='text-center text-white text-[4rem] font-thin -mt-8 z-10'>Your AI-Powered Roadmap to Career Success</p>
        <button className="px-8 py-4 bg-purple-600 rounded-full font-semibold text-lg hover:bg-purple-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/50 z-10 mt-8 relative">
          Get Started for Free
        </button>
        {/* <iframe src='https://my.spline.design/particles-po5l1cELutarzmUGPUs6zvuT/' frameborder='0' width='100%' height='100%' className='absolute top-0 left-0 w-full h-full z-0'></iframe> */}
        <iframe src='https://my.spline.design/orb-LC6cQPoq6RGL6NlylH8xUQdH/' frameborder='0' width='100%' height='100%' className='absolute top-0 left-0 w-full h-full z-0'></iframe>
        <div className="w-[150px] h-[40px] bg-black z-20 absolute bottom-5 right-2"></div>
      </section>
  )
}

export default HeroSection