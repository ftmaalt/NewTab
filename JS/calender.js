// ---------- Auth ----------
function getAuthToken(interactive = true) {
    return new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive }, (token) => {
            if (chrome.runtime.lastError || !token) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(token);
            }
        });
    });
}

// ---------- Fetch events for the current month ----------
async function fetchMonthEvents() {
    const token = await getAuthToken();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${startOfMonth.toISOString()}&timeMax=${endOfMonth.toISOString()}&singleEvents=true&orderBy=startTime`;

    const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
        console.error('Calendar fetch failed:', response.status, await response.text());
        return [];
    }

    const data = await response.json();
    console.log('Raw calendar response:', data);
    return data.items || [];
}

// ---------- Format event date/time for display ----------
function formatEventTime(event) {
    const start = event.start.dateTime || event.start.date; // handles all-day events too
    const date = new Date(start);

    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const timeStr = event.start.dateTime
        ? date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        : 'All day';

    return `${dateStr} · ${timeStr}`;
}

// ---------- Render events into the calendar card ----------
async function loadCalendarEvents() {
    const events = await fetchMonthEvents();
    const container = document.getElementById('calendar-events');
    container.innerHTML = '';

    if (events.length === 0) {
        container.innerHTML = '<p>No events this month.</p>';
        return;
    }

    events.forEach(event => {
        const link = document.createElement('a');
        link.href = event.htmlLink;
        link.target = '_blank';
        link.classList.add('calendar-event');

        link.innerHTML = `
            <div class="event-title">${event.summary || '(No title)'}</div>
            <div class="event-time">${formatEventTime(event)}</div>
        `;

        container.appendChild(link);
    });
}


async function addEventToCalendar(title, dateStr, timeStr) {
    const token = await getAuthToken();

    const startDateTime = new Date(`${dateStr}T${timeStr}`);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60000); // default 1hr duration

    const event = {
        summary: title,
        start: { dateTime: startDateTime.toISOString() },
        end: { dateTime: endDateTime.toISOString() }
    };

    const response = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
        }
    );

    if (!response.ok) {
        console.error('Failed to create event:', response.status, await response.text());
        return null;
    }

    return response.json();
}


document.getElementById('show-event-form-btn').addEventListener('click', () => {
    const form = document.getElementById('event-form');
    form.style.display = form.style.display === 'none' ? 'flex' : 'none';
});


document.getElementById('event-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('event-title').value.trim();
    const date = document.getElementById('event-date').value;
    const time = document.getElementById('event-time').value;

    if (!title || !date || !time) return;

    const created = await addEventToCalendar(title, date, time);
    if (created) {
        document.getElementById('event-form').reset();
        document.getElementById('event-form').style.display = 'none';
        loadCalendarEvents(); // refresh list to show the new event
    }
});

document.getElementById('refresh-calendar-btn')?.addEventListener('click', loadCalendarEvents);


document.addEventListener('DOMContentLoaded', loadCalendarEvents);