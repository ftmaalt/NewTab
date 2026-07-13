function initGreeting(){
    chrome.storage.local.get(['userName'], result =>{
        if(result.userName){
            document.getElementById('user-name').style.display = 'none';
            greetByTime(result.userName);
        }else{
            document.getElementById('user-name').style.display = 'block';        }
    });
}

function greetByTime(name) {
    let greeter;
    const time= new Date();
    const hours= time.getHours();


    if (hours<12) {
        greeter= "Good Morning,";
    }else if(hours< 18){
        greeter= "Good Afternoon,";
    }else{
        greeter= "Good Evening,";
    }

    document.getElementById('greeting').textContent = `${greeter} ${name}`;
}

document.getElementById('name-save').addEventListener('click', saveName);
document.getElementById('name-input').addEventListener('keypress', (e) =>{
    if (e.key==='Enter') {
        saveName();
    }
});

function saveName() {
    const input = document.getElementById('name-input');
    const name = input.value.trim();
    if (!name) return;

    chrome.storage.local.set({userName: name}, ()=>{
        document.getElementById('user-name').style.display='none';
        greetByTime(name);
    });
}
initGreeting();
