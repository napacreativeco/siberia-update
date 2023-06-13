import {Link} from '~/components';

export default function GridChanger({ setIsList, isList }) {

    const handleClick = () => {
        if (isList === 'grid' ) { 
            setIsList('list') 
        } else { 
            setIsList('grid') 
        }
        console.log(isList)
    }

    return (
        <div className="grid-changer">

            {/* Cross Hair */}
            <div className="crosshair" onClick={handleClick}>
                <img src="/crosshair.svg" alt="Grid View" />
            </div>

            {/* Pagination */}
            <div className="pagination">
                01-<Link to="/collections/all/">all</Link>
            </div>
            
        </div>
    );
}