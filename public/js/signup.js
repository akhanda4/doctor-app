document.getElementById("form").addEventListener('submit', (event) => {
    let pwd_len = document.getElementById("password").value.length;
    if (pwd_len < 7) {
        event.preventDefault();
        alert("Password too weak");
    }
})
