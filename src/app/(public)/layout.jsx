//import "@/css/public.css";
import Navbar from "./_components/Navbar";
import Footer from "./_components/Footer";
import StickyBottomBar from "./_components/StickyBottomBar";

export default function PublicLayout({ children }) {
    return (
        <div className="public-theme flex flex-col min-h-screen pb-24 font-sans selection:bg-primary/20 selection:text-primary" >
            <div>
                <Navbar />
            </div>

            <div className='flex grow w-full' >
                {children}
            </div>
            <div className=''>
                <Footer />
            </div>
            {/* <Chatbot /> */}
            <StickyBottomBar />
        </div>
    )
}
