import { useState, useLayoutEffect, useEffect } from 'react';
import {Link} from '~/components';
import {gsap} from 'gsap';
import {useIsHomePath} from '~/lib/utils';

export default function Topbar() {

    const [open, setOpen] = useState('flex');
    const isHome = useIsHomePath();

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
                    {isHome ? (
                        <Link className="home-logo" to="/"><span>siberia</span></Link>
                    ) : (
                        <Link to="/"><span>siberia</span></Link>
                    )}
                </div>

                <div onClick={openMenu} className="hamburger">
                    <img src="/cart.png" />
                </div>

            </div>
        </div>
    )
}