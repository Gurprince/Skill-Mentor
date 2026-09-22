import React from 'react'

const HowItwork = () => {
    return (
        <>
            <section className='w-full min-h-screen pt-12 bg-[radial-gradient(circle,rgba(140,73,233,0.4)_0%,rgba(140,73,233,0)_70%)]' id='how-it-work'>
                <div className="content flex flex-col items-center justify-center gap-6 px-4">
                    <h1 className='text-5xl md:text-7xl font-extrabold text-center text-white z-10 tracking-tight'>How It Works</h1>
                    <p className='max-w-3xl text-center text-white text-lg md:text-xl font-light -mt-4 z-10 opacity-90'>Transform your career journey with our AI-powered approach that guides you from where you are to where you want to be.</p>
                </div>

                <div className="cards mt-16 px-6 md:px-12 flex justify-center flex-wrap gap-8 pb-8">
                    {/* Card 1: Create Your Profile */}
                    <div className="card w-full max-w-[430px] min-h-[320px] text-white flex flex-col gap-6 border border-gray-600/30 rounded-xl p-6 bg-white/10 backdrop-blur-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out">
                        <div className="svg w-14 h-14 bg-[#8C49E9] p-3 rounded-full flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                                <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                                <path d="M20 21C20 17.134 16.4183 14 12 14C7.58172 14 4 17.134 4 21" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </div>
                        <div className="content flex flex-col gap-4">
                            <h4 className='text-[1.8rem] font-semibold tracking-tight'>Create Your Profile</h4>
                            <p className='text-[1.2rem] font-light leading-relaxed opacity-85'>Tell us your career goals, current skills, and experience level. Our AI customizes your journey to fit your unique aspirations.</p>
                        </div>
                    </div>

                    {/* Card 2: Analyze the Job Market */}
                    <div className="card w-full max-w-[430px] min-h-[320px] text-white flex flex-col gap-6 border border-gray-600/30 rounded-xl p-6 bg-white/10 backdrop-blur-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out">
                        <div className="svg w-14 h-14 bg-[#8C49E9] p-3 rounded-full flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                                <path d="M3 9H21M7 3V5M17 3V5M6 12H8M11 12H13M16 12H18M6 15H8M11 15H13M16 15H18M6 18H8M11 18H13M16 18H18M5 20C4.44772 20 4 19.5523 4 19V9C4 8.44772 4.44772 8 5 8H19C19.5523 8 20 8.44772 20 9V19C20 19.5523 19.5523 20 19 20H5Z" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </div>
                        <div className="content flex flex-col gap-4">
                            <h4 className='text-[1.8rem] font-semibold tracking-tight'>Analyze the Job Market</h4>
                            <p className='text-[1.2rem] font-light leading-relaxed opacity-85'>Our AI monitors thousands of job postings to identify trending skills, salary ranges, and market demands in real-time.</p>
                        </div>
                    </div>

                    {/* Card 3: Generate Your Roadmap */}
                    <div className="card w-full max-w-[430px] min-h-[320px] text-white flex flex-col gap-6 border border-gray-600/30 rounded-xl p-6 bg-white/10 backdrop-blur-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out">
                        <div className="svg w-14 h-14 bg-[#8C49E9] p-3 rounded-full flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                                <path d="M9 11L11 13L15 9M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="content flex flex-col gap-4">
                            <h4 className='text-[1.8rem] font-semibold tracking-tight'>Generate Your Roadmap</h4>
                            <p className='text-[1.2rem] font-light leading-relaxed opacity-85'>Receive a tailored learning path that bridges the gap between your current skills and your dream role.</p>
                        </div>
                    </div>

                    {/* Card 4: Get Feedback */}
                    <div className="card w-full max-w-[430px] min-h-[320px] text-white flex flex-col gap-6 border border-gray-600/30 rounded-xl p-6 bg-white/10 backdrop-blur-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out">
                        <div className="svg w-14 h-14 bg-[#8C49E9] p-3 rounded-full flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                                <path d="M3 12H21M12 3V21M3 12L7 8M3 12L7 16M21 12L17 8M21 12L17 16" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="content flex flex-col gap-4">
                            <h4 className='text-[1.8rem] font-semibold tracking-tight'>Get Feedback</h4>
                            <p className='text-[1.2rem] font-light leading-relaxed opacity-85'>Practice with real-world projects, tackle challenges, and receive AI-driven feedback to refine your skills.</p>
                        </div>
                    </div>

                    {/* Card 5: Track Your Progress */}
                    <div className="card w-full max-w-[430px] min-h-[320px] text-white flex flex-col gap-6 border border-gray-600/30 rounded-xl p-6 bg-white/10 backdrop-blur-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out">
                        <div className="svg w-14 h-14 bg-[#8C49E9] p-3 rounded-full flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                                <path d="M12 2V6M12 18V22M2 12H6M18 12H22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="content flex flex-col gap-4">
                            <h4 className='text-[1.8rem] font-semibold tracking-tight'>Track Your Progress</h4>
                            <p className='text-[1.2rem] font-light leading-relaxed opacity-85'>Monitor your growth, set achievable goals, complete tasks, and celebrate milestones on your career path.</p>
                        </div>
                    </div>

                    {/* Card 6: Showcase Your Portfolio */}
                    <div className="card w-full max-w-[430px] min-h-[320px] text-white flex flex-col gap-6 border border-gray-600/30 rounded-xl p-6 bg-white/10 backdrop-blur-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out">
                        <div className="svg w-14 h-14 bg-[#8C49E9] p-3 rounded-full flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                                <path d="M5 8H19M5 8C3.89543 8 3 8.89543 3 10V16C3 17.1046 3.89543 18 5 18H19C20.1046 18 21 17.1046 21 16V10C21 8.89543 20.1046 8 19 8M5 8V6C5 4.89543 5.89543 4 7 4H17C18.1046 4 19 4.89543 19 6V8M12 12H12.01" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="content flex flex-col gap-4">
                            <h4 className='text-[1.8rem] font-semibold tracking-tight'>Showcase Your Portfolio</h4>
                            <p className='text-[1.2rem] font-light leading-relaxed opacity-85'>Build a compelling portfolio that highlights your skills and achievements to impress potential employers.</p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default HowItwork