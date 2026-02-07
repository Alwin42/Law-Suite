import { useRef } from "react";

import { Button } from "./ui/Button";

import { ArrowRight, CheckCircle2 } from "lucide-react";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";



const LandingPage = () => {

const containerRef = useRef(null);


// 1. Track scroll progress

const { scrollYProgress } = useScroll({

target: containerRef,

offset: ["start start", "end end"],

});



// 2. SMOOTHING MAGIC: Add physics to the scroll progress

// mass: weight of the object (heavier = slower to start/stop)

// stiffness: tension of the spring (lower = looser/smoother)

// damping: friction (higher = less bounce)

const smoothProgress = useSpring(scrollYProgress, {

mass: 0.1,

stiffness: 100,

damping: 20,

restDelta: 0.001

});



// 3. Animations now use the SMOOTH progress, not the raw scroll


// Image moves from Right (50%) to Left (0%)

const imageLeftPosition = useTransform(smoothProgress, [0, 1], ["50%", "0%"]);


// Text Opacity cross-fade

const heroOpacity = useTransform(smoothProgress, [0, 0.5], [1, 0]);

const aboutOpacity = useTransform(smoothProgress, [0.5, 1], [0, 1]);


// Content sliding for extra polish

const heroX = useTransform(smoothProgress, [0, 0.5], ["0%", "-50%"]);

const aboutX = useTransform(smoothProgress, [0.5, 1], ["50%", "0%"]);



return (

<div ref={containerRef} className="relative h-[200vh] bg-background">


{/* ----------------- STICKY BACKGROUND (THE ANIMATING IMAGE) ----------------- */}

<div className="sticky top-0 h-screen w-full overflow-hidden z-0">

{/* Background Patterns */}

<div className="absolute inset-0 opacity-[0.03] pointer-events-none">

<svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">

<path d="M0 50 Q 25 60, 50 50 T 100 50" stroke="currentColor" strokeWidth="0.5" fill="none" />

<path d="M0 60 Q 25 70, 50 60 T 100 60" stroke="currentColor" strokeWidth="0.5" fill="none" />

</svg>

</div>



{/* The Animated Lady Justice Image */}

<motion.div

style={{ left: imageLeftPosition }}

className="absolute top-0 h-full w-1/2 flex items-center justify-center bg-background/50 backdrop-blur-[1px]"

>

<img

src="./public/lady-justice.png"

alt="Statue of Lady Justice"

className="object-cover h-[85%] w-auto drop-shadow-2xl grayscale-[30%] contrast-110"

/>

</motion.div>

</div>



{/* ----------------- SCROLLABLE CONTENT LAYERS ----------------- */}


{/* SECTION 1: HERO (Text on Left) */}

<div className="absolute top-0 left-0 w-full h-screen z-10 flex items-center pointer-events-none">

<div className="container mx-auto px-6 grid md:grid-cols-2 w-full">

<motion.div

style={{ opacity: heroOpacity, x: heroX }}

className="pointer-events-auto max-w-xl pt-20"

>

<h1 className="text-5xl md:text-6xl font-bold tracking-tight text-primary uppercase mb-6 leading-tight">

Law Suite

</h1>

<h2 className="text-xl md:text-2xl text-accent font-normal leading-relaxed mb-10">

Streamlining Legal Workflows Through <br className="hidden md:block"/> Unbiased Digital Automation

</h2>

<div className="flex gap-4">

<Button variant="ghost" className="group text-lg px-0 hover:bg-transparent">

Login

<ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />

</Button>

</div>

</motion.div>

{/* Empty Right Column */}

<div className="hidden md:block"></div>

</div>

</div>



{/* SECTION 2: ABOUT (Text on Right) */}

<div className="absolute top-[100vh] left-0 w-full min-h-screen z-10 flex items-center pointer-events-none">

<div className="container mx-auto px-6 grid md:grid-cols-2 w-full">

{/* Empty Left Column */}

<div className="hidden md:block"></div>



{/* About Content on Right */}

<motion.div

style={{ opacity: aboutOpacity, x: aboutX }}

className="pointer-events-auto py-20"

>

<span className="text-sm font-bold tracking-widest text-primary uppercase mb-2 block">

About Law Suite

</span>

<h3 className="text-3xl md:text-4xl font-bold text-primary mb-6">

Revolutionizing Legal Practice

</h3>

<p className="text-accent mb-8 leading-relaxed">

Law Suite is an advanced Automated Digital Workspace designed specifically for legal advocates.

We believe that technology should empower legal professionals to focus on what matters most.

</p>



<div className="space-y-6">

<div className="grid grid-cols-1 gap-4">

<div className="p-4 bg-white/80 border border-gray-100 rounded-lg shadow-sm backdrop-blur-sm">

<h4 className="font-semibold text-primary mb-1">Our Vision</h4>

<p className="text-sm text-accent">Creating a future where every advocate has access to intelligent digital tools that eliminate unconscious bias.</p>

</div>

</div>



<div className="space-y-3">

<h4 className="font-semibold text-primary text-sm uppercase tracking-wide">Key Features</h4>

<ul className="grid grid-cols-1 gap-2">

{[

"Intelligent Workflow Automation",

"Bias-Free Decision Support",

"Centralized Document Management",

"Secure Collaboration Platform"

].map((item, idx) => (

<motion.li

key={idx}

initial={{ opacity: 0, x: 20 }}

whileInView={{ opacity: 1, x: 0 }}

transition={{ delay: idx * 0.1 }}

className="flex items-center text-sm text-accent"

>

<CheckCircle2 className="w-4 h-4 mr-3 text-primary" />

{item}

</motion.li>

))}

</ul>

</div>

</div>

</motion.div>

</div>

</div>



</div>

);

};



export default LandingPage;