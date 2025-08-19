import { Outlet } from "react-router-dom"
import LandingHeader from "../components/landing/LandingHeader"
import LandingFooter from "../components/landing/LandingFooter"

export default function LandingLayout() {
    return (
        <div className="min-h-screen bg-white">
            <LandingHeader />
            <main>
                <Outlet />
            </main>
            <LandingFooter />
        </div>
    )
}
