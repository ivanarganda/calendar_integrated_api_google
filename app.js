let monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

let today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
let events = [];

async function load_calendar_user() {
    document.getElementById('month').textContent = monthNames[currentMonth];
    document.getElementById('year').textContent = currentYear;

    window.renderCalendar = function (month, year, events = []) {
        const firstDay = new Date(year, month).getDay();
        const daysInMonth = 32 - new Date(year, month, 32).getDate();

        const calendarBody = document.getElementById('calendar-body');
        calendarBody.innerHTML = "";

        let date = 1;
        for (let i = 0; i < 6; i++) {
            let row = document.createElement('div');
            row.className = 'calendar-row';

            for (let j = 0; j < 7; j++) {
                let dayCell = document.createElement('div');
                dayCell.className = 'day-cell';

                if (i === 0 && j < firstDay) {
                    dayCell.classList.add('empty-cell');
                } else if (date > daysInMonth) {
                    break;
                } else {
                    dayCell.innerHTML = `<span class='date-number'>${date}</span>`;

                    const eventDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
                    const dayEvents = events.filter(event => event.start.dateTime?.startsWith(eventDate) || event.start.date === eventDate);

                    if (dayEvents.length > 0) {
                        dayEvents.forEach(event => {
                            let eventElement = document.createElement('div');
                            eventElement.className = 'event';
                            eventElement.innerHTML = event.summary;
                            eventElement.setAttribute('data-content', event.summary); // Full content in tooltip
                            dayCell.appendChild(eventElement);
                        });
                    }

                    date++;
                }

                row.appendChild(dayCell);
            }
            calendarBody.appendChild(row);
        }
    }

    // Do not render the calendar here; it will be rendered after events are fetched
}

document.getElementById('prev-month').addEventListener('click', async () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    await updateCalendar();
});

document.getElementById('next-month').addEventListener('click', async () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    await updateCalendar();
});

async function updateCalendar() {
    document.getElementById('month').textContent = monthNames[currentMonth];
    document.getElementById('year').textContent = currentYear;
    await listUpcomingEvents(currentMonth, currentYear);
}

// Google API related code
const CLIENT_ID = '1042512919810-3j2689t54b3g7uebj351m9bic1d98rq7.apps.googleusercontent.com';
const API_KEY = 'AIzaSyDPLYZy-AZXUdMk52CggBqVc1wM8SIYKUA';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

let tokenClient;
let gapiInited = false;
let gisInited = false;

document.getElementById('authorize_google_calendar_button').onclick = handleAuthClick;
document.getElementById('signout_button').onclick = handleSignoutClick;

function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
    });
    gapiInited = true;
    maybeEnableButtons();
}

function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // defined later
    });
    gisInited = true;
    maybeEnableButtons();
}

function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        document.getElementById('authorize_google_calendar_button').style.display = 'block';
    }
}

function handleAuthClick() {
    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            throw (resp);
        }
        document.getElementById('signout_button').style.display = 'block';
        document.getElementById('authorize_google_calendar_button').style.display = 'none';
        await listUpcomingEvents(currentMonth, currentYear);
    };

    if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        tokenClient.requestAccessToken({ prompt: '' });
    }
}

function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken('');
        document.getElementById('authorize_google_calendar_button').style.display = 'block';
        document.getElementById('signout_button').style.display = 'none';
        document.getElementById('events').innerHTML = '';
        renderCalendar(currentMonth, currentYear);
    }
}

async function listUpcomingEvents(month, year) {
    let startDate = new Date(year, month, 1).toISOString();
    let endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

    let response;
    try {
        const request = {
            'calendarId': 'primary',
            'timeMin': startDate,
            'timeMax': endDate,
            'showDeleted': false,
            'singleEvents': true,
            'maxResults': 100,
            'orderBy': 'startTime',
        };
        response = await gapi.client.calendar?.events?.list(request);
    } catch (err) {
        console.error('Error fetching calendar events:', err);
        return;
    }

    events = response?.result?.items || [];
    renderCalendar(month, year, events);
}

// Load the API client and auth2 library
gisLoaded();
gapiLoaded();

// Load the calendar on page load
window.onload = async () => {
    await load_calendar_user();
    await listUpcomingEvents(currentMonth, currentYear);
};