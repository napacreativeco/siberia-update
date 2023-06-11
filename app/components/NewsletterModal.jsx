import {gsap} from 'gsap';

export default function NewsletterModal() {

    const closeModal = () => {
        gsap.to(".newsletter-modal", {
            display: "none"
        })
    }

    return (
        <div className="modal newsletter-modal">
            <div className="wrapper">

                {/* ACTION BAR */}
                <div className="action-bar">
                    <div className="title">
                        <span>newsletter</span>
                    </div>                   
                    <div className="close" onClick={closeModal}>
                        <span>&times;</span>
                    </div>
                </div>

                <div className="newsletter-body">
                    <div className="warning">
                        <span>
                            WARNING: SEVERE NECESSITY,<br />
                            IMMEDIATE ACTION REQUIRED
                        </span>
                    </div>

                    <div className="newsletter-form">
                        <form>
                            <input type="email" placeholder="your email" />
                            <input type="submit" />
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
}