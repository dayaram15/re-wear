import React from 'react'
import Navbar from '../components/Navbar2'
import { Button } from '../components/ui/button'
import { useNavigate } from 'react-router-dom'

const Home = () => {
     const navigate = useNavigate()
  return (
    <div>
         <Navbar/>
      <div className="bg-cyan-700  text-white font-bold text-5xl h-screen w-screen flex justify-center items-center ">
        <div className="flex flex-col gap-5">
          We are ready for Hackthon..!
          <Button onClick={()=>navigate("/login")} className=" text-custome-text ">Get Start</Button>
        </div>
        </div>
    </div>
  )
}

export default Home