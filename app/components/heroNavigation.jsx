import { Parallax } from 'react-scroll-parallax';
import {gsap} from 'gsap';
import { ExpoScaleEase, RoughEase, SlowMo } from "gsap/EasePack";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { Draggable } from "gsap/Draggable";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, Draggable, ExpoScaleEase, RoughEase, SlowMo);

export default function HeroNavigation() {

    const handleClick = (e) => {
        e.preventDefault();
        
        /* Show the Component */
        const selected = e.target.getAttribute('data-title');
        const classed = document.getElementsByClassName(selected);

        // Clear currently shown
        gsap.to('.page-components', {
            opacity: 0,
            duration: 0.01,
            onComplete: () => {
                gsap.to('.page-component', { display: 'none' });
            }
        });

        // Show selected component, then scroll to it
        gsap.to(classed, {
            delay: 0.2,
            display: 'block',
            onStart: () => {

                // Fade in after display: block
                gsap.to(classed, {
                    y: 0,
                    opacity: 1,
                    duration: 0.34,
                    delay: 0.3
                })
            },
            onComplete: () => {
                
                // Scroll Down
                gsap.to(window, { 
                    scrollTo: "#modules", 
                    duration: 1, 
                });
            }

        });


        // Show Logo
        gsap.to(".home-logo", {
            opacity: 1,
            duration: 0.24,
            scrollTrigger: {
              trigger: "#modules",
              start: "top top",
              toggleActions: "restart none none reverse"
            }
        });

        // Show Plus Hamburger
        gsap.to(".plus-hamburger", {
            opacity: 1,
            duration: 0.24,
            scrollTrigger: {
                trigger: "#modules",
                start: "top bottom",
                toggleActions: "restart none none reverse"
            }
        });
        

        // Hide Marquee
        gsap.to(".marquee-container", {
            y: 100,
            delay: 0.6,
            duration: 0.2,
            onComplete: () => {
                gsap.to(".marquee-container", { display: "none" });
            }
        })

    }

    return (
        <section className="hero-navigation">
            <div className="wrapper">

                {/* LINKS */}
                <div className="left">
                    <div className="wrap">

                        {/* Title */}
                        <Parallax style={{ width: '100%' }} translateY={['-100px', '100px']}>
                            <div className="title">
                                <h1>Siberia</h1>
                            </div>
                        </Parallax>


                        {/* Links */}
                        <Parallax style={{ width: '100%' }} translateY={['-100px', '100px']}>
                            <div className="links">
                                <ul>
                                    <li>
                                        <span onClick={handleClick} data-title="shop">Shop</span>
                                    </li>
                                    <li>
                                        <span onClick={handleClick} data-title="about">About</span>
                                    </li>
                                    <li>
                                        <span onClick={handleClick} data-title="contact">Contact</span>
                                    </li>
                                    <li>
                                        <span onClick={handleClick} data-title="lookbook">Lookbook</span>
                                    </li>
                                    <li>
                                        <span onClick={handleClick} data-title="sign-up">Sign up</span>
                                    </li>
                                </ul>
                            </div>
                        </Parallax>

                        
                    </div>
                </div>
         

                {/* PARALLAX */}
                <div className="right">
                    <div className="wrap">

                        <Parallax className="wiki floater" translateY={[ '20%', '-100%' ]} translateX={[ '14vw', '14vw' ]}>
                            <img src="/wiki.png" style={{ maxWidth: '340px' }} />
                        </Parallax>
                        <Parallax className="plants floater" translateY={[ '-100%', '10%' ]} translateX={[ '-3vw', '-3vw' ]}>
                            <img src="/plants.png" style={{ maxWidth: '340px' }} />
                        </Parallax>
                        <Parallax className="suffer floater" translateY={[ '-20%', '-400%' ]}  translateX={[ '14vw', '14vw' ]}>
                            <img src="/suffer.png" style={{ maxWidth: '180px' }} />
                        </Parallax>

                    </div>
                </div>

            </div>
        

        </section>
    );
}