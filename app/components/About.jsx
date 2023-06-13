export default function About({ title, body, page, gallery }) {
    return (
        <div className="wrapper">

            <div className="left">
                <h1>{title}</h1>

                <div className="about-body">
                    <div className="wrap" dangerouslySetInnerHTML={{__html: body}} />
                </div>
            </div>

            <div className="right">
                <div className="image-holder">
                        {gallery}
                </div>
                <div className="image-holder">
                    <img src="/question-mark.png" alt="" />
                </div>
            </div>


        </div>
    );
}