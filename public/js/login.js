/* eslint-disable */

const login = async (email, password) => {
    try{
        const res = await axios({
            method: 'POST',
            url: 'https://127.0.0.1:8000/api/v1/users/login',
            data: {
                email,
                password
            }
        })
        console.log(res);
    } catch(err){
        if (err.response && err.response.data) {
            alert(err.response.data.message);
        } else {
            alert('An error occurred while logging in. Please try again.');
        }
    }
    }
   
   

document.querySelector('.form').addEventListener('submit', e => {
    e.preventDefault();
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;

    // Perform validation
    if (!email || !password) {
        alert('Please fill in all fields.');
        return;
    }
    
    // Simulate login process
    console.log('Logging in with:', { email, password });
    
    // Redirect to home page after successful login
    window.location.href = '/home';
})