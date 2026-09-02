import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { HomePage } from "@/pages/HomePage"
import { WeekPage } from "@/pages/WeekPage"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/week/:weekId" element={<WeekPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
