//import 'aos/dist/aos.css';
// import "@/css/public.css";
import { Unbounded, Inter, Poppins, Roboto } from "next/font/google";
import Footer from "./_components/Footer";
import Header from "./_components/Header";
import WhatsAppWidget from "./_components/WhatsAppWidget";
import ExitIntentPopup from "./_components/ExitIntentPopup";



const unbounded = Unbounded({ subsets: ["latin"] });
const font = Inter({ subsets: ["latin"] });

export default function PublicLayout({ children }) {




    return (
        <div className={`${font.className} flex flex-col  min-h-screen overflow-x-auto `} >
            <div className=''>
                <Header />
            </div>

            <div className='flex grow' >
                {children}
            </div>
            <div className=''>
                <Footer />
                <WhatsAppWidget />
                <ExitIntentPopup />
            </div>
        </div>
    )
}
