//import 'aos/dist/aos.css';
import "@/css/public.css";
import { Unbounded, Inter, Poppins, Roboto } from "next/font/google";
import Navbar from "./_components/Navbar";
import StickyBottomBar from "./_components/StickyBottomBar";

const unbounded = Unbounded({ subsets: ["latin"] });
const font = Inter({ subsets: ["latin"] });

export default function PublicLayout({ children }) {
    return (
        <div className={`${font.className} flex flex-col min-h-screen overflow-x-auto pb-24`} >
            <div className=''>
                <Navbar />
            </div>

            <div className='flex grow w-full' >
                {children}
            </div>
            <div className=''>
                <StickyBottomBar />
            </div>
        </div>
    )
}
