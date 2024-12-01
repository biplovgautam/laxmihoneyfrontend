import React,{Suspense} from "react";
import { Routes, Route } from "react-router-dom";
import Footer from "./components/Footer/Footer";
import Navbar from "./components/Navbar.jsx";
import Bee from "./components/Bee.jsx";
import Home from "./Pages/Home";
const Products = React.lazy(() => import('./Pages/Products'))
const Blogs = React.lazy(() => import('./Pages/Blogs'))
const About = React.lazy(() => import('./Pages/About'))
const Contact = React.lazy(() => import('./Pages/Contact'))
//import Products from "./Pages/Products";
//import Blogs from "./Pages/Blogs";
//import About from "./Pages/About";
//import Contact from "./Pages/Contact";
import NotFound from "./Pages/Not_found";




const App = () => {
  return (
    <main className="overflow-x-hidden min-h-screen relative">
      <Navbar /> {/* Navbar will be fixed/sticky on top */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Suspense fallback={<Bee/>}><Products /></Suspense>} />
        <Route path="/blogs" element={<Suspense fallback={<Bee/>}><Blogs /></Suspense>} />
        <Route path="/about" element={<Suspense fallback={<Bee/>}><About /></Suspense>} />
        <Route path="/contact" element={<Suspense fallback={<Bee/>}><Contact /></Suspense>} />
        
        <Route path="*" element={<NotFound/>} />
      </Routes>
      <Footer />
    </main>
  );
};

export default App;