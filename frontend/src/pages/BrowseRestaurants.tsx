import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
 
 const BrowseRestaurants: React.FC = () => { 
   const searchRef = useRef<HTMLInputElement | null>(null);
 
   useEffect(() => { 
     const input = searchRef.current; 
     if (!input) return;
 
     const handleFocus = () => { 
       input.parentElement?.classList.add("scale-[1.01]"); 
     };
 
     const handleBlur = () => { 
       input.parentElement?.classList.remove("scale-[1.01]"); 
     };
 
     input.addEventListener("focus", handleFocus); 
     input.addEventListener("blur", handleBlur);
 
     return () => { 
       input.removeEventListener("focus", handleFocus); 
       input.removeEventListener("blur", handleBlur); 
     }; 
   }, []);
 
   return ( 
     <div className="text-on-surface"> 
       {/* HEADER */} 
       <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-desktop h-20 max-w-container-max mx-auto bg-surface shadow-sm"> 
         <div className="flex items-center gap-base cursor-pointer hover:opacity-80 transition-opacity"> 
           <Link to="/" className="flex items-center gap-base">
             <span className="material-symbols-outlined text-primary"> 
               arrow_back 
             </span> 
             <span className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider"> 
               Back Home 
             </span>
           </Link> 
         </div>
 
         <div className="absolute left-1/2 -translate-x-1/2 text-center"> 
           <h1 className="text-headline-md font-headline-md font-bold text-primary"> 
             Browse Restaurants 
           </h1> 
           <p className="text-body-sm font-body-sm text-on-surface-variant"> 
             Discover amazing food near you 
           </p> 
         </div>
 
         <div className="flex items-center gap-md"> 
           <nav className="hidden md:flex gap-md items-center"> 
             <a 
               className="text-primary border-b-2 border-primary pb-1 font-label-bold text-label-bold hover:text-primary transition-colors" 
               href="#" 
             > 
               Home 
             </a> 
           </nav> 
           <Link to="/login" className="bg-primary-container text-on-primary font-label-bold text-label-bold py-xs px-sm rounded hover:opacity-90 transition-opacity">
             Sign In
           </Link>
         </div> 
       </header>
 
       {/* MAIN */} 
       <main className="pt-32 pb-xl px-margin-desktop max-w-container-max mx-auto min-h-screen"> 
         {/* SEARCH */} 
         <section className="mb-lg"> 
           <div className="relative w-full max-w-container-max"> 
             <span className="material-symbols-outlined absolute left-base top-1/2 -translate-y-1/2 text-on-secondary-fixed-variant"> 
               search 
             </span> 
             <input 
               ref={searchRef} 
               className="w-full h-14 pl-12 pr-base rounded bg-surface border-b-2 border-surface-dim focus:border-primary-container focus:ring-0 transition-all text-body-md font-body-md outline-none custom-shadow" 
               placeholder="Search restaurants by name or cuisine..." 
               type="text" 
             /> 
           </div> 
         </section>
 
         {/* GRID */} 
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg"> 
           {[1, 2, 3].map((i) => ( 
             <article 
               key={i} 
               className="bg-surface-container-lowest rounded-xl overflow-hidden custom-shadow group cursor-pointer transform hover:-translate-y-2 transition-transform duration-300" 
             > 
               <div className="aspect-video overflow-hidden"> 
                 <img 
                   className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                   src="https://via.placeholder.com/400" 
                   alt="restaurant" 
                 /> 
               </div>
 
               <div className="p-md space-y-base"> 
                 <div className="flex justify-between items-start"> 
                   <h2 className="text-headline-sm font-headline-sm text-on-surface"> 
                     Restaurant {i} 
                   </h2>
 
                   <div className="flex items-center text-primary-container"> 
                     <span 
                       className="material-symbols-outlined text-sm" 
                       style={{ fontVariationSettings: "'FILL' 1" }} 
                     > 
                       star 
                     </span> 
                     <span className="text-label-bold font-label-bold ml-1"> 
                       4.{i} 
                     </span> 
                   </div> 
                 </div>
 
                 <p className="text-label-bold font-label-bold text-primary-container uppercase tracking-widest"> 
                   Category 
                 </p>
 
                 <p className="text-body-md font-body-md text-on-secondary-fixed-variant line-clamp-2"> 
                   Description goes here... 
                 </p>
 
                 <button className="w-full mt-md bg-primary-container text-on-primary font-label-bold text-label-bold py-sm rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-md"> 
                   Book a Table 
                 </button> 
               </div> 
             </article> 
           ))} 
         </div>
 
         {/* LOAD MORE */} 
         <div className="mt-xl flex justify-center"> 
           <button className="flex items-center gap-xs text-primary font-label-bold text-label-bold hover:underline py-base px-lg transition-all"> 
             VIEW MORE RESTAURANTS 
             <span className="material-symbols-outlined">expand_more</span> 
           </button> 
         </div> 
       </main>
 
       {/* FOOTER */} 
       <footer className="w-full py-lg px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-md bg-surface-container"> 
         <div className="text-center md:text-left"> 
           <h2 className="text-headline-sm font-headline-sm text-secondary"> 
             GourmetConcierge 
           </h2> 
           <p className="text-body-sm font-body-sm text-on-secondary-fixed-variant mt-1"> 
             © 2024 GourmetConcierge. All rights reserved. 
           </p> 
         </div> 
       </footer> 
     </div> 
   ); 
 };
 
 export default BrowseRestaurants;