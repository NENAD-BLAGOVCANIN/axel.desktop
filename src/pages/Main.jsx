import React, { useState } from 'react';
import { ReactComponent as AxelSVG } from '../assets/img/svg/axel.svg'
import { Send } from 'react-bootstrap-icons'

const Main = () => {

    const [command, setCommand] = useState('');

    const handleSendCommand = () => {
        window.ipcRenderer.send('execute-command', command)
    }

    return (
        <div className='w-100 flex-column d-flex align-items-center justify-content-center' style={{ height: '100vh' }}>
            <AxelSVG />
            <div style={{ maxWidth: 700 }}>
                <h2 className='bold mt-3 mb-5'>What shall I do next?</h2>
                <form className='d-flex' onSubmit={() => handleSendCommand()}>
                    <input type="text" className='form-control' value={command} onChange={(e) => setCommand(e.target.value)} placeholder='Command...' />
                    <button type='submit' className='btn btn-dark'><Send /> </button>
                </form>
            </div>

        </div>
    );
}

export default Main;
