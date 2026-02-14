let wakeLock = null;
let settings = {
    rwb: false,
    life: false,
    tax: false,
    awake: true
};

document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('.quantity');
    inputs.forEach(input => {
        const savedValue = localStorage.getItem('kinnan_tracker_' + input.id);
        if (savedValue !== null) {
            input.value = savedValue;
        }
    });

    loadSettings();

    if (settings.awake) {
        requestWakeLock();
    }

    document.addEventListener('visibilitychange', async () => {
        if (wakeLock !== null && document.visibilityState === 'visible') {
            requestWakeLock();
        }
    });
});

function toggleCredits() {
    const modal = document.getElementById('credits-modal');
    modal.classList.toggle('hidden');
}

function updateValue(id, change) {
    const input = document.getElementById(id);
    let val = parseInt(input.value) || 0;
    val += change;
    saveValues(input, val);
}

function manualUpdate(inputElement) {
    let val = parseInt(inputElement.value);
    if (isNaN(val)) val = 0;
    saveValues(inputElement, val);
}

function saveValues(input, val) {
    if (val < 0) val = 0;
    if (val > 99) val = 99;
    input.value = val;
    localStorage.setItem('kinnan_tracker_' + input.id, val);
}

function resetAll() {
    const inputs = document.querySelectorAll('.quantity');
    inputs.forEach(input => {
        let defaultVal = (input.id === 'life') ? 40 : 0;
        input.value = defaultVal;
        localStorage.setItem('kinnan_tracker_' + input.id, defaultVal);
    });
}

function loadSettings() {
    const savedSettings = localStorage.getItem('kinnan_settings');
    if (savedSettings) {
        settings = JSON.parse(savedSettings);
    }
    applySettings();
}

function saveSettings() {
    localStorage.setItem('kinnan_settings', JSON.stringify(settings));
}

function applySettings() {
    const topRow = document.getElementById('top-row');
    if (!settings.life && !settings.tax) {
        topRow.classList.add('hidden');
    } else {
        topRow.classList.remove('hidden');
    }

    const tileLife = document.getElementById('tile-life');
    const btnLife = document.getElementById('btn-life');
    if (settings.life) {
        tileLife.classList.remove('hidden');
        btnLife.classList.remove('disabled');
    } else {
        tileLife.classList.add('hidden');
        btnLife.classList.add('disabled');
    }

    const tileTax = document.getElementById('tile-tax');
    const btnTax = document.getElementById('btn-tax');
    if (settings.tax) {
        tileTax.classList.remove('hidden');
        btnTax.classList.remove('disabled');
    } else {
        tileTax.classList.add('hidden');
        btnTax.classList.add('disabled');
    }

    const tilesRWB = [document.getElementById('tile-r'), document.getElementById('tile-w'), document.getElementById('tile-b')];
    const btnRWB = document.getElementById('btn-rwb');
    const tileColorless = document.getElementById('tile-c');

    if (settings.rwb) {
        tilesRWB.forEach(el => el.classList.remove('hidden'));
        btnRWB.classList.remove('disabled');
        tileColorless.classList.remove('span-full');
    } else {
        tilesRWB.forEach(el => el.classList.add('hidden'));
        btnRWB.classList.add('disabled');
        tileColorless.classList.add('span-full');
    }

    const btnAwake = document.getElementById('btn-awake');
    const iconAwake = btnAwake.querySelector('i');
    if (settings.awake) {
        btnAwake.classList.remove('disabled');
        iconAwake.className = "ms ss-foil ss-grad ms-dfc-day";
    } else {
        btnAwake.classList.add('disabled');
        iconAwake.className = "ms ms-dfc-night";
    }
}

function toggleLife() {
    settings.life = !settings.life;
    applySettings();
    saveSettings();
}

function toggleTax() {
    settings.tax = !settings.tax;
    applySettings();
    saveSettings();
}

function toggleRWB() {
    settings.rwb = !settings.rwb;
    applySettings();
    saveSettings();
}

async function toggleWakeLock() {
    settings.awake = !settings.awake;

    if (settings.awake) {
        await requestWakeLock();
    } else {
        if (wakeLock !== null) {
            await wakeLock.release();
            wakeLock = null;
        }
    }
    applySettings();
    saveSettings();
}

async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
            wakeLock.addEventListener('release', () => {
            });
        }
    } catch (err) {
        console.error(`${err.name}, ${err.message}`);
    }
}