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

    const names = ['name-p1', 'name-p2', 'name-p3', 'name-p4'];
    names.forEach(id => {
        const savedName = localStorage.getItem(id);
        if (savedName) {
            document.getElementById(id).value = savedName;
        }
    });

    for (let p = 1; p <= 4; p++) {
        for (let c = 1; c <= 2; c++) {
            const id = `cmd-p${p}-c${c}`;
            const element = document.getElementById(id);
            if (element) {
                const savedVal = localStorage.getItem(id);
                if (savedVal) element.value = savedVal;
            }
        }
    }

    const cmdNames = document.querySelectorAll('.cmd-name-input');
    cmdNames.forEach(input => {
        const savedName = localStorage.getItem('kinnan_tracker_' + input.id);
        if (savedName) {
            input.value = savedName;
        }
    });

    const allNameInputs = document.querySelectorAll('.player-name, .cmd-name-input');

    allNameInputs.forEach(input => {
        input.addEventListener('focus', function () {
            this.select();
        });
        input.addEventListener('click', function () {
            this.select();
        });
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
    const lifeEl = document.getElementById('life');
    if (lifeEl) lifeEl.value = 40;
    localStorage.setItem('kinnan_tracker_life', 40);

    const standardInputs = document.querySelectorAll('.tracker-grid .quantity');
    standardInputs.forEach(input => {
        input.value = 0;
        localStorage.setItem('kinnan_tracker_' + input.id, 0);
    });

    for (let p = 1; p <= 4; p++) {
        for (let c = 1; c <= 2; c++) {
            const id = `cmd-p${p}-c${c}`;
            const storageKey = `kinnan_tracker_${id}`;
            localStorage.setItem(storageKey, 0);
            const el = document.getElementById(id);
            if (el) {
                el.value = 0;
            }
        }
    }

    if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
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

function toggleCmdModal() {
    const modal = document.getElementById('cmd-modal');
    modal.classList.toggle('hidden');
    settings.cmdModalOpen = !modal.classList.contains('hidden');
}

function updateCmdValue(id, change) {
    const cmdInput = document.getElementById(id);
    let cmdVal = parseInt(cmdInput.value) || 0;

    if (cmdVal + change < 0) {
        return;
    }

    cmdVal += change;
    saveValues(cmdInput, cmdVal);

    const lifeInput = document.getElementById('life');
    let lifeVal = parseInt(lifeInput.value) || 0;

    lifeVal -= change;

    saveValues(lifeInput, lifeVal);
}

function savePlayerName(input) {
    localStorage.setItem('kinnan_' + input.id, input.value);
}

function saveCmdName(input) {
    localStorage.setItem('kinnan_tracker_' + input.id, input.value);
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