import axios from "axios";



const BASEURL = process.env.NEXT_PUBLIC_APP_URL

export default axios.create({
    baseURL: BASEURL,
    headers: { "Content-Type": "application/json" }
})