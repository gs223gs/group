// 参加者データを格納する配列
let participants = [];

// 参加者を追加する関数
function addParticipant() {
    const nameInput = document.getElementById('name-input');
    const genderInput = document.getElementById('gender-input');

    const name = nameInput.value.trim();
    const gender = genderInput.value;

    if (name === '') {
        alert('名前を入力してください。');
        return;
    }

    participants.push({ name, gender });
    nameInput.value = '';

    updateParticipantTable();
}

// 参加者リストを更新する関数
function updateParticipantTable() {
    const tbody = document.querySelector('#participant-table tbody');
    tbody.innerHTML = '';

    participants.forEach((participant) => {
        const tr = document.createElement('tr');
        const nameTd = document.createElement('td');
        const genderTd = document.createElement('td');

        nameTd.textContent = participant.name;
        genderTd.textContent = participant.gender === 'male' ? '男の子' : '女の子';

        tr.appendChild(nameTd);
        tr.appendChild(genderTd);
        tbody.appendChild(tr);
    });
}

// 順番を決める関数
function decideOrder() {
    const shuffled = [...participants];
    shuffleArray(shuffled);

    const orderTable = document.getElementById('order-table');
    orderTable.innerHTML = '';

    shuffled.forEach((participant, index) => {
        const tr = document.createElement('tr');
        const orderTd = document.createElement('td');
        const nameTd = document.createElement('td');
        const genderTd = document.createElement('td');

        orderTd.textContent = index + 1;
        nameTd.textContent = participant.name;
        genderTd.textContent = participant.gender === 'male' ? '男の子' : '女の子';

        tr.appendChild(orderTd);
        tr.appendChild(nameTd);
        tr.appendChild(genderTd);
        orderTable.appendChild(tr);
    });
}

// 配列をシャッフルする関数
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// グループ分けをする関数
function divideGroups() {
    const groupSizeInput = document.getElementById('group-size');
    const groupSize = parseInt(groupSizeInput.value);

    if (groupSize < 2) {
        alert('グループの人数は2人以上にしてください。');
        return;
    }

    const groupResultDiv = document.getElementById('group-result');
    groupResultDiv.innerHTML = '';

    // 男性と女性を分ける
    const males = participants.filter(p => p.gender === 'male');
    const females = participants.filter(p => p.gender === 'female');

    // シャッフル
    shuffleArray(males);
    shuffleArray(females);

    const totalParticipants = participants.length;
    const totalGroups = Math.ceil(totalParticipants / groupSize);

    // グループ配列を作成
    const groups = Array.from({ length: totalGroups }, () => []);

    let maleIndex = 0;
    let femaleIndex = 0;

    // グループに参加者を割り当てる
    for (let i = 0; i < totalGroups; i++) {
        while (groups[i].length < groupSize && (maleIndex < males.length || femaleIndex < females.length)) {
            const currentGroup = groups[i];
            const maleCount = currentGroup.filter(p => p.gender === 'male').length;
            const femaleCount = currentGroup.filter(p => p.gender === 'female').length;

            // 女の子が半数以上にならないようにする
            if (femaleCount < Math.floor(groupSize / 2) && femaleIndex < females.length) {
                currentGroup.push(females[femaleIndex++]);
            } else if (maleIndex < males.length) {
                currentGroup.push(males[maleIndex++]);
            } else if (femaleIndex < females.length) {
                currentGroup.push(females[femaleIndex++]);
            } else {
                break;
            }
        }
    }

    // 余りを最後のグループに追加
    while (maleIndex < males.length) {
        groups[groups.length - 1].push(males[maleIndex++]);
    }
    while (femaleIndex < females.length) {
        groups[groups.length - 1].push(females[femaleIndex++]);
    }

    // グループを表示
    groups.forEach((group, index) => {
        const groupDiv = document.createElement('div');
        groupDiv.classList.add('group');

        const groupTitle = document.createElement('h3');
        groupTitle.textContent = `グループ ${index + 1}`;
        groupDiv.appendChild(groupTitle);

        const table = document.createElement('table');

        group.forEach(participant => {
            const tr = document.createElement('tr');
            const nameTd = document.createElement('td');
            const genderTd = document.createElement('td');

            nameTd.textContent = participant.name;
            genderTd.textContent = participant.gender === 'male' ? '男の子' : '女の子';

            tr.appendChild(nameTd);
            tr.appendChild(genderTd);
            table.appendChild(tr);
        });

        groupDiv.appendChild(table);
        groupResultDiv.appendChild(groupDiv);
    });
}

// イベントリスナーの設定
document.getElementById('add-button').addEventListener('click', addParticipant);
document.getElementById('decide-order-button').addEventListener('click', decideOrder);
document.getElementById('divide-group-button').addEventListener('click', divideGroups);
