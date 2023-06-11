import {useState} from 'react';

export function PlusOverlay({ open }) {
    return (
        <div id="plus-overlay" style={{ display: open }} className="plus-overlay">
            <ul className="header">
                <li className="active">shop</li>
                <li>about</li>
                <li>contact</li>
                <li>sound</li>
                <li>lookbook</li>
            </ul>
            <div className="wrap">
                <ul className="list">
                    <li className="active">
                        <span>
                            all
                        </span>
                    </li>
                    <li>
                        <span>
                            shirts
                        </span>
                    </li>
                    <li>
                        <span>
                            pants
                        </span>
                    </li>
                    <li>
                        <span>
                            accessories
                        </span>
                    </li>
                    <li>
                        <span>
                            womens
                        </span>
                    </li>
                </ul>
            </div>
            <ul className="footer">
                <li>terms</li>
                <li>policy/questions</li>
            </ul>
        </div>
    );
}

export default function PlusHamburger() {

    const [open, setOpen] = useState('none');

    const handleClick = () => {

        if (open === 'none') {
            setOpen('block');
        } else {
            setOpen('none');
        }
        
        // const overlay = document.getElementById('plus-overlay');
    }

    return (
        <div className="plus-hamburger">
            <PlusOverlay open={open} />
            <div className="wrap">
                <span className="plus" onClick={handleClick}>
                    <img src="/cross.svg" alt="Open Filters" />
                </span>
            </div>
        </div>
    );
}