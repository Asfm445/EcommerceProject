import { Button } from '@mui/material';
import React from 'react'

function Profile() {
    return ( <div className="forms">
        <form>
            <h2 style={{textAlign:"center"}}>profile</h2>
            <input type="text" name='fname' placeholder='first name' />
            <input type="text" name='lname' placeholder='last name' />
            <input type="url" name='location' placeholder='location'/>
            <Button type='submit' className='submit'>submit</Button>
        </form>
    </div> );
}

export default Profile;