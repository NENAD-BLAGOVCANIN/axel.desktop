import React from 'react';
import { ReactComponent as AxelSVG } from '../assets/img/svg/axel.svg'

const Main = () => {
    return (
        <div className='w-100 flex-column d-flex align-items-center justify-content-center' style={{ height: '100vh' }}>
            <AxelSVG />
            <div style={{ maxWidth: 700 }}>
                <h2 className='bold mt-3 mb-5'>What shall I do next?</h2>
                <input type="text" className='form-control' placeholder='Command...' />
            </div>

        </div>
    );
}

export default Main;
