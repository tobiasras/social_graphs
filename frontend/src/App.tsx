import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { HomePage } from "@/pages/HomePage"
import { Week1 } from "@/pages/Week1"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/week1" element={<Week1 />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
