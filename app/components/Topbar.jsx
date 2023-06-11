import { useState } from 'react';
import {gsap} from 'gsap';

export default function Topbar() {

    const [open, setOpen] = useState('flex');

    const openMenu = () => {

        if (open === 'none') {
            setOpen('flex');
        } else {
            setOpen('none');
        }

        gsap.to('.cart-modal', {
            display: open
        })
    }

    return (
        <div className="topbar">
            <div className="wrapper">
                <div id="logo" className="logo">
                    <span>siberia</span>
                </div>
                <div onClick={openMenu} className="hamburger">
                    <img src="/cart.png" />
                </div>
            </div>
        </div>
    )
}