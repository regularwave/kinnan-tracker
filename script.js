let wakeLock = null;
let settings = {
    life: false,
    tax: false,
    awake: true
};

let pipsOpen = false;
let pipsMask = ['white', 'black', 'red'];

document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('.quantity');
    inputs.forEach(input => {
        const savedValue = localStorage.getItem('kinnan_tracker_' + input.id);
        if (savedValue !== null) {
            input.value = savedValue;
        }
    });

    loadSettings();

    const pipsBtn = document.getElementById('btn-pips');
    let pressTimer;

    pipsBtn.addEventListener('pointerdown', (e) => {
        pressTimer = setTimeout(() => {
            openPipsModal();
            pressTimer = null;
            if (navigator.vibrate) navigator.vibrate(50);
        }, 600);
    });

    pipsBtn.addEventListener('pointerup', (e) => {
        if (pressTimer) {
            clearTimeout(pressTimer);
            togglePips();
        }
    });

    pipsBtn.addEventListener('pointerleave', () => {
        if (pressTimer) clearTimeout(pressTimer);
    });

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

    const cmdNames = document.querySelectorAll('.cmd-name-input');
    cmdNames.forEach(input => {
        const savedName = localStorage.getItem('kinnan_tracker_' + input.id);
        if (savedName) input.value = savedName;
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

    const allNameInputs = document.querySelectorAll('.player-name, .cmd-name-input');

    allNameInputs.forEach(input => {
        input.addEventListener('focus', function () {
            this.select();
        });
        input.addEventListener('click', function () {
            this.select();
        });
        input.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
    });
});

function toggleCredits() {
    document.getElementById('credits-modal').classList.toggle('hidden');
}

function toggleHelp() {
    document.getElementById('help-modal').classList.toggle('hidden');
}

function toggleCmdModal() {
    document.getElementById('cmd-modal').classList.toggle('hidden');
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

function updateCmdValue(id, change) {
    const cmdInput = document.getElementById(id);
    let cmdVal = parseInt(cmdInput.value) || 0;

    if (cmdVal + change < 0) return;

    cmdVal += change;
    saveValues(cmdInput, cmdVal);

    const lifeInput = document.getElementById('life');
    let lifeVal = parseInt(lifeInput.value) || 0;
    lifeVal -= change;
    saveValues(lifeInput, lifeVal);
}

function resetAll() {
    const allInputs = document.querySelectorAll('.quantity');
    allInputs.forEach(input => {
        const defaultVal = (input.id === 'life') ? 40 : 0;
        input.value = defaultVal;
        localStorage.setItem('kinnan_tracker_' + input.id, defaultVal);
    });
    if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
}

function savePlayerName(input) {
    localStorage.setItem(input.id, input.value);
}

function saveCmdName(input) {
    localStorage.setItem('kinnan_tracker_' + input.id, input.value);
}

function loadSettings() {
    const savedSettings = localStorage.getItem('kinnan_settings');
    if (savedSettings) {
        settings = JSON.parse(savedSettings);
    }

    const savedPips = localStorage.getItem('kinnan_tracker_pipsOpen');
    if (savedPips !== null) {
        pipsOpen = (savedPips === 'true');
    }

    const savedMask = localStorage.getItem('kinnan_tracker_pipsMask');
    if (savedMask) {
        try {
            pipsMask = JSON.parse(savedMask);
        } catch (e) {
            console.error('Error parsing pips mask', e);
            pipsMask = ['white', 'black', 'red'];
        }
    }

    applySettings();
    updateManaGrid();
}

function saveSettings() {
    localStorage.setItem('kinnan_settings', JSON.stringify(settings));
    localStorage.setItem('kinnan_tracker_pipsOpen', pipsOpen);
    localStorage.setItem('kinnan_tracker_pipsMask', JSON.stringify(pipsMask));
}

function applySettings() {
    const topRow = document.getElementById('top-row');
    const tileLife = document.getElementById('tile-life');
    const btnLife = document.getElementById('btn-life');
    const tileTax = document.getElementById('tile-tax');
    const btnTax = document.getElementById('btn-tax');

    if (!settings.life && !settings.tax) {
        topRow.classList.add('hidden');
    } else {
        topRow.classList.remove('hidden');
    }

    if (settings.life) {
        tileLife.classList.remove('hidden');
        btnLife.classList.remove('disabled');
    } else {
        tileLife.classList.add('hidden');
        btnLife.classList.add('disabled');
    }

    if (settings.tax) {
        tileTax.classList.remove('hidden');
        btnTax.classList.remove('disabled');
    } else {
        tileTax.classList.add('hidden');
        btnTax.classList.add('disabled');
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

function togglePips() {
    pipsOpen = !pipsOpen;
    updateManaGrid();
    saveSettings();
}

function updateManaGrid() {
    const colorMap = {
        'white': 'tile-w',
        'blue': 'tile-u',
        'black': 'tile-b',
        'red': 'tile-r',
        'green': 'tile-g',
        'colorless': 'tile-c'
    };

    let visibleTiles = [];

    Object.keys(colorMap).forEach(color => {
        const wrapperId = colorMap[color];
        const wrapper = document.getElementById(wrapperId);
        if (!wrapper) return;

        wrapper.classList.remove('span-full');

        const isManaged = pipsMask.includes(color);
        const shouldHide = isManaged && !pipsOpen;

        if (shouldHide) {
            wrapper.classList.add('hidden');
        } else {
            wrapper.classList.remove('hidden');
            visibleTiles.push(wrapper);
        }
    });

    if (visibleTiles.length % 2 !== 0) {
        const lastTile = visibleTiles[visibleTiles.length - 1];
        lastTile.classList.add('span-full');
    }

    const btn = document.getElementById('btn-pips');
    if (pipsOpen) {
        btn.classList.remove('disabled');
        btn.style.opacity = '1';
    } else {
        btn.style.opacity = '0.5';
    }
}

function openPipsModal() {
    const modal = document.getElementById('pips-modal');
    modal.classList.remove('hidden');

    const checkboxes = document.querySelectorAll('.pip-chk');
    checkboxes.forEach(chk => {
        chk.checked = pipsMask.includes(chk.value);
    });
}

function savePipsConfig() {
    const modal = document.getElementById('pips-modal');
    const checkboxes = document.querySelectorAll('.pip-chk');

    pipsMask = [];
    checkboxes.forEach(chk => {
        if (chk.checked) {
            pipsMask.push(chk.value);
        }
    });

    modal.classList.add('hidden');

    updateManaGrid();
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
            wakeLock.addEventListener('release', () => { });
        }
    } catch (err) {
        console.error(`${err.name}, ${err.message}`);
    }
}