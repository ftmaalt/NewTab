 const daysOfWeek=['Sun', 'Mon', 'Tue', 'Wed', 'Thu','Fri','Sat'];
            const monthsOfYear=['Jan','Feb', 'Mar','Apr','May','Jun', 'Jul','Aug','Sep','Oct','Nov','Dec'];
        function updateDate(){
            const timeNow= new Date();
// Day logic
           
            const dayName=daysOfWeek[timeNow.getDay()];
            const monthName=monthsOfYear[timeNow.getMonth()];
            const dateNum=timeNow.getDate();
            const yearNum=timeNow.getFullYear();

            const dateString = `${dayName}, ${monthName} ${dateNum}th, ${yearNum}`;            
            document.getElementById('date').textContent=dateString;
// Time Logic
            let hours= timeNow.getHours();
            let minutes=timeNow.getMinutes();

            const ampm = hours >= 12 ? 'Pm' : 'Am';

            hours= hours % 12;
            hours =hours? hours :12;

            if (hours<10) {
                hours='0'+ hours;
            }
            if (minutes<10) {
                minutes='0'+ minutes;
            }
            const timeString = `${hours}:${minutes}`;            
            document.getElementById('time').textContent=timeString;
        
      

        }
            updateDate();
            setInterval(updateDate, 60000);
        

