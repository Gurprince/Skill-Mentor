import React from 'react'
import mockup2 from '../assests/mockup2.jpg'
import mockup from '../assests/mockup.jpg'
const Features = () => {
  return (
    <section className="relative bg-black py-20 px-6 md:px-12">
  <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
    
    {/* Left Content */}
    <div className="space-y-8">
      <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
        <span className="block bg-gradient-to-r from-[#8C49E9] to-[#4CC9F0] bg-clip-text text-transparent">
          Personalized Learning
        </span>
        <span className="block bg-gradient-to-r from-[#38E1B3] to-[#3B82F6] bg-clip-text text-transparent">
          AI Insights
        </span>
        <span className="block bg-gradient-to-r from-[#EC4899] to-[#9333EA] bg-clip-text text-transparent">
          Gamified Progress
        </span>
      </h2>
      <p className="text-gray-300 text-lg max-w-md">
        Unlock your career potential with SkillMentor — tailored skill paths, 
        real-time AI feedback, and a motivational progress system to keep you moving forward.
      </p>
    </div>

    {/* Right Content - Mockups */}
    <div className="relative flex justify-center items-center">
      <div className="w-[300px] md:w-[400px] transform rotate-2 hover:rotate-0 transition-transform duration-500">
        <img
          src={mockup}
          alt="SkillMentor Dashboard"
          className="rounded-xl shadow-2xl border border-gray-700"
        />
      </div>
      <div className="absolute top-12 -right-8 w-[250px] md:w-[320px] transform -rotate-2 hover:rotate-0 transition-transform duration-500">
        <img
          src={mockup2}
          alt="Learning Path Preview"
          className="rounded-xl shadow-2xl border border-gray-700"
        />
      </div>
    </div>

  </div>
</section>

  )
}

export default Features