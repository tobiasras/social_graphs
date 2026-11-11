import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { HomePage } from "@/pages/HomePage"
import { Week1 } from "@/pages/Week1"
import { Week2 } from "@/pages/Week2"
import { FinalProject } from "@/pages/FinalProject"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/week1" element={<Week1 />} />
        <Route path="/week2" element={<Week2 />} />
        <Route path="/final-project" element={<FinalProject />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
